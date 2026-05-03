-- ============================================================
-- WRODLE ES — Supabase Schema
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================


-- ============================================================
-- 1. TABLA: profiles
--    Extiende auth.users de Supabase con username público
-- ============================================================
CREATE TABLE public.profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     text UNIQUE NOT NULL,
  created_at   timestamptz DEFAULT now()
);

-- Trigger: crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 2. TABLA: daily_games
--    Una fila por jugador por fecha (modo Diario)
-- ============================================================
CREATE TABLE public.daily_games (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date        date NOT NULL,
  answer      text NOT NULL,
  guesses     text[] NOT NULL DEFAULT '{}',
  states      jsonb NOT NULL DEFAULT '[]',
  won         boolean NOT NULL DEFAULT false,
  attempts    int CHECK (attempts BETWEEN 1 AND 6),
  completed   boolean NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),

  CONSTRAINT daily_games_user_date_unique UNIQUE (user_id, date)
);

-- Trigger: actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER daily_games_updated_at
  BEFORE UPDATE ON public.daily_games
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 3. TABLA: stats
--    Una fila por usuario por modo (daily / infinite)
-- ============================================================
CREATE TABLE public.stats (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mode            text NOT NULL CHECK (mode IN ('daily', 'infinite')),
  played          int NOT NULL DEFAULT 0,
  wins            int NOT NULL DEFAULT 0,
  current_streak  int NOT NULL DEFAULT 0,
  max_streak      int NOT NULL DEFAULT 0,
  distribution    int[] NOT NULL DEFAULT '{0,0,0,0,0,0}',
  updated_at      timestamptz DEFAULT now(),

  CONSTRAINT stats_user_mode_unique UNIQUE (user_id, mode)
);

CREATE TRIGGER stats_updated_at
  BEFORE UPDATE ON public.stats
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Función: inicializar stats al crear perfil
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.stats (user_id, mode) VALUES (NEW.id, 'daily');
  INSERT INTO public.stats (user_id, mode) VALUES (NEW.id, 'infinite');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();


-- ============================================================
-- 4. VISTA: ranking
--    Leaderboard global calculado desde stats
-- ============================================================
CREATE OR REPLACE VIEW public.ranking AS
SELECT
  s.user_id,
  p.username,
  s.mode,
  s.played,
  s.wins,
  CASE
    WHEN s.played = 0 THEN 0
    ELSE ROUND((s.wins::numeric / s.played) * 100, 1)
  END AS win_rate,
  s.current_streak,
  s.max_streak,
  s.distribution
FROM public.stats s
JOIN public.profiles p ON p.id = s.user_id
WHERE s.played > 0
ORDER BY s.wins DESC, win_rate DESC, s.max_streak DESC;


-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfiles visibles para todos"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Usuario actualiza su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- daily_games
ALTER TABLE public.daily_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario ve sus propias partidas"
  ON public.daily_games FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuario inserta sus propias partidas"
  ON public.daily_games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuario actualiza sus propias partidas"
  ON public.daily_games FOR UPDATE
  USING (auth.uid() = user_id);


-- stats
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stats visibles para todos (ranking)"
  ON public.stats FOR SELECT
  USING (true);

CREATE POLICY "Usuario actualiza sus propias stats"
  ON public.stats FOR UPDATE
  USING (auth.uid() = user_id);


-- ============================================================
-- 6. ÍNDICES para performance
-- ============================================================
CREATE INDEX idx_daily_games_user_id   ON public.daily_games(user_id);
CREATE INDEX idx_daily_games_date      ON public.daily_games(date);
CREATE INDEX idx_stats_user_id         ON public.stats(user_id);
CREATE INDEX idx_stats_mode            ON public.stats(mode);
CREATE INDEX idx_stats_wins            ON public.stats(wins DESC);

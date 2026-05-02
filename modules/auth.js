// modules/auth.js

const USER_KEY = 'wordle_user';

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveUser(username) {
  localStorage.setItem(USER_KEY, JSON.stringify({ username, createdAt: Date.now() }));
}

export function logout() {
  localStorage.removeItem(USER_KEY);
  location.reload();
}

export function isLoggedIn() {
  return getUser() !== null;
}
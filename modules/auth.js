import { signUp, signIn, signOut, getCurrentUser } from './supabase.js';
 
export async function register(username, email, password) {
  const data = await signUp(email, password, username);
  return data;
}
 
export async function login(email, password) {
  const data = await signIn(email, password);
  return data;
}
 
export async function logout() {
  await signOut();
  location.replace('./login.html');
}
 
export async function getUser() {
  return await getCurrentUser();
}
 
export async function isLoggedIn() {
  const user = await getCurrentUser();
  return user !== null;
}
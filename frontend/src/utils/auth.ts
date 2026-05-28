import { TOKEN_KEY, USER_KEY } from './constants';
import { User } from '@/types';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);

export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

export const getUser = (): User | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const setUser = (user: User): void =>
  localStorage.setItem(USER_KEY, JSON.stringify(user));

export const removeUser = (): void => localStorage.removeItem(USER_KEY);

export const clearAuth = (): void => {
  removeToken();
  removeUser();
};

export const isAuthenticated = (): boolean => !!getToken();

export const isAdmin = (): boolean => getUser()?.role === 'ADMIN';

export const isStudent = (): boolean => getUser()?.role === 'STUDENT';

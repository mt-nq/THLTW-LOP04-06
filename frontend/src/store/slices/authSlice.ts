import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';
import { getUser, setToken, setUser, clearAuth } from '@/utils/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: getUser(),
  isAuthenticated: !!getUser(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      setToken(action.payload.token);
      setUser(action.payload.user);
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      clearAuth();
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;

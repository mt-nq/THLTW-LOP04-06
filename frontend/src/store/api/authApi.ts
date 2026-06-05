import { baseApi } from './baseApi';
import { ApiResponse, LoginRequest, LoginResponse, RegisterRequest } from '@/types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<LoginResponse>, LoginRequest>({
      query: (body) => ({ url: '/api/auth/login', method: 'POST', body }),
    }),
    register: builder.mutation<ApiResponse<void>, RegisterRequest>({
      query: (body) => ({ url: '/api/auth/register', method: 'POST', body }),
    }),
    getMe: builder.query<ApiResponse<LoginResponse>, void>({
      query: () => '/api/auth/me',
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetMeQuery } = authApi;

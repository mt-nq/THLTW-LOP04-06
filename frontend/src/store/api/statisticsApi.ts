import { baseApi } from './baseApi';
import { ApiResponse, DashboardStats, MonthlyStatItem, BorrowResponse } from '@/types';

export const statisticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => '/api/statistics/dashboard',
      providesTags: ['Statistics'],
    }),
    getMonthlyStats: builder.query<ApiResponse<MonthlyStatItem[]>, { month?: number; year?: number }>({
      query: ({ month, year } = {}) => {
        const params = new URLSearchParams();
        if (month) params.set('month', month.toString());
        if (year) params.set('year', year.toString());
        return `/api/statistics/monthly?${params.toString()}`;
      },
      providesTags: ['Statistics'],
    }),
    getOverdue: builder.query<ApiResponse<BorrowResponse[]>, void>({
      query: () => '/api/statistics/overdue',
      providesTags: ['Statistics'],
    }),
  }),
});

export const { useGetDashboardQuery, useGetMonthlyStatsQuery, useGetOverdueQuery } = statisticsApi;

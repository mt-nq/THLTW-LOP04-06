import { baseApi } from './baseApi';
import { ApiResponse, BorrowResponse, BorrowCreateRequest, ExtendBorrowRequest } from '@/types';

export const borrowApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllBorrows: builder.query<ApiResponse<BorrowResponse[]>, void>({
      query: () => '/api/borrows',
      providesTags: ['Borrow'],
    }),
    getMyBorrows: builder.query<ApiResponse<BorrowResponse[]>, void>({
      query: () => '/api/borrows/my',
      providesTags: ['Borrow'],
    }),
    createBorrow: builder.mutation<ApiResponse<BorrowResponse>, BorrowCreateRequest>({
      query: (body) => ({ url: '/api/borrows', method: 'POST', body }),
      invalidatesTags: ['Borrow', 'Equipment'],
    }),
    approveBorrow: builder.mutation<ApiResponse<BorrowResponse>, { id: number; adminNote?: string }>({
      query: ({ id, adminNote }) => ({ url: `/api/borrows/${id}/approve`, method: 'PUT', body: { adminNote } }),
      invalidatesTags: ['Borrow', 'Equipment', 'Statistics'],
    }),
    rejectBorrow: builder.mutation<ApiResponse<BorrowResponse>, { id: number; adminNote?: string }>({
      query: ({ id, adminNote }) => ({ url: `/api/borrows/${id}/reject`, method: 'PUT', body: { adminNote } }),
      invalidatesTags: ['Borrow'],
    }),
    returnBorrow: builder.mutation<ApiResponse<BorrowResponse>, number>({
      query: (id) => ({ url: `/api/borrows/${id}/return`, method: 'PUT' }),
      invalidatesTags: ['Borrow', 'Equipment', 'Statistics'],
    }),
    extendBorrow: builder.mutation<ApiResponse<BorrowResponse>, { id: number; data: ExtendBorrowRequest }>({
      query: ({ id, data }) => ({ url: `/api/borrows/${id}/extend`, method: 'POST', body: data }),
      invalidatesTags: ['Borrow'],
    }),
  }),
});

export const {
  useGetAllBorrowsQuery,
  useGetMyBorrowsQuery,
  useCreateBorrowMutation,
  useApproveBorrowMutation,
  useRejectBorrowMutation,
  useReturnBorrowMutation,
  useExtendBorrowMutation,
} = borrowApi;

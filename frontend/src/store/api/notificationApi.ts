import { baseApi } from './baseApi';
import { ApiResponse, NotificationItem } from '@/types';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<ApiResponse<NotificationItem[]>, void>({
      query: () => '/api/notifications',
      providesTags: ['Notification'],
    }),
    markRead: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({ url: `/api/notifications/${id}/read`, method: 'PUT' }),
      invalidatesTags: ['Notification'],
    }),
    getUnreadCount: builder.query<ApiResponse<{ count: number }>, void>({
      query: () => '/api/notifications/unread-count',
      providesTags: ['Notification'],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkReadMutation, useGetUnreadCountQuery } = notificationApi;

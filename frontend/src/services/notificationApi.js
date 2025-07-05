import { apiSlice } from './apiSlice';

export const notificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification'],
      pollingInterval: 30000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      keepUnusedDataFor: 300,
      skipPollingIfUnfocused: false,
    }),
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi; 
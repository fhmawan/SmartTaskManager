import { apiSlice } from './apiSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/auth/change-password',
        method: 'PUT',
        body: passwordData,
      }),
    }),
    deleteAccount: builder.mutation({
      query: (passwordData) => ({
        url: '/auth/delete-account',
        method: 'DELETE',
        body: passwordData,
      }),
    }),
  }),
});

export const { 
  useLoginMutation, 
  useRegisterMutation, 
  useGetMeQuery,
  useChangePasswordMutation,
  useDeleteAccountMutation
} = authApi; 
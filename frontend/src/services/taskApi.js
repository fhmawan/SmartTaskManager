import { apiSlice } from './apiSlice';

export const taskApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query({
      query: (params) => ({
        url: '/tasks',
        params,
      }),
      providesTags: ['Task'],
    }),
    createTask: builder.mutation({
      query: (taskData) => ({
        url: '/tasks',
        method: 'POST',
        body: taskData,
      }),
      invalidatesTags: ['Task'],
    }),
    updateTask: builder.mutation({
      query: ({ id, ...taskData }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body: taskData,
      }),
      invalidatesTags: ['Task'],
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task'],
    }),
    completeTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}/complete`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useCompleteTaskMutation,
} = taskApi; 
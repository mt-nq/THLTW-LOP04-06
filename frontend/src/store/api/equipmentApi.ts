import { baseApi } from './baseApi';
import { ApiResponse, Equipment, EquipmentRequest } from '@/types';

export const equipmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEquipment: builder.query<ApiResponse<Equipment[]>, { search?: string; admin?: boolean }>({
      query: ({ search, admin } = {}) => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (admin) params.set('admin', 'true');
        return `/api/equipment?${params.toString()}`;
      },
      providesTags: ['Equipment'],
    }),
    getEquipmentById: builder.query<ApiResponse<Equipment>, number>({
      query: (id) => `/api/equipment/${id}`,
      providesTags: ['Equipment'],
    }),
    createEquipment: builder.mutation<ApiResponse<Equipment>, EquipmentRequest>({
      query: (body) => ({ url: '/api/equipment', method: 'POST', body }),
      invalidatesTags: ['Equipment'],
    }),
    updateEquipment: builder.mutation<ApiResponse<Equipment>, { id: number; data: EquipmentRequest }>({
      query: ({ id, data }) => ({ url: `/api/equipment/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Equipment'],
    }),
    deleteEquipment: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({ url: `/api/equipment/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Equipment'],
    }),
  }),
});

export const {
  useGetEquipmentQuery,
  useGetEquipmentByIdQuery,
  useCreateEquipmentMutation,
  useUpdateEquipmentMutation,
  useDeleteEquipmentMutation,
} = equipmentApi;

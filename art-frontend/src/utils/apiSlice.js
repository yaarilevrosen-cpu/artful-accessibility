import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
    baseUrl : process.env.REACT_APP_BASE_URL,
    timeout: 10000,
    // credentials: true, //// <= Accept credentials (cookies) sent by the client
    prepareHeaders : (headers, {getState}) =>{
       
        headers.append("Access-Control-Allow-Origin", '*')
        headers.append("content-type", 'application/json')

        return headers
    }
})


export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQuery,
    tagTypes: ['Paintings', 'PaintingStats'],
    endpoints: (builder) => ({
        getPaintings: builder.query({
            query: () => {
                return {
                    url: `/paintings`,
                };
            },
            providesTags: ['Paintings'],
        }),
        getPaintingStats: builder.query({
            query: () => ({
                url: '/paintings/painting_stats',
            }),
            providesTags: ['PaintingStats'],
        }),
        
        
        
        addPaintings: builder.mutation({
            query: (data) => {
                return {
                    url: '/paintings/',
                    method: 'POST',
                    body: data,
                };
            },
            invalidatesTags: ['Paintings'],
        }),
        deletePaintings: builder.mutation({
            query: ({ _id }) => {
                return {
                    url: `/paintings/${_id}`,
                    method: 'DELETE',
                };
            },
            invalidatesTags: ['Paintings'],
        }),
        updatePainting: builder.mutation({
            query: (data) => {
                return {
                    url: `/paintings/${data.sys_id}`,
                    method: 'PUT',
                    body: { data },
                };
            },
            invalidatesTags: ['Paintings'],
        }),

       
    }),
});

export const {
    useGetPaintingsQuery,
    useGetPaintingStatsQuery, // 
    useAddPaintingsMutation,
    useDeletePaintingsMutation,
    useUpdatePaintingMutation,
} = apiSlice;

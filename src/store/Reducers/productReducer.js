import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { api_url } from '../../utils/utils'

export const add_product = createAsyncThunk(
    'product/add_product',
    async (product, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await axios.post(`${api_url}/api/product-add`, product, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const update_product = createAsyncThunk(
    'product/updateProduct',
    async (product, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await axios.post(`${api_url}/api/product-update`, product, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const product_image_update = createAsyncThunk(
    'product/product_image_update',
    async ({ oldImage, newImage, productId }, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const formData = new FormData()
            formData.append('oldImage', oldImage)
            formData.append('newImage', newImage)
            formData.append('productId', productId)
            const { data } = await axios.post(`${api_url}/api/product-image-update`, formData, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const get_products = createAsyncThunk(
    'product/get_products',
    async ({ parPage, page, searchValue }, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await axios.get(`${api_url}/api/products-get?page=${page}&&searchValue=${searchValue}&&parPage=${parPage}`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)


export const delete_product = createAsyncThunk(
    'product/delete_product',
    async (productId, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

        try {
            const { data } = await axios.delete(
                `${api_url}/api/product/delete/${productId}`,
                config
            )
            return fulfillWithValue({ productId, message: data.message })
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)


export const get_product = createAsyncThunk(
    'product/get_product',
    async (productId, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await axios.get(`${api_url}/api/product-get/${productId}`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const approve_product = createAsyncThunk(
    'product/approve_product',
    async (productId, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        try {
            const { data } = await axios.put(
                `${api_url}/api/product/approve/${productId}`,
                {},
                config
            )
            return fulfillWithValue({ productId, message: data.message })
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const reject_product = createAsyncThunk(
    'product/reject_product',
    async (productId, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        try {
            const { data } = await axios.put(
                `${api_url}/api/product/reject/${productId}`,
                {},
                config
            )
            return fulfillWithValue({ productId, message: data.message })
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)
export const admin_get_products = createAsyncThunk(
    'product/admin_get_products',
    async ({ parPage, page, searchValue }, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        try {
            const { data } = await axios.get(
                `${api_url}/api/admin/products-get?page=1&&searchValue=${searchValue}&&parPage=${parPage}`,
                config
            )
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const get_product_full_details = createAsyncThunk(
    'product/get_product_full_details',
    async (productId, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token;
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        try {
            const { data } = await axios.get(
                `${api_url}/api/admin/product-details/${productId}`,
                config
            );
            return fulfillWithValue(data.product);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const productReducer = createSlice({
    name: 'product',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        products: [],
        product: '',
        totalProduct: 0
    },
    reducers: {
        messageClear: (state, _) => {
            state.errorMessage = ""
            state.successMessage = ""
        }
    },
    extraReducers: {
        [add_product.pending]: (state, _) => {
            state.loader = true
        },
        [add_product.rejected]: (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload.error
        },
        [add_product.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.successMessage = payload.message
        },
        [get_products.fulfilled]: (state, { payload }) => {
            state.totalProduct = payload.totalProduct
            state.products = payload.products
        },
        [get_product.fulfilled]: (state, { payload }) => {
            state.product = payload.product
        },
        [update_product.pending]: (state, _) => {
            state.loader = true
        },
        [update_product.rejected]: (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload.error
        },
        [update_product.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.product = payload.product
            state.successMessage = payload.message
        },
        [product_image_update.fulfilled]: (state, { payload }) => {
            state.product = payload.product
            state.successMessage = payload.message
        },
        [delete_product.pending]: (state) => {
            state.loader = true
        },
        [delete_product.rejected]: (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload.error
        },
        [delete_product.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.successMessage = payload.message

            // remove product from list instantly (no refetch needed)
            state.products = state.products.filter(
                p => p._id !== payload.productId
            )
        },
        [approve_product.pending]: (state) => {
            state.loader = true
        },
        [approve_product.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.successMessage = payload.message
            // optional: status update without refetch
            state.products = state.products.map(p =>
                p._id === payload.productId
                    ? { ...p, approval_status: 'approved' }
                    : p
            )
        },
        [approve_product.rejected]: (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload?.error
        },

        [reject_product.pending]: (state) => {
            state.loader = true
        },
        [reject_product.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.successMessage = payload.message
            state.products = state.products.map(p =>
                p._id === payload.productId
                    ? { ...p, approval_status: 'rejected' }
                    : p
            )
        },
        [reject_product.rejected]: (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload?.error
        },
        [admin_get_products.fulfilled]: (state, { payload }) => {
            state.totalProduct = payload.totalProduct
            state.products = payload.products
        },
        [get_product_full_details.fulfilled]: (state, { payload }) => {
            state.product = payload;
        },
    }




})
export const { messageClear } = productReducer.actions
export default productReducer.reducer
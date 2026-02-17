import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { api_url } from '../../utils/utils'


// ================= GET SELLER REQUEST =================

export const get_seller_request = createAsyncThunk(
    'seller/get_seller_request',
    async ({ parPage, page, searchValue }, { rejectWithValue, getState }) => {
        const token = getState().auth.token

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

        try {
            const { data } = await axios.get(
                `${api_url}/api/request-seller-get?page=${page}&&searchValue=${searchValue}&&parPage=${parPage}`,
                config
            )
            return data
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)


// ================= GET SINGLE SELLER =================

export const get_seller = createAsyncThunk(
    'seller/get_seller',
    async (sellerId, { rejectWithValue, getState }) => {
        const token = getState().auth.token

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

        try {
            const { data } = await axios.get(
                `${api_url}/api/get-seller/${sellerId}`,
                config
            )
            return data
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)


// ================= UPDATE SELLER STATUS =================

export const seller_status_update = createAsyncThunk(
    'seller/seller_status_update',
    async (info, { rejectWithValue, getState }) => {
        const token = getState().auth.token

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

        try {
            const { data } = await axios.post(
                `${api_url}/api/seller-status-update`,
                info,
                config
            )
            return data
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)


// ================= GET ACTIVE SELLERS =================

export const get_active_sellers = createAsyncThunk(
    'seller/get_active_sellers',
    async ({ parPage, page, searchValue }, { rejectWithValue, getState }) => {

        const token = getState().auth.token

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

        try {
            const { data } = await axios.get(
                `${api_url}/api/get-sellers?page=${page}&&searchValue=${searchValue}&&parPage=${parPage}`,
                config
            )
            return data
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)


// ================= GET DEACTIVE SELLERS (FIXED ACTION TYPE) =================

export const get_deactive_sellers = createAsyncThunk(
    'seller/get_deactive_sellers',
    async ({ parPage, page, searchValue }, { rejectWithValue, getState }) => {

        const token = getState().auth.token

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

        try {
            const { data } = await axios.get(
                `${api_url}/api/get-deactive-sellers?page=${page}&&searchValue=${searchValue}&&parPage=${parPage}`,
                config
            )
            return data
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)


// ================= CREATE RAZORPAY ACCOUNT =================

export const create_razorpay_account = createAsyncThunk(
    'seller/create_razorpay_account',
    async (_, { getState, rejectWithValue }) => {

        const token = getState().auth.token

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

        try {

            const { data } = await axios.post(
                `${api_url}/api/payment/create-razorpay-account`,
                {},
                config
            )

            // redirect to onboarding
            window.location.href = data.url

            return data

        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: 'Something went wrong' }
            )
        }
    }
)


// ================= ACTIVATE PAYMENT ACCOUNT =================

export const active_stripe_connect_account = createAsyncThunk(
    'seller/active_stripe_connect_account',
    async (activeCode, { rejectWithValue, getState }) => {

        const token = getState().auth.token

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

        try {
            const { data } = await axios.put(
                `${api_url}/api/payment/active-stripe-connect-account/${activeCode}`,
                {},
                config
            )
            return data
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)



// ================= SLICE =================

export const sellerReducer = createSlice({
    name: 'seller',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        sellers: [],
        totalSeller: 0,
        seller: ''
    },

    reducers: {
        messageClear: (state) => {
            state.errorMessage = ''
            state.successMessage = ''
        }
    },

    extraReducers: (builder) => {

        builder

            // GET SELLER REQUEST
            .addCase(get_seller_request.fulfilled, (state, { payload }) => {
                state.sellers = payload.sellers
                state.totalSeller = payload.totalSeller
            })

            // GET SINGLE SELLER
            .addCase(get_seller.fulfilled, (state, { payload }) => {
                state.seller = payload.seller
            })

            // UPDATE STATUS
            .addCase(seller_status_update.fulfilled, (state, { payload }) => {
                state.seller = payload.seller
                state.successMessage = payload.message
            })

            // ACTIVE SELLERS
            .addCase(get_active_sellers.fulfilled, (state, { payload }) => {
                state.sellers = payload.sellers
                state.totalSeller = payload.totalSeller
            })

            // CREATE RAZORPAY ACCOUNT
            .addCase(create_razorpay_account.pending, (state) => {
                state.loader = true
            })
            .addCase(create_razorpay_account.rejected, (state, { payload }) => {
                state.loader = false
                state.errorMessage = payload?.message
            })
            .addCase(create_razorpay_account.fulfilled, (state) => {
                state.loader = false
            })

            // ACTIVATE ACCOUNT
            .addCase(active_stripe_connect_account.pending, (state) => {
                state.loader = true
            })
            .addCase(active_stripe_connect_account.rejected, (state, { payload }) => {
                state.loader = false
                state.errorMessage = payload?.message
            })
            .addCase(active_stripe_connect_account.fulfilled, (state, { payload }) => {
                state.loader = false
                state.successMessage = payload.message
            })
    }
})

export const { messageClear } = sellerReducer.actions
export default sellerReducer.reducer

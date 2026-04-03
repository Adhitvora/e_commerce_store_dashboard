import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { api_url } from '../../utils/utils'

export const get_seller_dashboard_index_data = createAsyncThunk(
    'dashboardIndex/get_seller_dashboard_index_data',
    async (_, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await axios.get(`${api_url}/api/seller/get-dashboard-index-data`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const get_admin_dashboard_index_data = createAsyncThunk(
    'dashboardIndex/get_admin_dashboard_index_data',
    async (_, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await axios.get(`${api_url}/api/admin/get-dashboard-index-data`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)



export const dashboardIndexReducer = createSlice({
    name: 'dashboardIndex',
    initialState: {
        totalSale: 0,
        totalOrder: 0,
        totalProduct: 0,
        totalPendingOrder: 0,
        totalSeller: 0,
        totalProductValue: 0,
        totalDiscount: 0,
        totalShipping: 0,
        totalCommission: 0,
        netEarnings: 0,
        totalAdminRevenue: 0,
        totalCommissionEarned: 0,
        totalShippingCollected: 0,
        paidRevenue: 0,
        cashPendingRevenue: 0,
        codOrdersCount: 0,
        onlineOrdersCount: 0,
        recentOrders: [],
        recentMessage: []
    },
    reducers: {
        messageClear: (state, _) => {
            state.errorMessage = ""
            state.successMessage = ""
        }
    },
    extraReducers: {
        [get_seller_dashboard_index_data.fulfilled]: (state, { payload }) => {
            state.totalSale = payload.totalSale
            state.totalOrder = payload.totalOrder
            state.totalProduct = payload.totalProduct
            state.totalPendingOrder = payload.totalPendingOrder
            state.totalProductValue = payload.totalProductValue || 0
            state.totalDiscount = payload.totalDiscount || 0
            state.totalShipping = payload.totalShipping || 0
            state.totalCommission = payload.totalCommission || 0
            state.netEarnings = payload.netEarnings || 0
            state.paidRevenue = payload.paidRevenue || 0
            state.cashPendingRevenue = payload.cashPendingRevenue || 0
            state.codOrdersCount = payload.codOrdersCount || 0
            state.onlineOrdersCount = payload.onlineOrdersCount || 0
            state.recentOrders = payload.recentOrders
            state.recentMessage = payload.messages
        },
        [get_admin_dashboard_index_data.fulfilled]: (state, { payload }) => {
            state.totalSale = payload.totalSale
            state.totalOrder = payload.totalOrder
            state.totalProduct = payload.totalProduct
            state.totalSeller = payload.totalSeller
            state.totalProductValue = payload.totalProductValue || 0
            state.totalDiscount = payload.totalDiscount || 0
            state.totalShippingCollected = payload.totalShippingCollected || 0
            state.totalCommissionEarned = payload.totalCommissionEarned || 0
            state.totalAdminRevenue = payload.totalAdminRevenue || 0
            state.paidRevenue = payload.paidRevenue || 0
            state.cashPendingRevenue = payload.cashPendingRevenue || 0
            state.codOrdersCount = payload.codOrdersCount || 0
            state.onlineOrdersCount = payload.onlineOrdersCount || 0
            state.recentOrders = payload.recentOrders
            state.recentMessage = payload.messages
        }
    }

})
export const { messageClear } = dashboardIndexReducer.actions
export default dashboardIndexReducer.reducer

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'

export const get_shipping_settings = createAsyncThunk(
    'shippingSettings/get_settings',
    async (_, { rejectWithValue, fulfillWithValue, getState }) => {
        try {
            const token = getState().auth.token
            const { data } = await api.get('/admin/settings', {
                headers: { authorization: `Bearer ${token}` }
            })
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response?.data)
        }
    }
)

export const update_shipping_settings = createAsyncThunk(
    'shippingSettings/update_settings',
    async (settingsData, { rejectWithValue, fulfillWithValue, getState }) => {
        try {
            const token = getState().auth.token
            const { data } = await api.put('/admin/settings', settingsData, {
                headers: { authorization: `Bearer ${token}` }
            })
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response?.data)
        }
    }
)

export const shippingSettingsReducer = createSlice({
    name: 'shippingSettings',
    initialState: {
        settings: { shipping_fee: 0 },
        loader: false,
        successMessage: '',
        errorMessage: ''
    },
    reducers: {
        messageClear: (state) => {
            state.successMessage = ''
            state.errorMessage = ''
        }
    },
    extraReducers: {
        [get_shipping_settings.pending]: (state) => {
            state.loader = true
        },
        [get_shipping_settings.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.settings = payload.settings
        },
        [get_shipping_settings.rejected]: (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload?.error || 'Failed to load shipping settings'
        },
        [update_shipping_settings.pending]: (state) => {
            state.loader = true
        },
        [update_shipping_settings.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.settings = payload.settings
            state.successMessage = payload.message
        },
        [update_shipping_settings.rejected]: (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload?.error || 'Failed to update shipping settings'
        }
    }
})

export const { messageClear } = shippingSettingsReducer.actions
export default shippingSettingsReducer.reducer

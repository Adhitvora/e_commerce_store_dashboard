import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/api'

export const get_commission_settings = createAsyncThunk(
    'commission/get_settings',
    async (_, { rejectWithValue, fulfillWithValue, getState }) => {
        try {
            const token = getState().auth.token
            const { data } = await api.get('/admin/commission-settings', {
                headers: { authorization: `Bearer ${token}` }
            })
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response?.data)
        }
    }
)

export const update_commission_settings = createAsyncThunk(
    'commission/update_settings',
    async (settingsData, { rejectWithValue, fulfillWithValue, getState }) => {
        try {
            const token = getState().auth.token
            const { data } = await api.put('/admin/commission-settings', settingsData, {
                headers: { authorization: `Bearer ${token}` }
            })
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response?.data)
        }
    }
)

export const commissionReducer = createSlice({
    name: 'commission',
    initialState: {
        settings: { commission_percent: 0 },
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
        [get_commission_settings.pending]: (state) => {
            state.loader = true
        },
        [get_commission_settings.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.settings = payload.settings
        },
        [get_commission_settings.rejected]: (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload?.error || 'Failed to load settings'
        },
        [update_commission_settings.pending]: (state) => {
            state.loader = true
        },
        [update_commission_settings.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.settings = payload.settings
            state.successMessage = payload.message
        },
        [update_commission_settings.rejected]: (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload?.error || 'Failed to update settings'
        }
    }
})

export const { messageClear } = commissionReducer.actions
export default commissionReducer.reducer

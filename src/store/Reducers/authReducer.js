import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import jwt from 'jwt-decode'
import axios from 'axios'
import { api_url } from '../../utils/utils'

const normalizeAccountStatus = (payload = {}) => {
    const explicitStatus = payload.accountStatus || payload.userInfo?.accountStatus
    const sellerStatus = payload.userInfo?.status

    if (explicitStatus) {
        return explicitStatus
    }

    if (sellerStatus === 'deactive') {
        return 'inactive'
    }

    return sellerStatus || ''
}

const normalizeAdminRemark = (payload = {}) => {
    return payload.adminRemark || payload.userInfo?.adminRemark || ''
}

const normalizeRestrictedState = (payload = {}) => {
    return Boolean(
        payload.restricted ||
        payload.userInfo?.isRestricted ||
        normalizeAccountStatus(payload) === 'inactive' ||
        payload.userInfo?.verificationStatus === 'rejected'
    )
}

export const admin_login = createAsyncThunk(
    'auth/admin_login',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await axios.post(`${api_url}/api/admin-login`, info)
            localStorage.setItem('accessToken', data.token)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const seller_login = createAsyncThunk(
    'auth/seller_login',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await axios.post(`${api_url}/api/seller-login`, info, { withCredentials: true })
            localStorage.setItem('accessToken', data.token)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const complete_seller_verification = createAsyncThunk(
    'auth/complete_seller_verification',
    async (formData, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

        try {
            const { data } = await axios.post(
                `${api_url}/api/seller/complete-verification`,
                formData,
                config
            )
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)
export const logout = createAsyncThunk(
    'auth/logout',
    async ({ navigate, role }, { rejectWithValue }) => {
        try {
            //const { data } = await axios.get('/logout', { withCredentials: true })
            localStorage.removeItem('accessToken')
            if (role === 'admin') {
                navigate('/admin/login')
            } else {
                navigate('/login')
            }
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)


export const seller_register = createAsyncThunk(
    'auth/seller_register',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await axios.post(`${api_url}/api/seller-register`, info, { withCredentials: true })
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)


export const profile_image_upload = createAsyncThunk(
    'auth/profile_image_upload',
    async (image, { rejectWithValue, fulfillWithValue, getState }) => {

        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }

        try {
            const { data } = await axios.post(`${api_url}/api/profile-image-upload`, image, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const profile_info_add = createAsyncThunk(
    'auth/profile_info_add',
    async (info, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await axios.post(`${api_url}/api/profile-info-add`, info, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)




export const get_user_info = createAsyncThunk(
    'auth/get_user_info',
    async (_, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await axios.get(`${api_url}/api/get-user`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

const returnRole = (token) => {
    if (token) {
        const decodeToken = jwt(token)
        const expireTime = new Date(decodeToken.exp * 1000)
        if (new Date() > expireTime) {
            localStorage.removeItem('accessToken')
            return ''
        } else {
            return decodeToken.role
        }
    } else {
        return ''
    }
}


export const authReducer = createSlice({
    name: 'auth',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        userInfo: '',
        verificationStatus: '',
        accountStatus: '',
        adminRemark: '',
        restricted: false,
        requiresVerification: false,
        waitingApproval: false,
        role: returnRole(localStorage.getItem('accessToken')),
        token: localStorage.getItem('accessToken')
    },
    reducers: {
        messageClear: (state, _) => {
            state.errorMessage = ""
            state.successMessage = ""
        }
    },
    extraReducers: {
        [admin_login.pending]: (state, _) => {
            state.loader = true
        },
        [admin_login.rejected]: (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload.error
        },
        [admin_login.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.successMessage = payload.message
            state.token = payload.token
            state.role = returnRole(payload.token)
        },
        [seller_login.pending]: (state, _) => {
            state.loader = true
            state.errorMessage = ''
        },
        [seller_login.rejected]: (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload?.error || payload?.message || 'Login failed'
        },
        [seller_login.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.successMessage = payload.message
            state.token = payload.token
            state.role = returnRole(payload.token)
            state.verificationStatus = payload.verificationStatus || ''
            state.accountStatus = normalizeAccountStatus(payload)
            state.adminRemark = normalizeAdminRemark(payload)
            state.restricted = normalizeRestrictedState(payload)
            state.requiresVerification = Boolean(payload.requiresVerification)
            state.waitingApproval = Boolean(payload.waitingApproval)
        },
        [seller_register.pending]: (state, _) => {
            state.loader = true
        },
        [seller_register.rejected]: (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload?.error || payload?.message || 'Registration failed'
        },
        [seller_register.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.successMessage = payload?.message || 'Registration successful. Please verify your email.'
        },
        [get_user_info.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.userInfo = payload.userInfo
            state.role = payload.userInfo.role
            state.verificationStatus = payload.verificationStatus || payload.userInfo?.verificationStatus || ''
            state.accountStatus = normalizeAccountStatus(payload)
            state.adminRemark = normalizeAdminRemark(payload)
            state.restricted = normalizeRestrictedState(payload)
            state.requiresVerification = Boolean(payload.requiresVerification)
            state.waitingApproval = Boolean(payload.waitingApproval)
        },
        [profile_image_upload.pending]: (state, _) => {
            state.loader = true
        },
        [profile_image_upload.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.userInfo = payload.userInfo
            state.successMessage = payload.message
            state.verificationStatus = payload.userInfo?.verificationStatus || state.verificationStatus
            state.accountStatus = normalizeAccountStatus(payload)
            state.adminRemark = normalizeAdminRemark(payload)
            state.restricted = normalizeRestrictedState(payload)
        },
        [profile_info_add.pending]: (state, _) => {
            state.loader = true
        },
        [profile_info_add.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.userInfo = payload.userInfo
            state.successMessage = payload.message
            state.verificationStatus = payload.userInfo?.verificationStatus || state.verificationStatus
            state.accountStatus = normalizeAccountStatus(payload)
            state.adminRemark = normalizeAdminRemark(payload)
            state.restricted = normalizeRestrictedState(payload)
        },
        [complete_seller_verification.pending]: (state) => {
            state.loader = true
            state.errorMessage = ''
        },
        [complete_seller_verification.rejected]: (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload?.error || payload?.message || 'Verification submission failed'
        },
        [complete_seller_verification.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.userInfo = payload.seller
            state.successMessage = payload.message
            state.verificationStatus = payload.seller?.verificationStatus || 'pending_admin'
            state.accountStatus = normalizeAccountStatus(payload)
            state.adminRemark = ''
            state.restricted = false
            state.requiresVerification = false
            state.waitingApproval = true
        },
    }

})
export const { messageClear } = authReducer.actions
export default authReducer.reducer

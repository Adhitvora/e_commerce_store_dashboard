import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { api_url } from '../../utils/utils'


/*
-----------------------------------------
GET ALL MESSAGES
-----------------------------------------
*/
export const get_messages = createAsyncThunk(
    'chat/get_messages',
    async ({ userId, role }, { rejectWithValue, fulfillWithValue, getState }) => {

        const token = getState().auth.token

        try {
            const { data } = await axios.get(
                `${api_url}/api/chat/get-messages/${role}/${userId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )

            return fulfillWithValue(data)

        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)


/*
-----------------------------------------
GET ADMIN CONVERSATIONS (NEW)
-----------------------------------------
*/
export const get_admin_conversations = createAsyncThunk(
    'chat/get_admin_conversations',
    async (_, { rejectWithValue, fulfillWithValue, getState }) => {

        const token = getState().auth.token

        try {

            const { data } = await axios.get(
                `${api_url}/api/chat/admin/conversations`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )

            return fulfillWithValue(data)

        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)


/*
-----------------------------------------
SEND MESSAGE
-----------------------------------------
*/
export const send_message = createAsyncThunk(
    'chat/send_message',
    async (info, { rejectWithValue, fulfillWithValue, getState }) => {

        const token = getState().auth.token

        try {

            const { data } = await axios.post(
                `${api_url}/api/chat/send-message`,
                info,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )

            return fulfillWithValue(data)

        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)



/*
-----------------------------------------
SLICE
-----------------------------------------
*/
export const chatReducer = createSlice({

    name: 'chat',

    initialState: {
        messages: [],
        users: [],             
        selectedUser: null,
        successMessage: '',
        errorMessage: ''
    },

    reducers: {

        selectUser: (state, { payload }) => {
            state.selectedUser = payload
        },

        updateMessage: (state, { payload }) => {

            const exists = state.messages.some(
                m => m._id === payload._id
            )

            if (!exists) {
                state.messages.push(payload)
            }
        },

        messageClear: (state) => {
            state.successMessage = ''
            state.errorMessage = ''
        }

    },

    extraReducers: (builder) => {

        builder

            // GET MESSAGES
            .addCase(get_messages.fulfilled, (state, { payload }) => {
                state.messages = payload.messages || []
            })

            // GET CONVERSATIONS
            .addCase(get_admin_conversations.fulfilled, (state, { payload }) => {
                state.users = payload.users || []
            })

            // SEND MESSAGE
            .addCase(send_message.fulfilled, (state, { payload }) => {

                if (payload?.message) {
                    state.messages.push(payload.message)
                }

                state.successMessage = 'sent'
            })

            // ERROR
            .addCase(send_message.rejected, (state, { payload }) => {
                state.errorMessage = payload
            })

            .addCase(get_messages.rejected, (state, { payload }) => {
                state.errorMessage = payload
            })
    }

})

export const {
    selectUser,
    updateMessage,
    messageClear
} = chatReducer.actions

export default chatReducer.reducer

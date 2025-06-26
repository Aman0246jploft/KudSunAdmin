// src/features/user/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authAxiosClient from '../../api/authAxiosClient';
import { toast } from 'react-toastify';

export function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}


export const addComment = createAsyncThunk(
    'product/addComment',
    async (formData, thunkAPI) => {
        try {
            const res = await authAxiosClient.post('/product/addComment', formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data;
        } catch (err) {
            console.error(`Add comment [${err.response?.status || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.response?.data?.message || err.message);
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || err.message,
                code: err.response?.status || 500,
            });
        }
    }
);


export const getProductComment = createAsyncThunk(
    'product/getProductComment',
    async ({ id, pagination }, thunkAPI) => {
        console.log("id , pagination", id, pagination)
        try {
            const res = await authAxiosClient.get(`/product/getProductComment/${id}`, pagination, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data;
        } catch (err) {
            console.error(`Add comment [${err.response?.status || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.response?.data?.message || err.message);
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || err.message,
                code: err.response?.status || 500,
            });
        }
    }
);





export const getProductCommentReply = createAsyncThunk(
    'product/getProductCommentReply',
    async ({ parentId, pageNo = 1, size = 10 }, thunkAPI) => {
        console.log("id , pagination", id, pagination)
        try {
            const res = await authAxiosClient.get(`/product/getProductCommentReply/${parentId}?pageNo=${pageNo}&size=${size}`, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data;
        } catch (err) {
            console.error(`getProductCommentReply comment [${err.response?.status || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.response?.data?.message || err.message);
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || err.message,
                code: err.response?.status || 500,
            });
        }
    }
);






const CommentSlice = createSlice({
    name: 'comment',
    initialState: {
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getProductComment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProductComment.fulfilled, (state, action) => {
                state.loading = false;
                state.commentProduct = action.payload.data;

            })
            .addCase(getProductComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getProductCommentReply.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProductCommentReply.fulfilled, (state, action) => {
                state.loading = false;
                state.commentProductReply = action.payload.data;

            })
            .addCase(getProductCommentReply.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })



    },
});

export default CommentSlice.reducer;

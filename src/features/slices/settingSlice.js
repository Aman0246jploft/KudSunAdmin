// src/features/user/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosClient from '../../api/axiosClient';
import authAxiosClient from '../../api/authAxiosClient';


export function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}




export const termAndPolicy = createAsyncThunk(
    'product/termAndPolicy',
    async (_, thunkAPI) => {
        try {
            const res = await axiosClient.get(`/appsetting/termAndPolicy`);
            return res.data;
        } catch (err) {

            let message = capitalizeFirstLetter(err.response?.data?.message || err.message);
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || err.message,
                code: err.response?.status || 500,
            });
        }
    }
);


export const updateAppSetting = createAsyncThunk(
    'product/updateAppSetting',
    async (payload, thunkAPI) => {
        try {
            const res = await authAxiosClient.post(`/appsetting/update`, payload);
            return res.data;
        } catch (err) {

            let message = capitalizeFirstLetter(err.response?.data?.message || err.message);
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || err.message,
                code: err.response?.status || 500,
            });
        }
    }
);



export const getFAQs = createAsyncThunk(
    'product/getFAQs',
    async (_, thunkAPI) => {
        try {
            const res = await axiosClient.get(`/appsetting/getFAQs`);
            return res.data;
        } catch (err) {

            let message = capitalizeFirstLetter(err.response?.data?.message || err.message);
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || err.message,
                code: err.response?.status || 500,
            });
        }
    }
);



export const contactUsList = createAsyncThunk(
    'contactUs/getList',
    async (payload, thunkAPI) => {
        try {
            const res = await authAxiosClient.get(`/contactUs/getList`, { parmas: payload });
            return res.data;
        } catch (err) {

            let message = capitalizeFirstLetter(err.response?.data?.message || err.message);
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || err.message,
                code: err.response?.status || 500,
            });
        }
    }
);


export const feeSettingList = createAsyncThunk(
    'feeSetting/getList',
    async (payload, thunkAPI) => {
        try {
            const res = await authAxiosClient.get(`/feeSetting/getList`, { parmas: payload });
            return res.data;
        } catch (err) {

            let message = capitalizeFirstLetter(err.response?.data?.message || err.message);
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || err.message,
                code: err.response?.status || 500,
            });
        }
    }
);


export const markAsreadContactUs = createAsyncThunk(
    'contactUs/markAsreadContactUs',
    async (payload, thunkAPI) => {
        try {
            const res = await authAxiosClient.post(`/contactUs/update`, payload);
            return res.data;
        } catch (err) {

            let message = capitalizeFirstLetter(err.response?.data?.message || err.message);
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || err.message,
                code: err.response?.status || 500,
            });
        }
    }
);


export const updateFee = createAsyncThunk(
    'feesetting/updateFee',
    async (payload, thunkAPI) => {
        try {
            const res = await authAxiosClient.post(`/feeSetting/update`, payload);
            return res.data;
        } catch (err) {

            let message = capitalizeFirstLetter(err.response?.data?.message || err.message);
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || err.message,
                code: err.response?.status || 500,
            });
        }
    }
);













export const byUser = createAsyncThunk(
    'feesetting/byUser',
    async ({userId,payload}, thunkAPI) => {
        try {
            const res = await authAxiosClient.get(`/reportUser/byUser/${userId}`,{ parmas: payload });
            return res.data;
        } catch (err) {

            let message = capitalizeFirstLetter(err.response?.data?.message || err.message);
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || err.message,
                code: err.response?.status || 500,
            });
        }
    }
);










export const deleteSetting = createAsyncThunk(
    'product/harddelete',
    async (id, thunkAPI) => {
        try {
            const res = await authAxiosClient.post(`/appsetting/harddelete`, { id });
            return res.data;
        } catch (err) {

            let message = capitalizeFirstLetter(err.response?.data?.message || err.message);
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || err.message,
                code: err.response?.status || 500,
            });
        }
    }
);



export const createAppsetting = createAsyncThunk(
    'product/create',
    async (payload, thunkAPI) => {
        try {
            const res = await authAxiosClient.post(`/appsetting/create`, payload);
            return res.data;
        } catch (err) {

            let message = capitalizeFirstLetter(err.response?.data?.message || err.message);
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || err.message,
                code: err.response?.status || 500,
            });
        }
    }
);








const settingSlice = createSlice({
    name: 'setting',
    initialState: {
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(termAndPolicy.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(termAndPolicy.fulfilled, (state, action) => {
                state.loading = false;
                state.termAndPolicy = action.payload.data;
            })
            .addCase(termAndPolicy.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getFAQs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getFAQs.fulfilled, (state, action) => {
                state.loading = false;
                state.faqs = action.payload.data;
            })
            .addCase(getFAQs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(contactUsList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(contactUsList.fulfilled, (state, action) => {
                state.loading = false;
                state.contactUs = action.payload.data;
            })
            .addCase(contactUsList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(feeSettingList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(feeSettingList.fulfilled, (state, action) => {
                state.loading = false;
                state.feeSettingList2 = action.payload.data;
            })
            .addCase(feeSettingList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


            .addCase(byUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(byUser.fulfilled, (state, action) => {
                state.loading = false;
                state.byUserReports = action.payload.data;
            })
            .addCase(byUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })




    },

});

export default settingSlice.reducer;

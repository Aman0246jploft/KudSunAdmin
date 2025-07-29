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
            const query = new URLSearchParams(payload).toString();
            const res = await authAxiosClient.get(`/contactUs/getList?${query}`);
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


export const sendContactUsReply = createAsyncThunk(
    'contactUs/sendReply',
    async (payload, thunkAPI) => {
        try {
            const res = await authAxiosClient.post(`/contactUs/sendReply`, payload);
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
    async ({ userId, pageNo, size }, thunkAPI) => {
        try {
            const res = await authAxiosClient.get(`/reportUser/byUser/${userId}?pageNo=${pageNo}&size=${size}`);
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


// Report Type endpoints
export const getReportTypes = createAsyncThunk(
    'settings/getReportTypes',
    async ({ pageNo = 1, size = 10 }, { rejectWithValue }) => {
        try {
            const response = await authAxiosClient.get(`/reportType/getList?pageNo=${pageNo}&size=${size}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createReportType = createAsyncThunk(
    'settings/createReportType',
    async (data, { rejectWithValue }) => {
        try {
            const response = await authAxiosClient.post('/reportType/create', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateReportType = createAsyncThunk(
    'settings/updateReportType',
    async (data, { rejectWithValue }) => {
        try {
            const response = await authAxiosClient.post('/reportType/update', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteReportType = createAsyncThunk(
    'settings/deleteReportType',
    async (id, { rejectWithValue }) => {
        try {
            const response = await authAxiosClient.post('/reportType/hardDelete', { id });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);



// Dispute Type endpoints
export const getDisputeTypes = createAsyncThunk(
    'settings/getDisputeTypes',
    async ({ pageNo = 1, size = 10 }, { rejectWithValue }) => {
        try {
            const response = await authAxiosClient.get(`/disputeType/getList?pageNo=${pageNo}&size=${size}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createDisputeType = createAsyncThunk(
    'settings/createDisputeType',
    async (data, { rejectWithValue }) => {
        try {
            const response = await authAxiosClient.post('/disputeType/create', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateDisputeType = createAsyncThunk(
    'settings/updateDisputeType',
    async (data, { rejectWithValue }) => {
        try {
            const response = await authAxiosClient.post('/disputeType/update', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteDisputeType = createAsyncThunk(
    'settings/deleteDisputeType',
    async (id, { rejectWithValue }) => {
        try {
            const response = await authAxiosClient.post('/disputeType/hardDelete', { id });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);








// Cancel Type endpoints
export const getCancelTypes = createAsyncThunk(
    'settings/getCancelTypes',
    async ({ pageNo = 1, size = 10 }, { rejectWithValue }) => {
        try {
            const response = await authAxiosClient.get(`/cancelType/getList?pageNo=${pageNo}&size=${size}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createCancelType = createAsyncThunk(
    'settings/createCancelType',
    async (data, { rejectWithValue }) => {
        try {
            const response = await authAxiosClient.post('/cancelType/create', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateCancelType = createAsyncThunk(
    'settings/updateCancelType',
    async (data, { rejectWithValue }) => {
        try {
            const response = await authAxiosClient.post('/cancelType/update', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteCancelType = createAsyncThunk(
    'settings/deleteCancelType',
    async (id, { rejectWithValue }) => {
        try {
            const response = await authAxiosClient.post('/cancelType/hardDelete', { id });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
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
            .addCase(getReportTypes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getReportTypes.fulfilled, (state, action) => {
                state.loading = false;
                state.reportTypeinfo = action.payload.data;

            })
            .addCase(getReportTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            
       .addCase(getCancelTypes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCancelTypes.fulfilled, (state, action) => {
                state.loading = false;
                state.reportTypeinfo = action.payload.data;

            })
            .addCase(getCancelTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


            .addCase(getDisputeTypes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDisputeTypes.fulfilled, (state, action) => {
                state.loading = false;
                state.reportTypeinfo = action.payload.data;

            })
            .addCase(getDisputeTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


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

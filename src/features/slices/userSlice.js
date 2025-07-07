// src/features/user/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';
import authAxiosClient from '../../api/authAxiosClient';

import { toast } from 'react-toastify';

export function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}


// Unauthenticated API call
export const fetchPublicUsers = createAsyncThunk(
    'user/fetchPublicUsers',
    async (_, thunkAPI) => {
        try {
            const res = await axiosClient.get('/users/public');
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || 'Error');
        }
    }
);

// Authenticated API call
export const fetchPrivateUsers = createAsyncThunk(
    'user/fetchPrivateUsers',
    async (_, thunkAPI) => {
        try {
            const res = await authAxiosClient.get('/users/private');
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || 'Error');
        }
    }
);




export const login = createAsyncThunk(
    'user/login',
    async (data, thunkAPI) => {
        try {
            const res = await axiosClient.post('/user/login', data);
            localStorage.setItem("kadSunInfo", JSON.stringify(res.data?.data))
            return res.data;
        } catch (err) {
            console.error(`Login error [${err.responseCode || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.message)
            toast.error(message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);


export const requestResetOtp = createAsyncThunk(
    'user/requestResetOtpByEmail',
    async (data, thunkAPI) => {
        try {
            const res = await axiosClient.post('/user/requestResetOtpByEmail', data);
            return res.data;
        } catch (err) {
            console.error(`requestResetOtpByEmail error [${err.responseCode || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.message)
            toast.error(message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);



export const verifyResetOtps = createAsyncThunk(
    'user/verifyResetOtps',
    async (data, thunkAPI) => {
        try {
            const res = await axiosClient.post('/user/verifyResetOtpByEmail', data);
            return res.data;
        } catch (err) {
            console.error(`verifyResetOtp error [${err.responseCode || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);

export const resendResetOtps = createAsyncThunk(
    'user/resendResetOtps',
    async (data, thunkAPI) => {
        try {
            const res = await axiosClient.post('/user/resendResetOtpByEmail', data);
            return res.data;
        } catch (err) {
            let message = capitalizeFirstLetter(err.message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);

export const resetPassword = createAsyncThunk(
    'user/resetPassword',
    async (data, thunkAPI) => {
        try {
            const res = await axiosClient.post('/user/resetPasswordByEmail', data);
            return res.data;
        } catch (err) {
            let message = capitalizeFirstLetter(err.message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);






export const userList = createAsyncThunk(
    'user/userList',
    async (queryParams = {}, thunkAPI) => {
        try {
            const res = await authAxiosClient.get('/user/userList', { params: queryParams });
            return res?.data?.data;
        } catch (err) {
            let message = capitalizeFirstLetter(err.message)
            toast.error(message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);



export const getLoginProfile = createAsyncThunk(
    'user/getLoginProfile',
    async (queryParams = {}, thunkAPI) => {
        try {
            const res = await authAxiosClient.get('/user/getProfile', { params: queryParams });
            return res?.data?.data;
        } catch (err) {
            let message = capitalizeFirstLetter(err.message)
            // toast.error(message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);





export const getDashboardCount = createAsyncThunk(
    'user/getDashboardSummary',
    async (_, thunkAPI) => {
        try {
            const res = await authAxiosClient.get('/user/getDashboardSummary');
            return res?.data?.data;
        } catch (err) {
            let message = capitalizeFirstLetter(err.message)
            toast.error(message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);





export const hardDelete = createAsyncThunk(
    'user/hardDelete',
    async (data, thunkAPI) => {
        try {
            const res = await authAxiosClient.post('/user/hardDelete', data);
            return res.data;
        } catch (err) {
            let message = capitalizeFirstLetter(err.message)
            toast.error(message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);



export const softDelete = createAsyncThunk(
    'user/softDelete',
    async (data, thunkAPI) => {
        try {
            const res = await authAxiosClient.post('/user/softDelete', data);
            return res.data;
        } catch (err) {
            let message = capitalizeFirstLetter(err.message)
            toast.error(message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);


export const update = createAsyncThunk(
    'user/update',
    async (data, thunkAPI) => {
        try {
            const res = await authAxiosClient.post('/user/update', data);
            return res.data;
        } catch (err) {
            let message = capitalizeFirstLetter(err.message)
            toast.error(message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);



export const sellerVerification = createAsyncThunk(
    'sellerVerification/changeVerificationStatus',
    async (data, thunkAPI) => {
        try {
            const res = await authAxiosClient.post('/sellerVerification/changeVerificationStatus', data);
            return res.data;
        } catch (err) {
            let message = capitalizeFirstLetter(err.message)
            toast.error(message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);






export const adminChangeUserPassword = createAsyncThunk(
    'user/adminChangeUserPassword',
    async (data, thunkAPI) => {
        try {
            const res = await authAxiosClient.post('/user/adminChangeUserPassword', data);
            return res.data;
        } catch (err) {
            let message = capitalizeFirstLetter(err.message)
            toast.error(message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);

export const getSellerRequests = createAsyncThunk(
    'sellerVerification/getSellerRequests',
    async (params, thunkAPI) => {
        try {
            const res = await authAxiosClient.get('/sellerVerification/getSellerRequests', { params });
            return res.data;
        } catch (err) {
            let message = capitalizeFirstLetter(err.message)
            // toast.error(message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);




const userSlice = createSlice({
    name: 'user',
    initialState: {},
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.authData = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(userList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(userList.fulfilled, (state, action) => {
                state.loading = false;
                state.userList = action.payload;
            })
            .addCase(userList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getDashboardCount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDashboardCount.fulfilled, (state, action) => {
                state.loading = false;
                state.getDashboardSummary = action.payload;
            })
            .addCase(getDashboardCount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(getLoginProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getLoginProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.getLoginProfiledata = action.payload;
            })
            .addCase(getLoginProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


    },
});

export default userSlice.reducer;

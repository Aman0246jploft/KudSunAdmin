// src/features/user/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authAxiosClient from '../../api/authAxiosClient';
import { toast } from 'react-toastify';
import axiosClient from '../../api/axiosClient';

export function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}


export const mainCategory = createAsyncThunk(
    'category/listCategoryNames',
    async (queryParams = {}, thunkAPI) => {
        try {
            const res = await axiosClient.get('/category/listCategoryNames', { params: queryParams });
            return res.data;
        } catch (err) {
            console.error(`Category List [${err.responseCode || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.message)
            toast.error(message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);



export const subCategory = createAsyncThunk(
    'category/getSubCategoriesByCategoryId',
    async ({ categoryId, pageNo = 1, size = 10 } = {}, thunkAPI) => {
        try {
            const res = await authAxiosClient.get(`/category/getSubCategoriesByCategoryId/${categoryId}`, { params: { pageNo, size } });
            return res.data;
        } catch (err) {
            console.error(`Category List [${err.responseCode || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.message)
            toast.error(message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);




export const subCategoryParameter = createAsyncThunk(
    'category/getParametersBySubCategoryId',
    async ({ subCategoryId, pageNo = 1, size = 10 } = {}, thunkAPI) => {
        try {
            const res = await authAxiosClient.get(`/category/getParametersBySubCategoryId/${subCategoryId}`, { params: { pageNo, size } });
            return res.data;
        } catch (err) {
            console.error(`Category List [${err.responseCode || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.message)
            toast.error(message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);


export const createCategory = createAsyncThunk(
    'category/createCategory',
    async (payload = {}, thunkAPI) => {
        try {
            const res = await authAxiosClient.post(`/category/createCategory`, payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data;
        } catch (err) {
            console.error(`Category List [${err.responseCode || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.message)
            toast.error(message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);




export const rejectParameterValueByAdmin = createAsyncThunk(
    'category/rejectParameterValueByAdmin',
    async ({ subCategory, formData }, thunkAPI) => {
        try {
            const res = await authAxiosClient.post(`/category/rejectParameterValueByAdmin/${subCategory}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data;
        } catch (err) {
            console.error(`Category List [${err.responseCode || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.message)
            toast.error(message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);


export const acceptParameterValueByAdmin = createAsyncThunk(
    'category/acceptParameterValueByAdmin',
    async ({ subCategory, formData }, thunkAPI) => {
        try {
            const res = await authAxiosClient.post(`/category/acceptParameterValueByAdmin/${subCategory}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data;
        } catch (err) {
            console.error(`Category List [${err.responseCode || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.message)
            toast.error(message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);



export const addSubCategory = createAsyncThunk(
    'category/addSubCategory',
    async ({ categoryId, formData } = {}, thunkAPI) => {

        try {
            const res = await authAxiosClient.post(`/category/addSubCategory/${categoryId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data;
        } catch (err) {
            console.error(`Category List [${err.responseCode || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.message)
            toast.error(message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);




export const addParameter = createAsyncThunk(
    'category/addParameterToSubCategory',
    async ({ subCategoryId, formData } = {}, thunkAPI) => {

        try {
            const res = await authAxiosClient.post(`/category/addParameterToSubCategory/${subCategoryId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data;
        } catch (err) {
            console.error(`Category List [${err.responseCode || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.message)
            toast.error(message)
            return thunkAPI.rejectWithValue({
                message: err.message,
                code: err.responseCode || 500,
            });
        }
    }
);



const CategorySlice = createSlice({
    name: 'category',
    initialState: {
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(mainCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(mainCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.categoryList = action.payload.data;
            })
            .addCase(mainCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(subCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(subCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.subCategoryList = action.payload.data;
            })
            .addCase(subCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(subCategoryParameter.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(subCategoryParameter.fulfilled, (state, action) => {
                state.loading = false;
                state.subCategoryParameterList = action.payload.data;
            })
            .addCase(subCategoryParameter.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })



    },
});

export default CategorySlice.reducer;

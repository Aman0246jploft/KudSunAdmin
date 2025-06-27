// src/features/user/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authAxiosClient from '../../api/authAxiosClient';
import { toast } from 'react-toastify';

export function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}


export const addProduct = createAsyncThunk(
    'product/addProduct',
    async (formData, thunkAPI) => {
        try {
            const res = await authAxiosClient.post('/product/addSellerProduct', formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Product added successfully!");
            return res.data;
        } catch (err) {
            console.error(`Add Product [${err.response?.status || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.response?.data?.message || err.message);
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || err.message,
                code: err.response?.status || 500,
            });
        }
    }
);


export const productList = createAsyncThunk(
    'product/showNormalProducts',
    async (queryParams, thunkAPI) => {
        try {
            const res = await authAxiosClient.get('/product/showNormalProducts', { params: { ...queryParams, includeSold: true } });
            return res.data;
        } catch (err) {
            console.error(`Add Product [${err.response?.status || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.response?.data?.message || err.message);
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || err.message,
                code: err.response?.status || 500,
            });
        }
    }
);



export const productListAuction = createAsyncThunk(
    'product/showAuctionProducts',
    async (queryParams, thunkAPI) => {
        try {
            const res = await authAxiosClient.get('/product/showAuctionProducts', { params: { ...queryParams, includeSold: true } });
            return res.data;
        } catch (err) {
            console.error(`Add Product [${err.response?.status || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.response?.data?.message || err.message);
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || err.message,
                code: err.response?.status || 500,
            });
        }
    }
);





export const getProducts = createAsyncThunk(
    'product/getProducts',
    async ({ productId, queryParams }, thunkAPI) => {
        try {
            const res = await authAxiosClient.get(`/product/getProducts/${productId}`, { params: { ...queryParams } });
            return res.data;
        } catch (err) {
            console.error(`Add Product [${err.response?.status || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.response?.data?.message || err.message);
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || err.message,
                code: err.response?.status || 500,
            });
        }
    }
);


export const updateProduct = createAsyncThunk(
    'product/updateSellerProduct',
    async ({ id, formData }, thunkAPI) => {
        try {
            const res = await authAxiosClient.post(`/product/updateSellerProduct/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data;
        } catch (err) {
            console.error(`Update Product [${err.response?.status || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.response?.data?.message || err.message);
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || err.message,
                code: err.response?.status || 500,
            });
        }
    }
);



export const toggleProductDisable = createAsyncThunk(
    'product/updateSellerProduct',
    async ({ id, formData }, thunkAPI) => {
        try {
            const res = await authAxiosClient.post(`/product/toggleProductDisable/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data;
        } catch (err) {
            console.error(`Update Product [${err.response?.status || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.response?.data?.message || err.message);
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || err.message,
                code: err.response?.status || 500,
            });
        }
    }
);


export const deleteProduct = createAsyncThunk(
    'product/updateSellerProduct',
    async ({ id, formData }, thunkAPI) => {
        try {
            const res = await authAxiosClient.post(`/product/deleteProduct/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data;
        } catch (err) {
            console.error(`Update Product [${err.response?.status || 500}]: ${err.message}`);
            let message = capitalizeFirstLetter(err.response?.data?.message || err.message);
            toast.error(message);
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || err.message,
                code: err.response?.status || 500,
            });
        }
    }
);



const ProductSlice = createSlice({
    name: 'product',
    initialState: {
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addProduct.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(addProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(productList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(productList.fulfilled, (state, action) => {
                state.loading = false;
                state.productsList = action.payload?.data;
            })
            .addCase(productList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(productListAuction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(productListAuction.fulfilled, (state, action) => {
                state.loading = false;
                state.productsListAuction = action.payload?.data;
            })
            .addCase(productListAuction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


            .addCase(getProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.productInfo = action.payload?.data;
            })
            .addCase(getProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })






    },
});

export default ProductSlice.reducer;

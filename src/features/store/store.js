// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../slices/userSlice'
import logger from 'redux-logger';
import CategoryReducer from '../slices/categorySlice';
import productReducer from '../slices/productSlice'


export const store = configureStore({
  reducer: {
    user: userReducer,
    category: CategoryReducer,
    product: productReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger),
});

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authAxiosClient from "../../api/authAxiosClient";
import { toast } from "react-toastify";

// Helper function to capitalize first letter
const capitalizeFirstLetter = (string) => {
  return string?.charAt(0).toUpperCase() + string?.slice(1);
};

// Async thunk for fetching monthly analytics
export const getMonthlyAnalytics = createAsyncThunk(
  'dashboard/getMonthlyAnalytics',
  async (year, thunkAPI) => {
    try {
      const params = year ? { year } : {};
      const res = await authAxiosClient.get('/dashboard/monthly-analytics', { params });
      return res?.data?.data;
    } catch (err) {
      const message = capitalizeFirstLetter(err.message);
      toast.error(message);
      return thunkAPI.rejectWithValue({
        message: err.message,
        code: err.responseCode || 500,
      });
    }
  }
);

// Async thunk for fetching dashboard summary
export const getDashboardSummary = createAsyncThunk(
  'dashboard/getDashboardSummary',
  async (year, thunkAPI) => {
    try {
      const params = year ? { year } : {};
      const res = await authAxiosClient.get('/dashboard/summary', { params });
      return res?.data?.data;
    } catch (err) {
      const message = capitalizeFirstLetter(err.message);
      toast.error(message);
      return thunkAPI.rejectWithValue({
        message: err.message,
        code: err.responseCode || 500,
      });
    }
  }
);

// Async thunk for fetching available years
export const getAvailableYears = createAsyncThunk(
  'dashboard/getAvailableYears',
  async (_, thunkAPI) => {
    try {
      const res = await authAxiosClient.get('/dashboard/available-years');
      return res?.data?.data;
    } catch (err) {
      const message = capitalizeFirstLetter(err.message);
      toast.error(message);
      return thunkAPI.rejectWithValue({
        message: err.message,
        code: err.responseCode || 500,
      });
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    loading: false,
    error: null,
    monthlyAnalytics: null,
    dashboardSummary: null,
    availableYears: [],
    selectedYear: new Date().getFullYear()
  },
  reducers: {
    setSelectedYear: (state, action) => {
      state.selectedYear = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Monthly Analytics
      .addCase(getMonthlyAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMonthlyAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyAnalytics = action.payload;
      })
      .addCase(getMonthlyAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Dashboard Summary
      .addCase(getDashboardSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardSummary = action.payload;
      })
      .addCase(getDashboardSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Available Years
      .addCase(getAvailableYears.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableYears.fulfilled, (state, action) => {
        state.loading = false;
        state.availableYears = action.payload?.years || [];
      })
      .addCase(getAvailableYears.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedYear, clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer; 
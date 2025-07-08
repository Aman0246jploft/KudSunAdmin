import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authAxiosClient from "../../api/authAxiosClient";

// Async thunks
export const fetchThreads = createAsyncThunk(
  "thread/fetchThreads",
  async (params) => {
    const response = await authAxiosClient.get("/thread/getThreads", { params });
    return response.data;
  }
);

export const createThread = createAsyncThunk(
  "thread/createThread",
  async (threadData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(threadData).forEach(key => {
        if (key === 'files') {
          threadData[key].forEach(file => {
            formData.append('files', file);
          });
        } else if (key === 'tags' && Array.isArray(threadData[key])) {
          threadData[key].forEach(tag => {
            formData.append('tags', tag);
          });
        } else {
          formData.append(key, threadData[key]);
        }
      });
      
      const response = await authAxiosClient.post("/create", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateThread = createAsyncThunk(
  "thread/updateThread",
  async ({ id, threadData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(threadData).forEach(key => {
        if (key === 'files') {
          threadData[key].forEach(file => {
            formData.append('files', file);
          });
        } else if (key === 'tags' && Array.isArray(threadData[key])) {
          threadData[key].forEach(tag => {
            formData.append('tags', tag);
          });
        } else if (key === 'removePhotos' && Array.isArray(threadData[key])) {
          threadData[key].forEach(url => {
            formData.append('removePhotos', url);
          });
        } else {
          formData.append(key, threadData[key]);
        }
      });

      const response = await authAxiosClient.post(`/updateThread/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteThread = createAsyncThunk(
  "thread/deleteThread",
  async (threadId) => {
    await authAxiosClient.post(`/thread/delete/${threadId}`);
    return threadId;
  }
);

export const toggleThreadStatus = createAsyncThunk(
  "thread/toggleStatus",
  async (threadId) => {
    const response = await authAxiosClient.post(`/thread/changeStatus/${threadId}`);
    return response.data;
  }
);

const threadSlice = createSlice({
  name: "thread",
  initialState: {
    threads: [],
    loading: false,
    error: null,
    totalPages: 0,
    totalRecords: 0
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Threads
      .addCase(fetchThreads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThreads.fulfilled, (state, action) => {
        state.loading = false;
        state.threads = action.payload.data.products;
        state.totalPages = Math.ceil(action.payload.data.total / action.payload.data.size);
        state.totalRecords = action.payload.data.total;
      })
      .addCase(fetchThreads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create thread
      .addCase(createThread.fulfilled, (state, action) => {
        state.threads.unshift(action.payload.data);
      })
      // Update thread
      .addCase(updateThread.fulfilled, (state, action) => {
        const index = state.threads.findIndex(thread => thread._id === action.payload.data._id);
        if (index !== -1) {
          state.threads[index] = action.payload.data;
        }
      })
      // Delete Thread
      .addCase(deleteThread.fulfilled, (state, action) => {
        state.threads = state.threads.filter(
          (thread) => thread._id !== action.payload
        );
      })
      // Toggle Thread Status
      .addCase(toggleThreadStatus.fulfilled, (state, action) => {
        const index = state.threads.findIndex(
          (thread) => thread._id === action.payload.data._id
        );
        if (index !== -1) {
          state.threads[index] = action.payload.data;
        }
      });
  },
});

export default threadSlice.reducer; 
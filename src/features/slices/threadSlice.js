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

export const fetchThreadById = createAsyncThunk(
  "thread/fetchThreadById",
  async (threadId) => {
    const response = await authAxiosClient.get(`/thread/getThreads/${threadId}`);
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
  async ({ id, formData }) => {
    const response = await authAxiosClient.post(`/thread/updateThread/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
);

export const deleteThread = createAsyncThunk(
  "thread/deleteThread",
  async (threadId) => {
    await authAxiosClient.get(`/thread/delete/${threadId}`);
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
    currentThread: null,
    loading: false,
    error: null,
    totalPages: 0,
    totalRecords: 0
  },
  reducers: {
    clearCurrentThread: (state) => {
      state.currentThread = null;
    }
  },
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
      // Fetch Thread by ID
      .addCase(fetchThreadById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThreadById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentThread = action.payload.data;
      })
      .addCase(fetchThreadById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create thread
      .addCase(createThread.fulfilled, (state, action) => {
        state.threads.unshift(action.payload.data);
      })
      // Update Thread
      .addCase(updateThread.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateThread.fulfilled, (state, action) => {
        state.loading = false;
        const updatedThread = action.payload.data;
        const index = state.threads.findIndex(thread => thread._id === updatedThread._id);
        if (index !== -1) {
          state.threads[index] = updatedThread;
        }
        state.currentThread = updatedThread;
      })
      .addCase(updateThread.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Delete Thread
      .addCase(deleteThread.fulfilled, (state, action) => {
        state.threads = state.threads.filter(
          (thread) => thread._id !== action.payload
        );
      })
      // // Toggle Thread Status
      // .addCase(toggleThreadStatus.fulfilled, (state, action) => {
      //   const index = state.threads.findIndex(
      //     (thread) => thread._id === action.payload.data._id
      //   );
      //   if (index !== -1) {
      //     state.threads[index] = action.payload.data;
      //   }
      // });
  },
});

export const { clearCurrentThread } = threadSlice.actions;
export default threadSlice.reducer; 
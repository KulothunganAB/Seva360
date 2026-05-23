import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  complaints: [],
  currentComplaint: null,
  pagination: null,
  loading: false,
  error: null,
};

export const fetchComplaints = createAsyncThunk('complaints/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const { data } = await api.get(`/complaints?${query}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch complaints');
  }
});

export const fetchComplaintById = createAsyncThunk('complaints/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/complaints/${id}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch complaint');
  }
});

export const createComplaint = createAsyncThunk('complaints/create', async (complaintData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/complaints', complaintData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create complaint');
  }
});

export const updateComplaintStatus = createAsyncThunk('complaints/updateStatus', async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/complaints/${id}/status`, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update status');
  }
});

export const addComplaintComment = createAsyncThunk('complaints/addComment', async ({ id, text }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/complaints/${id}/comments`, { text });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add comment');
  }
});

const complaintsSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {
    clearCurrentComplaint(state) {
      state.currentComplaint = null;
    },
    updateComplaintFromSocket(state, action) {
      const { complaintId, status } = action.payload;
      const idx = state.complaints.findIndex(c => c.id === complaintId);
      if (idx !== -1) {
        state.complaints[idx].status = status;
      }
      if (state.currentComplaint?.id === complaintId) {
        state.currentComplaint.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchComplaints.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(fetchComplaintById.pending, (state) => { state.loading = true; })
      .addCase(fetchComplaintById.fulfilled, (state, action) => { state.loading = false; state.currentComplaint = action.payload; })
      .addCase(fetchComplaintById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.complaints.unshift(action.payload);
      })
      
      .addCase(updateComplaintStatus.fulfilled, (state, action) => {
        const idx = state.complaints.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.complaints[idx] = action.payload;
        if (state.currentComplaint?.id === action.payload.id) {
          state.currentComplaint = action.payload;
        }
      })
      
      .addCase(addComplaintComment.fulfilled, (state, action) => {
        if (state.currentComplaint?.id === action.payload.id) {
          state.currentComplaint = action.payload;
        }
      });
  },
});

export const { clearCurrentComplaint, updateComplaintFromSocket } = complaintsSlice.actions;
export default complaintsSlice.reducer;

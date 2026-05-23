import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  works: [],
  currentWork: null,
  pagination: null,
  loading: false,
  error: null,
};

export const fetchWorks = createAsyncThunk('works/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const { data } = await api.get(`/works?${query}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch works');
  }
});

export const fetchWorkById = createAsyncThunk('works/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/works/${id}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch work');
  }
});

export const createWork = createAsyncThunk('works/create', async (workData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/works', workData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create work');
  }
});

export const updateWork = createAsyncThunk('works/update', async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/works/${id}`, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update work');
  }
});

const worksSlice = createSlice({
  name: 'works',
  initialState,
  reducers: {
    clearCurrentWork(state) { state.currentWork = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchWorks.fulfilled, (state, action) => {
        state.loading = false;
        state.works = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchWorks.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchWorkById.fulfilled, (state, action) => { state.currentWork = action.payload; })
      .addCase(createWork.fulfilled, (state, action) => { state.works.unshift(action.payload); })
      .addCase(updateWork.fulfilled, (state, action) => {
        const idx = state.works.findIndex(w => w.id === action.payload.id);
        if (idx !== -1) state.works[idx] = action.payload;
        if (state.currentWork?.id === action.payload.id) state.currentWork = action.payload;
      });
  },
});

export const { clearCurrentWork } = worksSlice.actions;
export default worksSlice.reducer;

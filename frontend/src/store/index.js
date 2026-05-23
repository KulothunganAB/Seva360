import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import complaintsReducer from './slices/complaintsSlice';
import worksReducer from './slices/worksSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    complaints: complaintsReducer,
    works: worksReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }),
});

export default store;

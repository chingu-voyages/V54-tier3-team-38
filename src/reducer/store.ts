import { configureStore } from '@reduxjs/toolkit';
import { mainReducer } from './mainReducer';

export const store = configureStore({
  reducer: mainReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/userSlice";
import navReducer from "../features/navSlice";
import feedReducer from '../features/feedSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    nav: navReducer,
    feed: feedReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
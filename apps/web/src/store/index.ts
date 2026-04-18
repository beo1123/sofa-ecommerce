// src/store/index.ts
"use client";

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  createMigrate,
} from "redux-persist";

import cartReducer from "./slice/cartSlice";
import userReducer from "./slice/userSlice";
import { safeAsyncStorage } from "@/lib/safeAsyncStorage";

// ---- migrations ----
const PERSIST_VERSION = 1;

const migrations: Record<number, (state: any) => any> = {
  1: (state) => {
    if (!state) return state;
    const next = { ...state };
    if (next.cart && !Array.isArray(next.cart.items)) next.cart.items = [];
    return next;
  },
};

// ---- persist config ----
const persistConfig = {
  key: "root",
  version: PERSIST_VERSION,
  storage: safeAsyncStorage,
  whitelist: ["cart", "user"], // chỉ persist cart + user
  migrate: createMigrate(migrations, { debug: false }),
};

// ---- root reducer ----
const rootReducer = combineReducers({
  cart: cartReducer,
  user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ---- configure store ----
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // ignore redux-persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);

// types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

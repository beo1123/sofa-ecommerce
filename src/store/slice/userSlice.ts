"use client";

import { User } from "@/types/user/User";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserState = User | null;

const initialState = null as UserState;

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (_, action: PayloadAction<UserState>) => action.payload,

    clearUser: () => null,
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;

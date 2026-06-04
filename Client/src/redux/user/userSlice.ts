import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { UserProfile } from "../../types/user.type";

interface UserState {
    currentUser: UserProfile | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    currentUser: null,
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserProfile>) => {
            state.currentUser = action.payload;
            state.error = null;
        },
        updateUser: (state, action: PayloadAction<Partial<UserProfile>>) => {
            if(state.currentUser) {
                state.currentUser = {
                    ...state.currentUser,
                    ...action.payload,
                }
            }
        },
        logout: (state) => {
            state.currentUser = null;
            state.loading = false;
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearUser: (state) => {
            state.currentUser = null;
            state.loading = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    }
})

export const { setUser, updateUser, logout, clearError, setLoading, setError } = userSlice.actions;

export const selectCurrentUser = (state: { user: UserState }) => 
    state.user.currentUser;
export const selectIsLoading = (state: { user: UserState }) => state.user.loading;
export const selectError = (state: {  user: UserState }) => state.user.error;

export default userSlice.reducer;
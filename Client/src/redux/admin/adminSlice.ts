import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { UserProfile } from "../../types/user.type";

interface AdminState {
    currentAdmin: UserProfile | null;
    loading: boolean;
    error: string | null;
}

const initialState: AdminState = {
    currentAdmin: null,
    loading: false,
    error: null,
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        setAdmin: (state, action: PayloadAction<UserProfile>) => {
            state.currentAdmin = action.payload;
            state.error = null;
        },
        updateAdmin: (state, action: PayloadAction<Partial<UserProfile>>) => {
            if(state.currentAdmin) {
                state.currentAdmin = {
                    ...state.currentAdmin,
                    ...action.payload,
                }
            }
        },
        logoutAdmin: (state) => {
            state.currentAdmin = null;
            state.loading = false;
            state.error = null;
        },
        setAdminLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setAdminError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearAdmin: (state) => {
            state.currentAdmin = null;
            state.loading = false;
            state.error = null;
        },
        clearAdminError: (state) => {
            state.error = null;
        }
    }
})

export const { setAdmin, updateAdmin, logoutAdmin, clearAdminError, setAdminLoading, setAdminError, clearAdmin } = adminSlice.actions;

export const selectCurrentAdmin = (state: { admin: AdminState }) => 
    state.admin.currentAdmin;
export const selectAdminIsLoading = (state: { admin: AdminState }) => state.admin.loading;
export const selectAdminError = (state: { admin: AdminState }) => state.admin.error;

export default adminSlice.reducer;

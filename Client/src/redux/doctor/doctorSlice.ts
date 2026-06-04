import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserProfile } from "../../types/user.type";

interface DoctorState {
    currentDoctor: UserProfile | null;
    loading: boolean;
    error: string | null;
}

const initialState: DoctorState = {
    currentDoctor: null,
    loading: false,
    error: null,
};

const doctorSlice = createSlice({
    name: 'doctor',
    initialState,
    reducers: {
        setDoctor: (state, action: PayloadAction<UserProfile>) => {
            state.currentDoctor = action.payload;
            state.error = null;
        },
        updateDoctor: (state, action: PayloadAction<Partial<UserProfile>>) => {
            if (state.currentDoctor) {
                state.currentDoctor = {
                    ...state.currentDoctor,
                    ...action.payload,
                }
            } else {
                state.currentDoctor = action.payload as UserProfile;
            }
        },
        logoutDoctor: (state) => {
            state.currentDoctor = null;
            state.loading = false;
            state.error = null;
        },
        setDoctorLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setDoctorError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearDoctor: (state) => {
            state.currentDoctor = null;
            state.loading = false;
            state.error = null;
        },
        clearDoctorError: (state) => {
            state.error = null;
        }
    }
})

export const { setDoctor, updateDoctor, logoutDoctor, clearDoctorError, setDoctorLoading, setDoctorError } = doctorSlice.actions;

export const selectCurrentDoctor = (state: { doctor: DoctorState }) => 
    state.doctor.currentDoctor;
export const selectDoctorIsLoading = (state: { doctor: DoctorState }) => state.doctor.loading;
export const selectDoctorError = (state: {  doctor: DoctorState }) => state.doctor.error;

export default doctorSlice.reducer;

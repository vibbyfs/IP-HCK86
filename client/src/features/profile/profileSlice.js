import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import http from '../../lib/http';

export const fetchProfile = createAsyncThunk(
    'profile/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const res = await http.get('/users/profile', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data || { message: 'Gagal memuat profil' });
        }
    },
    {
        condition: (_, { getState }) => {
            const { profile } = getState();
            if (profile?.status === 'loading') return false;
        },
    }
);

const profileSlice = createSlice({
    name: 'profile',
    initialState: {
        data: null,
        status: 'idle', // idle | loading | succeeded | failed
        error: null,
    },
    reducers: {
        setProfile(state, action) {
            state.data = action.payload;
            state.status = 'succeeded';
            state.error = null;
        },
        clearProfile(state) {
            state.data = null;
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfile.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error;
            });
    },
});

export const { setProfile, clearProfile } = profileSlice.actions;
export const selectProfile = (state) => state.profile.data;
export const selectProfileStatus = (state) => state.profile.status;
export const selectProfileError = (state) => state.profile.error;
export default profileSlice.reducer;
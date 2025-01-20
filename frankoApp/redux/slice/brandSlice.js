// src/Redux/Slice/brandSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://smfteapi.salesmate.app';

// Fetch brands
export const fetchBrands = createAsyncThunk('brand/fetchBrands', async () => {
    const response = await axios.get(`${API_URL}/Brand/Get-Brand`);
    return response.data; // Adjust based on your backend response
});


const brandSlice = createSlice({
    name: 'brands',
    initialState: {
        brands: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBrands.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBrands.fulfilled, (state, action) => {
                state.loading = false;
                state.brands = action.payload;
            })
            .addCase(fetchBrands.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    },
});

export default brandSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = 'https://smfteapi.salesmate.app';

export const getAdvertisment = createAsyncThunk(
  "advertisment/get",
  async (AdsName, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://smfteapi.salesmate.app/Advertisment/GetAdvertisment?AdsName=${encodeURIComponent(AdsName)}`
      );

      // ✅ Ensure data is an array and remove index 0
      const formattedData = Array.isArray(response.data)
        ? response.data.slice(1) // Exclude first advertisement (index 0)
        : [];

      return formattedData;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch advertisements");
    }
  }
);

export const getBannerPageAdvertisment = createAsyncThunk(
  "advertisment/getBannerPage",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://smfteapi.salesmate.app/Advertisment/GetAdvertisment?AdsName=${encodeURIComponent("Banner")}`
      );

      // Ensure data is an array and exclude index 0
      const formattedData = Array.isArray(response.data) ? response.data.slice(1) : [];

      return formattedData;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch Home Page advertisements");
    }
  }
);

export const getHomePageAdvertisment = createAsyncThunk(
  "advertisment/getHomePage",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://smfteapi.salesmate.app/Advertisment/GetAdvertisment?AdsName=${encodeURIComponent("Home Page")}`
      );

      // ✅ Ensure data is an array and remove index 0
      const formattedData = Array.isArray(response.data)
        ? response.data.slice(1) // Exclude first advertisement (index 0)
        : [];

      return formattedData;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch Home Page advertisements");
    }
  }
);



// Slice

const advertismentSlice = createSlice({
  name: "advertisment",
  initialState: {
    advertisments: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(getAdvertisment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdvertisment.fulfilled, (state, action) => {
        state.loading = false;
        state.advertisments = action.payload;
      })
      .addCase(getAdvertisment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getHomePageAdvertisment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHomePageAdvertisment.fulfilled, (state, action) => {
        state.loading = false;
        state.advertisments = action.payload;
      })
      .addCase(getHomePageAdvertisment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getBannerPageAdvertisment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBannerPageAdvertisment.fulfilled, (state, action) => {
        state.loading = false;
        state.advertisments = action.payload; // Ensure correct field
      })
      
      .addCase(getBannerPageAdvertisment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
     
  },
});

export default advertismentSlice.reducer;

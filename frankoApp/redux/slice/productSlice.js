import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Define the API base URL
const API_BASE_URL = "https://smfteapi.salesmate.app"


export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Product/Product-Get`);
     
      const products = response.data;

      // Filter and sort
      const filteredProducts = products
        .filter(product => product.status == 1) // Loose equality to handle possible type mismatch
        .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
      
  
      return filteredProducts;
    } catch (error) {
     
      throw error;
    }
  }
);
export const fetchProduct = createAsyncThunk(
  'products/fetchProduct',
  async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Product/Product-Get`);
      const products = response.data;

      // Filter, sort, and limit to the most recent 24
      const filteredProducts = products
        .filter(product => product.status == 1) // Loose equality to handle possible type mismatch
        .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
        .slice(0, 24); // Limit to the 24 most recent

      return filteredProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }
);

export const fetchProductsByBrand = createAsyncThunk('products/fetchProductsByBrand', async (brandId) => {
  const response = await axios.get(`${API_BASE_URL}/Product/Product-Get-by-Brand/${brandId}`);
  return response.data.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
});

export const fetchProductsByShowroom = createAsyncThunk('products/fetchProductsByShowroom', async (showRoomID) => {
  const response = await axios.get(`${API_BASE_URL}/Product/Product-Get-by-ShowRoom/${showRoomID}`);
  return { showRoomID, products: response.data.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)) };
});

export const fetchProductById = createAsyncThunk('products/fetchProductById', async (productId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/Product/Product-Get-by-Product_ID/${productId}`);
 
    return response.data;
  } catch (error) {
   
    throw error;
  }
});

// Create the product slice
const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],

    filteredProducts: [],
    productsByShowroom: {},
    currentProduct: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearProducts: (state) => {
      state.products = [];
      state.filteredProducts = [];
      state.productsByShowroom = {};
      state.currentProduct = null;
      state.error = null;

    },
    setProductsCache: (state, action) => {
      const { brandId, products } = action.payload;
      state.productsCache[brandId] = products;
    },
   
    resetProducts: (state) => {
      state.products = [];
      state.filteredProducts = [];
      state.productsByShowroom = {};
      state.currentProduct = null;
      state.error = null;
    },
    
  },
  extraReducers: (builder) => {
    builder
    
    
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
   
      .addCase(fetchProductsByBrand.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsByBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProductsByBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchProductsByShowroom.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsByShowroom.fulfilled, (state, action) => {
        state.loading = false;
        const { showRoomID, products } = action.payload;
        state.productsByShowroom[showRoomID] = products;
      })
      .addCase(fetchProductsByShowroom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      },
});
// Export the reducer and actions
export const { clearProducts, setFilteredProducts, setProductsCache, resetProducts } = productSlice.actions;
export default productSlice.reducer;
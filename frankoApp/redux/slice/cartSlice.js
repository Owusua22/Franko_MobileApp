import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import UUID from 'react-native-uuid'; // Use this package for generating unique IDs

const BASE_URL = "https://smfteapi.salesmate.app";

// Thunks for API calls
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, price, quantity }, { rejectWithValue, dispatch }) => {
    try {
      // Get the current cartId from AsyncStorage
      let cartId = await AsyncStorage.getItem('cartId');
      
      // If no cartId exists, generate a new one and store it in AsyncStorage
      if (!cartId) {
        cartId = UUID.v4(); // Generate a unique cartId
        await AsyncStorage.setItem('cartId', cartId);
      }

      // Make the API call to add the item to the cart
      const response = await axios.post(`${BASE_URL}/Cart/Add-To-Cart`, {
        cartId,
        productId,
        price,
        quantity,
      });

      // Create the new cart item
      const newCartItem = { cartId, productId, price, quantity };
      
      // Get the current cart items from AsyncStorage
      const cart = JSON.parse(await AsyncStorage.getItem('cart')) || [];
      
      // Add the new item to the cart
      cart.push(newCartItem);
      
      // Store the updated cart in AsyncStorage
      await AsyncStorage.setItem('cart', JSON.stringify(cart));

      // Calculate the new totalItems count
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

      // Dispatch the loadCart action to update the Redux state
      dispatch(loadCart({ cart, totalItems }));

      return newCartItem;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getCartById = createAsyncThunk(
  'cart/getCartById',
  async (cartId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/Cart/Cart-GetbyID/${cartId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);



export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ cartId, productId, quantity }, { rejectWithValue, dispatch }) => {
    try {
      // Make the API call to update the cart item
      await axios.post(`${BASE_URL}/Cart/Cart-Update/${cartId}/${productId}/${quantity}`);

      // Get the current cart from AsyncStorage
      const cart = JSON.parse(await AsyncStorage.getItem('cart')) || [];
      
      // Update the cart item
      const updatedCart = cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity } // Update the quantity of the matching item
          : item // Keep the rest of the items the same
      );

      // Save the updated cart back to AsyncStorage
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));

      // Dispatch loadCart to refresh the cart state
      dispatch(loadCart());

      return { cartId, productId, quantity };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  'cart/deleteCartItem',
  async ({ cartId, productId }, { dispatch, rejectWithValue }) => {
    try {
      await axios.post(`${BASE_URL}/Cart/Cart-Delete/${cartId}/${productId}`);

      const cart = JSON.parse(await AsyncStorage.getItem('cart')) || [];
      const updatedCart = cart.filter(item => item.productId !== productId);
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));

      // Dispatch loadCart to refresh cart state
      dispatch(loadCart());

      return { cartId, productId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  try {
    // Remove cart and cartId from AsyncStorage
    await AsyncStorage.removeItem('cart');
    await AsyncStorage.removeItem('cartId');
    return [];
  } catch (error) {
    return rejectWithValue(error.message);
  }
});
export const loadCart = createAsyncThunk('cart/loadCart', async (_, { rejectWithValue }) => {
  try {
    const cart = JSON.parse(await AsyncStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    return { cart, totalItems };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItems: [], // Renamed to cartItems for clarity
    cartId: null,
    loading: false,
    error: null,
    totalItems: 0, // Added totalItems to the state
  },
  reducers: {
    loadFromStorage(state, action) {
      state.cartItems = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(loadCart.fulfilled, (state, action) => {
      state.cartItems = action.payload.cart;
      state.totalItems = action.payload.totalItems;
    })
    .addCase(addToCart.fulfilled, (state, action) => {
      const existingIndex = state.cartItems.findIndex(
        (item) => item.productId === action.payload.productId
      );
      if (existingIndex !== -1) {
        state.cartItems[existingIndex].quantity += action.payload.quantity;
      } else {
        state.cartItems.push(action.payload);
      }
      state.totalItems += action.payload.quantity;
    })

      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCartById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCartById.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
      })
      .addCase(getCartById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.cartItems.findIndex(
          (item) => item.productId === action.payload.productId
        );
        if (index !== -1) {
          state.cartItems[index].quantity = action.payload.quantity;
        }
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = state.cartItems.filter(
          (item) => item.productId !== action.payload.productId
        );
        state.totalItems = state.cartItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.cartItems = [];
        state.cartId = null;
        state.totalItems = 0; // Reset totalItems
      });
  },
});

export default cartSlice.reducer;
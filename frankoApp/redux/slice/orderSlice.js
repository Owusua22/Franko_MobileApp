import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://smfteapi.salesmate.app"; // Backend API base URL


const clearOrdersFromAsyncStorage = async () => {
  try {
    await AsyncStorage.removeItem("orders");
  } catch (error) {
    console.error("Error clearing orders in AsyncStorage", error);
  }
};
// Thunks
export const checkOutLocalStorageCart = createAsyncThunk(
  "orders/checkOutLocalStorageCart",
  async (
    { cartId, productId, price, quantity, customerid, orderDate, paymentMode, paymentService, paymentAccountNumber, customerAccountType },
    { rejectWithValue }
  ) => {
    try {
      const payload = {
        cartId,
        productId,
        price,
        quantity,
        customerid,
        orderDate,
        paymentMode,
        paymentService,
        paymentAccountNumber,
        customerAccountType,
      };

      const response = await axios.post(
        `${API_BASE_URL}/Order/CheckOutLocalStorageCart`,
        payload
      );

      return response.data;  // Return the API response data
    } catch (error) {
      console.error("Checkout Local Storage error:", error.response?.data);
      return rejectWithValue(error.response?.data || "Failed to checkout local storage cart");
    }
  }
);

// Thunks
export const checkOutOrder = createAsyncThunk(
  "orders/checkOutOrder",
  async (
    { Cartid, orderCode, customerId, PaymentMode, paymentService, PaymentAccountNumber, customerAccountType }, 
    { rejectWithValue }
  ) => {
    try {
      const payload = {
        Cartid,                // Correct parameter names
        orderCode,
        customerId,
        PaymentMode,
        paymentService,
        PaymentAccountNumber,
        customerAccountType,
      };

      const response = await axios.post(
        `${API_BASE_URL}/Order/CheckOutDbCart`,
        payload
      );

      return response.data;
    } catch (error) {
      console.error("Checkout error:", error.response?.data);
      return rejectWithValue(error.response?.data || "Failed to checkout order");
    }
  }
);


export const getSalesOrder = createAsyncThunk(
  "orders/getSalesOrder",
  async (OrderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Order/SalesOrderGet/${OrderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch sales order"
      );
    }
  }
);

export const createOrderAddress = createAsyncThunk(
  "orders/CreateOrderAddress",
  async (
    { customerId, OrderCode, address, geoLocation ,RecipientName, RecipientContactNumber, orderNote},
    { rejectWithValue }
  ) => {
    try {
      // Create both camelCase and PascalCase fields
      const requestData = {
        // camelCase version
        customerId,
        OrderCode,
        address,
        geoLocation,RecipientName,RecipientContactNumber, orderNote,
        
       
      };

      const response = await axios.post(`${API_BASE_URL}/Order/OrderAddress`, requestData);

      // Return the response data if the request is successful
      return response.data;
    } catch (error) {
      // Return the error response if the request fails
      return rejectWithValue(
        error.response?.data || "Failed to update order address"
      );
    }
  }
);

export const updateOrderDelivery = createAsyncThunk(
  "orders/updateOrderDelivery",
  async ({ orderCode, address, recipientName, recipientContactNumber, orderNote, geoLocation, Customerid }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Order/OrderDeliveryUpdate/${orderCode}`,
        {
          orderCode,
          Customerid,
          address,
          recipientName,
          recipientContactNumber,
          orderNote,
          geoLocation,
        },
  
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update order delivery"
      );
    }
  }
);

export const fetchOrdersByCustomer = createAsyncThunk(
  "orders/fetchOrdersByCustomerOrAgent",
  async ({ from, to, customerId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Order/GetOrderByCustomer`, // Correct API URL
        {
          params: { from, to, customerId },
        }
      );

      // Ensure response.data is an array and return it, or an empty array if null/undefined
      return response.data || [];
    } catch (error) {
      console.error("Error fetching orders by customer:", error);
      // Return a proper error message, handling both response and general error
      return rejectWithValue(
        error.response?.data || error.message || "Failed to fetch orders by customer"
      );
    }
  }
);
export const fetchOrderDeliveryAddress = createAsyncThunk(
  "orders/fetchOrderDeliveryAddress",
  async (OrderCode, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Order/GetOrderDeliveryAddress/${OrderCode}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch delivery address"
      );
    }
  }
);
// Order slice
const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    deliveryAddress: [],
    orderDetails: null,
    addressDetails: null,
    deliveryUpdate: null,
    loading: { orders: false,  deliveryAddress: false, deliveryUpdate: false },
    error: { orders: null, lifeCycle: null, deliveryAddress: null, deliveryUpdate: null },
  },
  reducers: {
    clearOrders: (state) => {
      state.orders = [];
      clearOrdersFromAsyncStorage(); // Clear from AsyncStorage
    },
  },
  extraReducers: (builder) => {
    builder
      // Checkout order
      .addCase(checkOutOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkOutOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
      })
      .addCase(checkOutOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get sales order
      .addCase(getSalesOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSalesOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetails = action.payload;
      })
      .addCase(getSalesOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create order address
      .addCase(createOrderAddress.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrderAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addressDetails = action.payload;
      })
      .addCase(createOrderAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update order delivery
      .addCase(updateOrderDelivery.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrderDelivery.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveryUpdate = action.payload;
      })
      .addCase(updateOrderDelivery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderDeliveryAddress.fulfilled, (state, action) => {
        // Ensure that the returned value from the API is an object, not false.
        if (action.payload) {
          state.deliveryAddress = action.payload;
        } else {
          state.deliveryAddress = null; // Avoid setting a boolean value
        }
      })
      .addCase(fetchOrderDeliveryAddress.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Load local orders
      .addCase(fetchOrdersByCustomer.pending, (state) => {
        state.loading.orders = true;

      })
      .addCase(fetchOrdersByCustomer.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading.orders = false;
      })
      .addCase(fetchOrdersByCustomer.rejected, (state, action) => {
        state.error.orders = action.error.message;
        state.loading.orders = false;
      })
      .addCase(checkOutLocalStorageCart.pending, (state) => {
        state.checkoutStatus = "loading";
      })
      .addCase(checkOutLocalStorageCart.fulfilled, (state, action) => {
        state.checkoutStatus = "succeeded";
        // Optionally, handle the response data (e.g., save it in state)
      })
      .addCase(checkOutLocalStorageCart.rejected, (state, action) => {
        state.checkoutStatus = "failed";
        state.error = action.payload;
      });
  },
});

// Actions
export const { clearOrders } = orderSlice.actions;

// Selectors
export const selectOrders = (state) => state.order.orders;
export const selectOrderLoading = (state) => state.order.loading;
export const selectOrderError = (state) => state.order.error;
export const selectOrderDetails = (state) => state.order.orderDetails;
export const selectAddressDetails = (state) => state.order.addressDetails;
export const selectDeliveryUpdate = (state) => state.order.deliveryUpdate;

export default orderSlice.reducer;

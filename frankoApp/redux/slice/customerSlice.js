import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

// Define the API base URL
const API_BASE_URL = "https://smfteapi.salesmate.app";

// Async thunk for creating a new customer
export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/Users/Customer-Post`, customerData);
      return response.data;
    } catch (error) {
      // Check if error.response exists and contains data
      const errorMessage = error.response?.data?.message || error.response?.data || "An unknown error occurred.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for fetching all customers
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Users/Customer-Get`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An unknown error occurred.");
    }
  }
);

// Async thunk for login
export const loginCustomer = createAsyncThunk(
  'customers/loginCustomer',
  async ({ contactNumber, password }, { dispatch, rejectWithValue }) => {
    try {
      const fetchCustomersResult = await dispatch(fetchCustomers()).unwrap();

      const matchingCustomer = fetchCustomersResult.find(
        (customer) =>
          customer.contactNumber === contactNumber && customer.password === password
      );

      if (matchingCustomer) {
        // Save customer to AsyncStorage
        await AsyncStorage.setItem('customer', JSON.stringify(matchingCustomer));
        return matchingCustomer;
      } else {
        return rejectWithValue("No customer found with the provided credentials.");
      }
    } catch (error) {
      return rejectWithValue(error.message || "An unknown error occurred.");
    }
  }
);
<<<<<<< HEAD
export const updateAccountStatus = createAsyncThunk(
  "customers/updateAccountStatus",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching customer details from AsyncStorage...");
      const customer = await AsyncStorage.getItem("customer");

      if (!customer) {
        console.error("No customer found in AsyncStorage.");
        return rejectWithValue("No customer found.");
      }

      const parsedCustomer = JSON.parse(customer);
      console.log("Customer details:", parsedCustomer);

      const { customerAccountNumber } = parsedCustomer; // Fix here
      console.log("Customer account number:", customerAccountNumber);

      if (!customerAccountNumber) {
        console.error("Missing customerAccountNumber.");
        return rejectWithValue("Invalid customer data.");
      }

      const response = await axios.post(`${API_BASE_URL}/Users/Customer-Status`, {
        accountNumber: customerAccountNumber, // Fix here
        accountStatus: "0",
      });

      console.log("Response from server:", response.data);

      // Remove customer from AsyncStorage
      await AsyncStorage.removeItem("customer");
      console.log("Customer data removed from AsyncStorage.");

      return response.data;
    } catch (error) {
      console.error("Error updating account status:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || "Failed to update account status.");
    }
  }
);

=======
>>>>>>> 4418917 (Initial commit)

// Initial state
const initialState = {
  currentCustomer: null,
  currentCustomerDetails: null,
  customerList: [],
  selectedCustomer: null, // Add this
  loading: false,
  error: null,
};


// Create the customer slice
const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    logoutCustomer: (state) => {
      state.currentCustomer = null;
      state.currentCustomerDetails = null;
      AsyncStorage.removeItem('customer'); // Clear from AsyncStorage on logout
    },
    
    clearCustomers: (state) => {
      state.customerList = [];
    },
    setCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.ResponseCode === '1') {
          const newCustomer = { ...action.meta.arg, ...action.payload };
          state.currentCustomer = newCustomer;
          AsyncStorage.setItem('customer', JSON.stringify(newCustomer)); // Store in AsyncStorage
        } else {
          state.error = action.payload?.message || "Failed to create customer.";
        }
      })
      
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "An unknown error occurred.";
      })
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customerList = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "An unknown error occurred.";
      })
      .addCase(loginCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload;
        state.currentCustomerDetails = action.payload;
      })
      .addCase(loginCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed.";
<<<<<<< HEAD
      })
      .addCase(updateAccountStatus.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateAccountStatus.fulfilled, (state) => {
        state.status = "succeeded";
        state.customerData = null; // Clear customer data from Redux
      })
      .addCase(updateAccountStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update account status.";
=======
>>>>>>> 4418917 (Initial commit)
      });
  
  },
});

export const { logoutCustomer, clearCustomers, setCustomer, clearSelectedCustomer } = customerSlice.actions;

// Export the reducer
export default customerSlice.reducer;
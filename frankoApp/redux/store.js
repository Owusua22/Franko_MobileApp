import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import productReducer from './slice/productSlice';
import brandReducer from './slice/brandSlice';
import categoryReducer from './slice/categorySlice';
import cartReducer from './slice/cartSlice';
import customerReducer from './slice/customerSlice';
import orderReducer from './slice/orderSlice';
import shippingReducer from './slice/shippingSlice';
import showroomReducer from "./slice/showroomSlice";
import advertismentReducer from './slice/advertismentSlice';
import paymentReducer from './slice/paymentSlice';
import wishlistReducer from './wishlistSlice';

const rootReducer = combineReducers({
  categories: categoryReducer,
  products: productReducer,
  brands: brandReducer,
  showrooms: showroomReducer,
  cart: cartReducer,
  customer: customerReducer,
  order: orderReducer,
  shipping: shippingReducer,
  advertisment: advertismentReducer,
  payment: paymentReducer,
  wishlist: wishlistReducer,
});

// Create the store without redux-persist
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // optional: disable serializable state check
      immutableCheck: false,    // optional: disable immutable state check
    }),
});

// src/redux/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

const initialState = {
  cartItems: [],
  totalQuantity: 0,
  totalPrice: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState: initialState,
  reducers: {
    // Add item to cart or increment quantity
    addToCart(state, action) {
      const existingItem = state.cartItems.findIndex(
        (item) => 
          String(item.productId._id || item.productId) === 
          String(action.payload.productId._id || action.payload.productId)
      );

      if (existingItem >= 0) {
        state.cartItems[existingItem].quantity += 1;
      } else {
        state.cartItems.push({
          ...action.payload,
          quantity: 1,
        });
      }
      cartSlice.caseReducers.calculateTotals(state);
    },

    // Increment quantity
    incrementQuantity(state, action) {
      const item = state.cartItems.find(
        (item) =>
          String(item.productId._id || item.productId) ===
          String(action.payload)
      );
      if (item) {
        item.quantity += 1;
        // Recalculate totals
        state.totalQuantity = state.cartItems.reduce(
          (sum, it) => sum + (it.quantity || 0),
          0
        );
        state.totalPrice = state.cartItems.reduce(
          (sum, it) =>
            sum + (it.productId?.price || 0) * (it.quantity || 0),
          0
        );
      }
    },

    // Decrement quantity
    decrementQuantity(state, action) {
      const itemIndex = state.cartItems.findIndex(
        (item) =>
          String(item.productId._id || item.productId) ===
          String(action.payload)
      );
      if (itemIndex >= 0) {
        if (state.cartItems[itemIndex].quantity > 1) {
          state.cartItems[itemIndex].quantity -= 1;
        } else {
          state.cartItems.splice(itemIndex, 1);
        }
        // Recalculate totals
        state.totalQuantity = state.cartItems.reduce(
          (sum, it) => sum + (it.quantity || 0),
          0
        );
        state.totalPrice = state.cartItems.reduce(
          (sum, it) =>
            sum + (it.productId?.price || 0) * (it.quantity || 0),
          0
        );
      }
    },

    // Remove item from cart
    removeFromCart(state, action) {
      state.cartItems = state.cartItems.filter(
        (item) =>
          String(item.productId._id || item.productId) !==
          String(action.payload)
      );
      cartSlice.caseReducers.calculateTotals(state);
    },

    // Set entire cart
    setCart(state, action) {
      state.cartItems = action.payload;
      cartSlice.caseReducers.calculateTotals(state);
    },

    // Set loading state
    setLoading(state, action) {
      state.loading = action.payload;
    },

    // Set error state
    setError(state, action) {
      state.error = action.payload;
    },

    // Clear cart
    clearCart(state) {
      state.cartItems = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
      state.error = null;
    },

    // Calculate totals (helper reducer)
    calculateTotals(state) {
      state.totalQuantity = state.cartItems.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );
      state.totalPrice = state.cartItems.reduce(
        (sum, item) =>
          sum +
          (item.productId?.price || 0) * (item.quantity || 0),
        0
      );
    },
  },
});









































// Async thunk to fetch cart from backend (background revalidation)
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    const token = Cookies.get("jwttoken");
    if (!token) return rejectWithValue("Not authenticated");
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const validItems = (res.data.cart || []).filter((i) => i.productId);
      return validItems;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message || "Fetch failed");
    }
  }
);

// handle fetchCart lifecycle in extraReducers
cartSlice.extraReducers = (builder) => {
  builder
    .addCase(fetchCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchCart.fulfilled, (state, action) => {
      state.cartItems = action.payload;
      cartSlice.caseReducers.calculateTotals(state);
      state.loading = false;
      state.error = null;
    })
    .addCase(fetchCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch cart";
    });
};

export default cartSlice.reducer;
export const {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  setCart,
  setLoading,
  setError,
  clearCart,
} = cartSlice.actions;
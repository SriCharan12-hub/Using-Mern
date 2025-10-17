import cartSlice from "./Slice";
import { configureStore } from "@reduxjs/toolkit";

// Try to load persisted cart from localStorage
function loadCartFromLocalStorage() {
    try {
        const serialized = localStorage.getItem("cartState");
        if (!serialized) return undefined;
        return { cart: JSON.parse(serialized) };
    } catch (e) {
        console.error("Failed to load cart from localStorage", e);
        return undefined;
    }
}

const preloadedState = loadCartFromLocalStorage();

const Store = configureStore({
    reducer: {
        cart: cartSlice,
    },
    preloadedState,
});

// Subscribe to store changes and persist cart slice
Store.subscribe(() => {
    try {
        const state = Store.getState();
        const toPersist = state.cart;
        localStorage.setItem("cartState", JSON.stringify(toPersist));
    } catch (e) {
        console.error("Failed to save cart to localStorage", e);
    }
});

export default Store;
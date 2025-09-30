// src/Components/Slice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cardItems: [] ,
    totalquantity:0,
    totalprice:0
};



const cartSlice = createSlice({
    name:"cartstore",
    initialState,
    reducers:{
        addToTask(state,data){
            const itemcard = state.cardItems.findIndex((index)=>index.productId === data.payload.productId)
            if (itemcard >= 0){
                // If the item exists, increment its quantity
                state.cardItems[itemcard].quantity += 1;
            }
            else{
                // If the item is new, add it to the cart with a quantity of 1
                const tempproduct = {...data.payload, quantity: 1};
                state.cardItems.push(tempproduct);
            }
        },
        increaseCount(state, action) {
            const itemIndex = state.cardItems.findIndex(
                (item) => item.productId === action.payload.productId
            );
            if (itemIndex >= 0) {
                state.cardItems[itemIndex].quantity += 1;
            }
        },
        decreaseCount(state, action) {
            const itemIndex = state.cardItems.findIndex(
                (item) => item.productId === action.payload.productId
            );
            if (itemIndex >= 0 && state.cardItems[itemIndex].quantity > 1) {
                state.cardItems[itemIndex].quantity -= 1;
            }
        },

        removing(state, data) {
            const itemcard = state.cardItems.filter((index) => index.productId !== data.payload.productId)
            state.cardItems = itemcard
        },

        setCart: (state, action) => {
            state.cardItems = action.payload;
        },
        updateQuantity(state,action){
            const {productId,action:qtyAction}= action.payload
            const itemIndex = state.cardItems.findIndex(
                (item) => item.productId === productId
            );
            if (itemIndex>=0){
                if (qtyAction==="increment"){
                    state.cardItems[itemIndex].quantity+=1
                }
                else if (qtyAction==='decrement' && state.cardItems[itemIndex].quantity > 1) {
                    state.cardItems[itemIndex].quantity -= 1;
                }
            }
        }
    
    }

})
export default cartSlice.reducer
export const {addToTask, increaseCount, decreaseCount, removing, setCart,updateQuantity } = cartSlice.actions
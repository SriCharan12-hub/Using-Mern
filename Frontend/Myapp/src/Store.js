import cartSlice from "./Slice";
import { configureStore } from "@reduxjs/toolkit";
const Store = configureStore({
    reducer:{
        Cartstate:cartSlice,
    }
    
})
export default  Store
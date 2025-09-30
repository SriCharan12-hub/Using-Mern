import { useradd, userlogin, updateuser, getdetails, googleLogin, resetpassword } from "../Controller/Usercontroller.js";
import { addProduct, getProducts, updateProduct, deleteProduct } from "../Controller/Productcontroller.js";
import { getCart, removeFromCart, clearCart, addToCart, updateQuantity } from "../Controller/Cartcontroller.js";
import { placeOrder } from "../Controller/Ordercontoller.js";
import {addItemToWishlist,getWishlist,removeItemFromWishlist} from "../Controller/Wishlistcontroller.js"
import { forgotPassword,verifyOtp } from "../Controller/ResetPincontroller.js";
import { Router } from "express";
import authMiddleware from "../Connection/middleware.js";
import { addAddress, deleteAddress, getAddressesByUserId, updateAddress } from "../Controller/AddressController.js";

const route = Router()

//user
route.post('/register', useradd)
route.post('/login', userlogin)
route.post('/login/google', googleLogin)
route.put('/user/update', authMiddleware, updateuser)
route.get('/user/get', authMiddleware, getdetails)
route.put('/user/resetpassword',resetpassword)

// Cart endpoints (authenticated)
route.get('/cart', authMiddleware, getCart); // GET to retrieve the whole cart
route.post('/cart/add', authMiddleware, addToCart); // POST to add a new item
route.put('/cart/item', authMiddleware, updateQuantity); // PUT to update quantity
route.delete('/cart/item', authMiddleware, removeFromCart); // DELETE for a specific item
route.delete('/cart/clear', authMiddleware, clearCart); // DELETE to clear the whole cart

//product 
route.post('/products/add',authMiddleware, addProduct)
route.get('/products/get',authMiddleware, getProducts)
route.put('/products/:id', authMiddleware,updateProduct);
route.delete('/products/:id',authMiddleware, deleteProduct);


//wishlist 

route.get('/wishlist/get', authMiddleware, getWishlist);
route.post('/wishlist/add', authMiddleware, addItemToWishlist);
route.delete('/wishlist/remove', authMiddleware, removeItemFromWishlist);


//resetpin

route.post("/forgot-password", forgotPassword);
route.post("/verify-otp", verifyOtp);


//address

route.post('/addaddress',authMiddleware,addAddress)
route.get('/getaddress',authMiddleware,getAddressesByUserId)
route.put('/updateaddress/:id',authMiddleware,updateAddress)
route.delete('/deleteaddress/:id',authMiddleware,deleteAddress)


//order
route.post('/checkout', authMiddleware, placeOrder);

export default route;


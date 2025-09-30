
import ordermodel from '../Model/Ordermodel.js';
import mongoose from 'mongoose';
import Product from '../Model/Productmodel.js';
import Cartmodel from '../Model/Cartmodel.js';

export const placeOrder = async (req, res) => {
    
    const userId = req.user.id; 
    const { 
        shippingDetails, 
        paymentMethod, 
        items, 
        totalAmount 
    } = req.body;

  
    if (!shippingDetails || !paymentMethod || !items || items.length === 0 || !totalAmount) {
        return res.status(400).json({ 
            success: false, 
            message: "Missing required order details (shipping, payment, or items)." 
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
       
        const itemIds = items.map(item => item.productId);
        const productsInDB = await Product.find({ _id: { $in: itemIds } }).session(session);

        let calculatedSubtotal = 0;
        const orderItems = [];
        
        for (const item of items) {
            const productDB = productsInDB.find(p => p._id.toString() === item.productId);
            
            if (!productDB) {
                throw new Error(`Product not found: ${item.productId}`);
            }

            if (productDB.count < item.quantity) {
                 
                throw new Error(`Insufficient stock for product: ${productDB.title}`);
            }

            
            calculatedSubtotal += productDB.price * item.quantity;
            
            orderItems.push({
                productId: item.productId,
                quantity: item.quantity,
                priceAtOrder: productDB.price,
            });
        }
        
        
        const shippingCost = 5.0;
        const taxes = calculatedSubtotal * 0.10;
        const calculatedTotal = calculatedSubtotal + shippingCost + taxes;

        // Verify client total matches server total (allowing for tiny floating point errors)
        if (Math.abs(calculatedTotal - totalAmount) > 0.1) {
            throw new Error(`Price mismatch. Calculated total: ${calculatedTotal.toFixed(2)}`);
        }

        // 2. Determine Payment Status
        const paymentStatus = paymentMethod === 'cod' ? 'Pending' : 'Paid'; // Simplify for non-integrated payment

        // 3. Create the New Order
        const newOrder = new ordermodel({
            userId,
            items: orderItems,
            shippingDetails,
            totalAmount: calculatedTotal,
            paymentMethod,
            paymentStatus,
            orderStatus: "Processing",
        });

        const savedOrder = await newOrder.save({ session });

        // 4. Update Product Stock (Decrement Inventory)
        const updateStockPromises = orderItems.map(item => 
            Product.updateOne(
                { _id: item.productId },
                { $inc: { count: -item.quantity } },
                { session }
            )
        );
        await Promise.all(updateStockPromises);

        // 5. Clear the User's Cart
        await Cartmodel.deleteOne({ userId }).session(session); // Assuming one cart document per user

        // 6. Commit Transaction
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            order: savedOrder,
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("Order placement failed:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to place order due to an internal error." 
        });
    }
};


// models/orderModel.js
import db from '../config/db.js';

const orderModel = {
    async getOrders() {
        const ordersResult = await db.query('SELECT * FROM orders')
        return ordersResult;
    },
    async getUserOrders(user_id) {
        try {
            const userOrdersResult = await db.query('SELECT * FROM orders WHERE user_id = $1', [user_id])

            if (userOrdersResult.data === 0)
                return { success: false, message: 'No orders found for this user.' };
            
            // console.log(userOrdersResult.rows);
            // orders: userOrdersResult.data.rows, 
            return { orders: userOrdersResult.rows, success: true, message: 'Returned user order history.' };
        } catch (error){
            console.error('Error fetching order items:', error);
        }
    },
    async createOrderdb(user_id, amount) {
        try {
            const userOrdersResult = await db.query(`INSERT INTO orders(user_id, total_cost)
                                                    VALUES ($1, $2);`, [user_id, amount])

            console.log(userOrdersResult);
        } catch (error){
            console.error('Error creating order:', error);
        }
    },
    async getUserOrderItems(order_id) {

        const orderItemsResult = await db.query("SELECT mi.name, mi.price, oi.quantity " +
                                                "FROM order_item oi " +
                                                "JOIN menu_items mi ON oi.item_id = mi.menu_item_id " +
                                                "WHERE oi.order_id = $1 " +
                                                "ORDER BY mi.price DESC", [order_id]);
        console.log(orderItemsResult.rows);
        return orderItemsResult;
    }
};

export default orderModel;
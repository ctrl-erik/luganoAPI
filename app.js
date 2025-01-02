import express from 'express'
import cors from 'cors'
import pool from './config/db.js';
import rateLimit from 'express-rate-limit';

const app = express();
app.set('trust proxy', 1); // Trust the first proxy

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // 100 requests per 15 mins
app.use(cors());
app.use(express.json());


/* IMPORT MODELS */
import userModel from './models/userModel.js'
import menuModel from './models/menuModel.js'
import cartModel from './models/cartModel.js'
import favModel from './models/favModel.js'
import orderModel from './models/orderModel.js'

import authService from './middleware/authService.js'
import Stripe from 'stripe'

/* USER ORDERS INTERACTIONS */
app.get('/getOrders', async function (req, res) {
    console.log("getOrders route hit")

    try {
        const response = await orderModel.getOrders();
        res.json(response);
    } catch (error) {
        console.error('Error fetching user orders:', error);
    }
});

app.get('/getUserOrders', async function (req, res) {
    console.log("getUserOrders route hit")
    const user_id = req.query.user_id
    try {
        const result = await orderModel.getUserOrders(user_id);
        console.log(result)
        res.json(result);
    } catch (error) {
        console.error('Error fetching user orders:', error);
    }
});

app.get('/getOrderItems', async function (req, res) {
    const order_id = req.query.order_id
    console.log("getOrderItems route hit: " + order_id)
    try {
        const result = await orderModel.getUserOrderItems(order_id);
        // console.log(result)
        // res.json(result);
    } catch (error) {
        console.error('Error fetching user orders:', error);
    }
});
app.post('/createUserOrder', async function (req, res) {
    const { user_id, amount } = req.body

    console.log("createUserOrder route hit")
    try {
        const result = await orderModel.createOrderdb(user_id, amount);
        console.log(result)
        // res.json(result);
    } catch (error) {
        console.error('Error creating user orders:', error);
    }
});


/* USER CART INTERACTIONS */
//make get
app.post('/getCart', async function (req, res) {
    console.log("getCart route hit")
    // acknowledge request received on the console for debugging
    // set values from request
    const id = req.body.user_id
    try {
        // sanitized parameters
        const cartResult = await cartModel.getCartdb(id);
        // console.log(cartResult)
        res.json({ cart_items: cartResult.rows });
    } catch (error) {
        console.error('Error fetching cart items:', error);
    }
});

app.post('/addCart', async function (req, res) {
    // acknowledge request received on the console for debugging
    // set values from request
    const { menu_item, cart_id } = req.body;

    try {
        // sanitized parameters
        const addItemResult = await cartModel.addCartItemdb(cart_id, menu_item);
        res.json(addItemResult);
    } catch (error) {
        console.error('Error adding menu item to cart:', error);
    }
});

app.post('/removeCartItem', async function (req, res) {
    // acknowledge request received on the console for debugging
    console.log("removeCartItem API route hit.")
    // set values from request
    const { user_id, menu_item_id, cart_id } = req.body;
    console.log("Menu Item: " + JSON.stringify(menu_item_id))
    console.log("Cart Item ID: " + cart_id)
    try {
        // sanitized parameters
        const removeItemResult = await cartModel.removeCartItemdb(user_id, cart_id, menu_item_id);
        res.json(removeItemResult);
    } catch (error) {
        console.error('Error removing menu item from cart:', error);
    }
});

/* MENU DB INTERACTIONS */
app.get('/getMenu', async function (req, res) {

    const category_id = req.query.category_id; // set values from request
    try {
        const menuResult = await menuModel.getMenudb(category_id); // sanitize

        if (menuResult.rowCount === 0)
            return res.status(404).json({ message: 'No menu items found for this category.' });
        res.json({ items: menuResult });
    } catch (error) {
        console.error('Error fetching menu items:', error);
    }
});
app.get('/getAdminMenu', async function (req, res) {

    const category_id = req.query.category_id; // set values from request

    try {
        const menuResult = await menuModel.getMenudb(category_id, true); // sanitize

        if (menuResult.rowCount === 0)
            return res.status(404).json({ message: 'No menu items found for this category.' });
        res.json({ items: menuResult });
    } catch (error) {
        console.error('Error fetching menu items:', error);
    }
});
app.post('/deleteMenuItem', async function (req, res) {
    console.log("deleteMenuItem route hit!")
    const menu_item_id = req.body.menu_item_id; // set values from request

    try {
        await menuModel.deleteMenuItem(menu_item_id); // sanitize

        const menuResult = await menuModel.getMenudb(0);
        res.json({ success: true, updated_menu: menuResult.rows });
    } catch (error) {
        res.json({ success: false });
        console.error('Error deleting menu item:', error);
    }
});
app.post('/updateMenuItem', async function (req, res) {
    console.log("updateMenuItem route hit!")
    const { item_id, item_name, desc, price, category, display_img, fav_count } = req.body;

    try {
        await menuModel.editMenuItem(item_id, item_name, price, desc, category, fav_count, display_img);

        const response = await menuModel.getMenudb(0)
        res.json({ success: true, updated_menu: response.rows });
    } catch (error) {
        res.json({ success: false });
        console.error('Error updating user profile', error);
    }
});
app.post('/createMenuItem', async function (req, res) {
    console.log("Create menu item route hit!")
    const { item_name, price, desc, category, fav_count, display_img } = req.body;

    try {
        await menuModel.createMenuItem(item_name, price, desc, category, fav_count, display_img);

        const response = await menuModel.getMenudb(0)
        res.json({ success: true, updated_menu: response.rows });
    } catch (error) {
        console.error('Error creating menu item!', error);
        res.json({ success: false });
    }
});


/* FAVOURITES DB INTERACTIONS */
app.get('/getFav', async function (req, res) {
    // acknowledge request received on the console for debugging
    // set values from request
    const user_id = req.query.user_id; // Access query parameter
    try {
        const favResult = await favModel.getUserFav(user_id);

        res.json(favResult);

    } catch (error) {
        console.error('Error fetching cart items:', error);
    }
});

//make post
app.get('/addFav', async function (req, res) {
    // acknowledge request received on the console for debugging
    // set values from request
    const { user_id, menu_item } = req.query; // Access query parameter
    try {
        // adds to user_favourites table and incr menu item fav_count
        const addFavResult = await favModel.addUserFav(user_id, menu_item);

        console.log(addFavResult);
        res.json(addFavResult);
    } catch (error) {
        console.error('Error adding to user favs: ', error);
    }
});

//make post
app.get('/deleteFav', async function (req, res) {
    // acknowledge request received on the console for debugging
    // set values from request
    const { user_id, menu_item } = req.query; // Access query parameter
    console.log(user_id)
    console.log(menu_item)
    try {
        const deleteFavRes = await favModel.deleteUserFav(user_id, menu_item);

        console.log(deleteFavRes);
        res.json(deleteFavRes);
    } catch (error) {
        console.error('Error fetching cart items:', error);
    }
});

/* USER DB INTERACTIONS */
//make post
app.get('/getProfile', async function (req, res) {
    const user_id = req.query.user_id; // Access query parameter
    try {
        const response = await userModel.getUserProfile(user_id);
        res.json(response);

    } catch (error) {
        console.error('Error fetching users:', error);
    }
});

//make post
app.get('/users', async function (req, res) {

    try {
        const response = await userModel.getUsers();
        res.json(response);

    } catch (error) {
        console.error('Error fetching users:', error);
    }
});

app.post('/checkEmail', async function (req, res) {
    const email = req.body;
    try {
        const existingUser = await userModel.checkEmaildb(email);
        res.json({ exists: existingUser.rowCount > 0 });
    } catch (error) {
        console.error('Error checking email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/updateProfile', async function (req, res) {
    console.log("Update user route hit!")
    const { user_id, email, phone, username } = req.body;
    try {
        await userModel.editUserdb(user_id, username, email, phone);
        const response = await userModel.getUserProfile(user_id);
        console.log(response.rows)
        res.json({ success: true, updated_user: response.rows[0] });
    } catch (error) {
        console.error('Error updating user profile', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/updateUser', async function (req, res) {
    console.log("Update user route hit!")
    const { user_id, email, phone, username } = req.body;
    try {
        await userModel.editUserdb(user_id, username, email, phone);

        const response = await userModel.getUsers()
        res.json({ success: true, updated_users: response.rows });
    } catch (error) {
        console.error('Error updating user profile', error);
        res.json({ success: false });
    }
});

app.post('/deleteUser', async function (req, res) {
    const user_id = req.body.user_id;
    try {
        await userModel.deleteUserdb(user_id);
        const response = await userModel.getUsers();

        res.json({ success: true, users: response.rows });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/* AUTH SERVICES */
app.post('/signup', async function (req, res) {
    // acknowledge request received on the console for debugging
    // set values from request
    const { username, email, phone, pwd } = req.body;

    try {
        const result = await authService.signUp(username, email, phone, pwd); // will handle email check and password hashing
        if (result.success) {
            res.status(201).json({ message: result.message });
        } else {
            res.status(400).json({ error: result.message });
        }
    } catch (err) {
        console.error('Error in /signup route:', err);
        res.status(500).json({ error: 'Failed to create user account' });
    }
});

app.post('/login', async function (req, res) {
    // acknowledge request received on the console for debugging
    const { email, pwd } = req.body;

    try {
        const result = await authService.login(email, pwd); // will handle email check and password hashing
        console.log(result)
        if (result.success) {
            res.json({ success: true, message: result.message, user: result.user });
        } else {
            res.json({ success: false, error: result.message });
        }
    } catch (err) {
        console.error('Error in /login route:', err);
        res.json({ success: false, message: "Error with logging in user." });
    }
});

/* STRIPE SERVICES */
const stripe = Stripe(process.env.STRIPE_SECRET);

app.post('/create-payment-intent', async (req, res) => {
    console.log("create-payment-intent route hit!");
    const { amount, currency } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount, // Amount in cents
            currency,
        });
        // console.log(paymentIntent)
        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
});

const port = process.env.PORT || 3001; // Default to 3001 if no environment variable is set

const server = app.listen(port, async function () {
    console.log(`Server is running on port ${port}`);
});

const shutdown = async (signal) => {
    console.log(`Received ${signal}. Closing server...`);
    server.close(async (err) => {
        if (err) {
            console.error('Error closing server:', err);
            process.exit(1);
        }
        console.log('Server closed. Ending database pool...');
        try {
            await pool.end();
            console.log('Database pool has ended.');
            process.exit(0);
        } catch (dbErr) {
            console.error('Error ending database pool:', dbErr);
            process.exit(1);
        }
    });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
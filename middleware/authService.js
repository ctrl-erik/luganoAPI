import userModel from '../models/userModel.js'
import cartModel from '../models/cartModel.js'
import bcrypt from 'bcrypt'


const authService = {
    async verifyPassword(enteredPwd, storedHash) {
        console.log({ enteredPwd, storedHash })
        return await bcrypt.compare(enteredPwd, storedHash);
    },
    // i leveraged ChatGPT to assist with pwd hashing
    async signUp(username, email, phone, pwd) {
        console.log("signUp auth service hit!") 
        try {
            // Salt and hash the password
            const salt = await bcrypt.genSalt(10); // 10 is the salt rounds (can be adjusted)
            const hashedPwd = await bcrypt.hash(pwd, salt);

            const createUsrResp = await userModel.createUserdb(username, email, phone, hashedPwd);
            
            const user_id = createUsrResp.rows[0].user_id;
            await cartModel.createUserCartdb(user_id)
            return { success: true, message: "User created successfully." };
        } catch (error) {
            console.error("Error in authService.signUp:", error);
            return { success: false, message: "An error occurred during signup." };
        }
    },
    async login(email, pwd) {
        console.log("login auth service hit!") 
        try {
            const result = await userModel.checkUserdb(email);
            // query for cart id and store in state
            if (result.rows.length > 0) {
                // user found (matching email), return user data
                // then compare
                const user = result.rows[0];
                
                // Verify the entered password against the hashed password in the database
                const isPasswordValid = await this.verifyPassword(pwd, user.pwd); // pwd_hash here, and change the db col name too
                if (!isPasswordValid) {
                    return { success: false, message: "Invalid email or password." };
                }

                let authUser = null;
                if (user.type_id == 1){
                    const cartResult = await cartModel.getCartIddb(user.user_id);
                    const cartId = cartResult.rows[0].cart_id;
            
                    authUser = {
                        user_id: user.user_id,
                        type_id: user.type_id,
                        email: user.email,
                        phone: user.phone,
                        username: user.username,
                        cart_id: cartId // add cart id to the user object stored in session
                    }
                } else {
                    authUser = {
                        user_id: user.user_id,
                        type_id: user.type_id,
                        email: user.email,
                        phone: user.phone,
                        username: user.username,
                    }
                }
               
                return { success: true, message: "User logged in.", user: authUser };

            } else {
                // user not found, return unauthorized status
                return { success: false, message: "Invalid email or password." };
            }

        } catch (error) {
            console.error("Error in authService.login:", error);
            return { success: false, message: "An error occurred during login." };
        }
    }
};

export default authService;

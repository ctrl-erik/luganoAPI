// models/userModel.js
import pool from '../config/db.js';

const userModel = {
    async getUserProfile(userid) {
        const getUserProfileRes = await pool.query('SELECT * FROM users WHERE user_id = $1', [userid]);
        return getUserProfileRes;
    },
    async getUsers() {
        const getUserRes = await pool.query('SELECT * FROM users');
        return getUserRes;
    },
    async checkEmaildb(email) {
        const checkEmailRes = await pool.query('SELECT email FROM users WHERE email = $1', [email]);
        return checkEmailRes;
    },
    async userEmailsdb() {
        const emailQueryRes = await pool.query('SELECT email FROM users');
        return emailQueryRes;
    },
    async createUserdb(username, email, phone, pwd) {
        const createUserRes = await pool.query('INSERT INTO users(type_id, username, email, phone, pwd) ' +
                                             'VALUES($1, $2, $3, $4, $5) RETURNING user_id;', [1, username, email, phone, pwd]);
        return createUserRes;
    },
    async editUserdb(user_id, username, email, phone) {
        const editUserRes = await pool.query('UPDATE users ' +
                                           'SET username = $1, email = $2, phone = $3 ' +
                                           'WHERE user_id = $4', [username, email, phone, user_id]);
        return editUserRes;
    },
    async deleteUserdb(user_id) {
         const deleteUserRes = await pool.query('DELETE FROM users ' +
                                             'WHERE user_id = $1', [user_id]);
        return deleteUserRes;
    },
    async checkUserdb(email) {
        const createUserRes = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
        return createUserRes;
    }
};

export default userModel;
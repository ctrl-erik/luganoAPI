// models/menuModel.js
import db from '../config/db.js';

const menuModel = {
    async getMenudb(category_id) {
            if (category_id == 0){
                const allMenuRes = await db.query('SELECT * FROM menu_items');
                return allMenuRes;
            }
            const menuQueryRes = await db.query('SELECT * FROM menu_items WHERE category = $1', [category_id]);
            return menuQueryRes;
    },
    async deleteMenuItem(item_id) {
        const deleteQueryRes = await db.query('DELETE FROM menu_items WHERE menu_item_id = $1;', [item_id]);
        return deleteQueryRes;
    },
    async editMenuItem(item_id, name, price, desc, category_id, fav_count, display_img) {
        console.log({ item_id, name, price, desc, category_id, fav_count, display_img });
        const editQuery = `UPDATE menu_items
                            SET name = $2, price = $3, "desc" = $4, category = $5, fav_count = $6, display_img = $7
                            WHERE menu_item_id = $1
                            RETURNING *;`;
        const editQueryRes = await db.query(editQuery, [item_id, name, price, desc, category_id, fav_count, display_img]);
        return editQueryRes;
    },
    async createMenuItem(name, price, desc, category_id, fav_count, display_img) {
        const createQuery = `INSERT INTO menu_items (name, price, "desc", category, fav_count, display_img)
                            VALUES ($1, $2, $3, $4, $5, $6)`;
        const createQueryRes = await db.query(createQuery, [name, price, desc, category_id, fav_count, display_img]);
        return createQueryRes;
    }
    
}

export default menuModel;
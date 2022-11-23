const Orders = require('../db/models/orders')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Users = require('../db/models/users')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Books_stores_rel = require('../db/models/books_stores_rel')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Orders_books_rel = require('../db/models/orders_books_rel')(require("../db/models/index").sequelize, require('sequelize').DataTypes);

const { Op } = require('sequelize');

const get_all_orders = async (req, res) => {
    let buyer_id = req.user.id;
    return await Orders.findAll({
        where: {
            fk_buyer_id: buyer_id
        }
    })
        .then((orders) => {
            return res.json({
                success: true,
                orders: orders
            });
        })
        .catch((err) => {
            return res.json({
                success: false,
                message: err
            });
        });
}

const buy_book = async (req, res) => {
    let userId = req.user.id;
    let { bookId, storeId, quantity } = req.body;
    if (quantity <= 0) {
        return res.json({
            "success": false,
            "message": "quantity can not be 0 or less",
        });
    }
    await Books_stores_rel.findOne({
        where: {
            [Op.and]: [
                { fk_store_id: storeId },
                { fk_book_id: bookId }
            ]
        }
    })
        .then(
            async (books_stores_rel) => {
                if (books_stores_rel) {
                    if (books_stores_rel.quantity >= quantity) {
                        await Users.findOne({
                            where: {
                                id: userId,
                            },
                        })
                            .then(
                                async (user) => {
                                    if (user) {
                                        await Orders.create({
                                            fk_buyer_id: user.id,
                                            status: 1
                                        })
                                            .then(
                                                async (order) => {
                                                    await Orders_books_rel.create({
                                                        fk_book_id: bookId,
                                                        fk_store_id: storeId,
                                                        fk_order_id: order.id,
                                                        quantity: quantity,
                                                    })
                                                        .then(
                                                            async (orders_books_rel) => {
                                                                await books_stores_rel.decrement('quantity', { by: quantity })
                                                                    .then(
                                                                        (result) => {
                                                                            res.json({
                                                                                "success": true,
                                                                            })
                                                                        }
                                                                    );
                                                            }
                                                        )
                                                }
                                            );
                                    } else {
                                        res.json({
                                            "success": false,
                                            "message": "user does not exist"
                                        });
                                    }
                                }
                            )
                    } else {
                        res.json({
                            "success": false,
                            "message": "only " + books_stores_rel.quantity + " book is available"
                        });
                    }
                } else {
                    res.json({
                        "success": false,
                        "message": "book or store does not exist"
                    });
                }
            }
        )
        .catch((err) => {
            res.json({
                "success": false,
                "message": err.toString()
            });
        });
}

module.exports = {
    // create_order,
    get_all_orders,
    buy_book
};
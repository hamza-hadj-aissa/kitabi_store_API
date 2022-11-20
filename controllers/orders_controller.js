const Orders = require('../db/models/orders')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Users = require('../db/models/users')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Books_stores_rel = require('../db/models/books_stores_rel')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Orders_books_rel = require('../db/models/orders_books_rel')(require("../db/models/index").sequelize, require('sequelize').DataTypes);

const { Op } = require('sequelize');

// const Cart = (oldCart) => {
//     this.items = oldCart.items;
//     this.totalQuantity = oldCart.totalQuantity;
//     this.totlaPrice = oldCart.totlaPrice;

//     this.add = async (itemId, storeId) => {
//         Books_stores_rel.findOne({
//             where: {
//                 fk_book_id: itemId,
//                 fk_store_id: storeId,
//             }
//         })
//             .then((book) => {
//                 var storedItem = this.items[itemId];
//                 if (!storedItem) {
//                     storedItem = this.items[itemId] = {
//                         itemId: itemId,
//                         storeId: storeId,
//                         quantity: 0,
//                         price: 0,
//                     };
//                 }
//             })
//             .catch((err) => {
//                 throw err;
//             });
//         storedItem.quantity =
//             storedItem.price = 
//     }
// }

const get_all_orders = async (req, res) => {
    let buyer_id = req.params.id;
    return await Orders.findAll({
        where: {
            fk_buyer_id: buyer_id
        }
    })
        .catch((err) => {
            throw err;
        });
}

const buy_book = async (req, res) => {
    let { bookId, storeId, quantity, userId } = req.body;
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
                                            status: 'confirmed'
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
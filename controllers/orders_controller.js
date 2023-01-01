const Orders_books_rel = require('../db/models/orders_books_rel')(require("../db/models/index").sequelize, require('sequelize').DataTypes);

const Receipts = require('../db/models/receipts')(require("../db/models/index").sequelize, require('sequelize').DataTypes);

const Orders = require('../db/models/orders')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Books = require('../db/models/books')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Clients = require('../db/models/clients')(require("../db/models/index").sequelize, require('sequelize').DataTypes);

const get_all_orders = async (req, res) => {
    let buyer_id = await Clients.findOne({
        where: {
            fk_user_id: req.user?.id
        }
    }).then(client => client.id);
    return await Orders.findAll({
        where: {
            fk_buyer_id: buyer_id
        },
        order: [
            ['createdAt', 'DESC']
        ]
    })
        .then(
            async (orders) => {
                let booksInOneOrderList = [];
                let booksList = [];
                await Promise.all(orders.map(
                    async order => {
                        await Orders_books_rel.findAll({
                            where: {
                                fk_order_id: order.id
                            }
                        })
                            .then(
                                async (orders_books_rel_list) => {
                                    let totalAmount = 0;
                                    // let quantity = 0;
                                    await Promise.all(orders_books_rel_list.map(
                                        async orders_books_rel => {
                                            await Books.findByPk(orders_books_rel.fk_book_id)
                                                .then((book) => {
                                                    // quantity += orders_books_rel.quantity;
                                                    totalAmount += book.price * orders_books_rel.quantity;
                                                    booksList.push({
                                                        book: book,
                                                        quantity: orders_books_rel.quantity
                                                    });
                                                });
                                        }
                                    ));
                                    booksInOneOrderList.push({
                                        id: order.id,
                                        date: order.createdAt.toString().slice(0, 21),
                                        totalAmount,
                                        // quantity,
                                        status: order.status,
                                        books: booksList
                                    });
                                    quantity = 0;
                                    totalAmount = 0;
                                    booksList = [];
                                }
                            )
                    }
                ));
                return res.json({
                    success: true,
                    orders: booksInOneOrderList
                });
            }
        )
        .catch((err) => {
            return res.json({
                success: false,
                message: err
            });
        });
}

const get_all_orders_for_all_cients = async (req, res) => {
    return await Orders.findAll({
        order: [
            ['createdAt', 'DESC']
        ]
    })
        .then(
            async (orders) => {
                let booksInOneOrderList = [];
                let booksList = [];
                await Promise.all(orders.map(
                    async order => {
                        let address = await order.getClient()
                            .then((client) => client.address);
                        await Orders_books_rel.findAll({
                            where: {
                                fk_order_id: order.id
                            }
                        })
                            .then(
                                async (orders_books_rel_list) => {
                                    let totalAmount = 0;
                                    let quantity = 0;
                                    await Promise.all(orders_books_rel_list.map(
                                        async orders_books_rel => {
                                            await Books.findByPk(orders_books_rel.fk_book_id)
                                                .then((book) => {
                                                    quantity += orders_books_rel.quantity;
                                                    totalAmount += book.price * orders_books_rel.quantity;
                                                    booksList.push(book)
                                                });
                                        }
                                    ));
                                    booksInOneOrderList.push({
                                        id: order.id,
                                        date: order.createdAt.toString().slice(0, 21),
                                        totalAmount,
                                        status: order.status,
                                        quantity,
                                        address,
                                        books: booksList
                                    });
                                    quantity = 0;
                                    totalAmount = 0;
                                    booksList = [];
                                }
                            );
                        address = null;
                    }
                ));
                return res.json({
                    success: true,
                    orders: booksInOneOrderList
                });
            }
        )
        .catch((err) => {
            return res.json({
                success: false,
                message: err
            });
        });
}

const buy_book = async (req, res) => {
    let userId = req.user.id;
    let { books } = req.body;
    await Orders.make_an_order(userId, books)
        .then((receipt) => {
            res.json({
                success: true,
                receipt
            });
        })
        .catch(err => {
            res.status(401).json({
                success: false,
                message: err.message
            })
        });
}

const getOrderReceipt = async (req, res) => {
    await Receipts.create_receipt(req.body.id)
        .then((receipt) => {
            res.json({
                success: true,
                receipt: receipt
            })
        })
        .catch((err) => {
            res.json({
                success: false,
                message: err.message
            })
        })
}

const updateOrderStatus = async (req, res) => {
    await Orders.findByPk(req.params.id)
        .then(async (order) => {
            await order.set('status', parseInt(req.body.status)).save()
                .then((orderModidified) => {
                    return res.json({
                        success: true,
                    });
                })
        })
        .catch((err) => {
            res.json({
                success: false,
                message: err.message
            })
        })
}

module.exports = {
    get_all_orders_for_all_cients,
    get_all_orders,
    buy_book,
    getOrderReceipt,
    updateOrderStatus
};
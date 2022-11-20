const Users = require('../db/models/users')(require("../db/models/index").sequelize, require('sequelize').DataTypes);

const Books_stores_rel = require('../db/models/books_stores_rel')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Stores = require('../db/models/stores')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Books_controller = require('../controllers/books_controller');
const { Op } = require('sequelize');

const create_store = async (req, res) => {
    let { id } = req.params;
    await Users.findOne({
        where: {
            id: id
        }
    })
        .then(
            async (user) => {
                if (user) {
                    await user.create_store()
                        .then(
                            (store) => {
                                if (store) {
                                    res.json({
                                        "success": true,
                                    });
                                } else {
                                    res.json({
                                        "success": false,
                                        "message": "user is not authorized to have a store"
                                    });
                                }
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
        .catch((err) => {
            res.json({
                "success": false,
                "message": err.toString()
            });
        })
}

const addBookToStore = async (req, res) => {
    let { sellerId, storeId } = req.body;
    await Stores.findOne({
        where: {
            [Op.or]: [
                { fk_owner_id: sellerId },
                { id: storeId }
            ]
        }
    })
        .then(
            async (store) => {
                if (store) {
                    let { title, author, pages_number, category, rating } = req.body;
                    let newBook = {
                        title: title,
                        author: author,
                        pages_number: pages_number,
                        category: category,
                        rating: rating,
                    }
                    await Books_controller.findOrCreateBook(newBook)
                        .then(
                            async (newBook) => {
                                let book = newBook.dataValues;
                                let { price, quantity, discount } = req.body;
                                await store.add_book_to_store({
                                    fk_book_id: book.id,
                                    price: price,
                                    quantity: quantity,
                                    discount: discount,
                                })
                                    .then(
                                        (books_stores_rel) => {
                                            res.json({
                                                "success": true
                                            });
                                        }
                                    )
                                    .catch(
                                        (err) => res.json({
                                            "success": false,
                                            "message": err.message
                                        })
                                    )
                            }
                        )
                } else {
                    return res.status(400).json({
                        "success": false,
                        "message": "store does not exist"
                    });
                }
            }
        )
        .catch(
            (err) => res.json({
                "success": false,
                "message": err.message
            })
        );
}

const removeBookFromStore = async (req, res) => {
    let { sellerId, storeId } = req.body;
    await Stores.findOne({
        where: {
            [Op.or]: [
                { fk_owner_id: sellerId },
                { id: storeId }
            ]
        }
    })
        .then(
            async (store) => {
                await store.remove_book_from_store(req.body.bookId)
                    .then(
                        (result) => res.json({
                            "success": true
                        })
                    );
            }
        )
        .catch(
            (err) => {
                if (err.message.includes('book does not exist')) {
                    res.status(400).json({
                        "success": false,
                        "message": err.message,
                    })
                } else {
                    res.json({
                        "success": false,
                        "message": err.message,
                    })
                }
            }
        )
}

const updateBookInStore = async (req, res) => {
    let { sellerId } = req.body;
    await Stores.findOne({
        where: { fk_owner_id: sellerId }
    })
        .then(
            async (store) => {
                if (store) {
                    let { price, quantity, discount, bookId } = req.body;
                    Books_stores_rel.update(
                        {
                            price,
                            discount,
                            quantity
                        },
                        {
                            where: {
                                [Op.and]: [
                                    { fk_book_id: bookId },
                                    { fk_store_id: store.id }
                                ]
                            }
                        }
                    )
                        .then((result) => {
                            if (result[0] == 0) {
                                return res.status(400).json({
                                    "success": false,
                                    "message": "book does not exist"
                                });
                            } else {
                                return res.json({
                                    "success": true,
                                });
                            }
                        })
                        .catch(
                            (err) => {
                                return res.json({
                                    "success": false,
                                    "message": err.message
                                });
                            }
                        );
                } else {
                    return res.status(400).json({
                        "success": false,
                        "message": "store does not exist"
                    });
                }
            }
        )
}


// TOTDO: it is not working due to cascading problems
const deleteAllBooksInStore = async (req, res) => {
    let { sellerId } = req.body;
    await Stores.findOne({
        where: { fk_owner_id: sellerId }
    })
        .then(
            async (store) => {
                if (store) {
                    await Books_stores_rel.truncate({
                        cascade: true,
                        where: {
                            fk_store_id: store.id
                        },
                    })
                } else {
                    return res.status(400).json({
                        "success": false,
                        "message": "store does not exist"
                    });
                }
            }
        )
        .catch(
            (err) => {
                return res.json({
                    "success": false,
                    "message": err.message
                });
            }
        );
}

module.exports = {
    create_store,
    addBookToStore,
    removeBookFromStore,
    updateBookInStore,
    deleteAllBooksInStore
}
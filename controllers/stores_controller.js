const Users = require('../db/models/users')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const CRUD_book = require('./crud/crud_book');
const Books = require('../db/models/books')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Books_stores_rel = require('../db/models/books_stores_rel')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Stores = require('../db/models/stores')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const { Op } = require('sequelize');

const getAllBooksInStore = async (req, res) => {
    let { store_id } = req.body;
    await Books_stores_rel.findAll({
        where: {
            fk_store_id: store_id,
        },
        attributes: ['fk_book_id'],
    })
        .then(
            async (books_stores_rel) => {
                let booksList = [];
                await Promise.all(
                    books_stores_rel.map(
                        async bookInStore => {
                            await Books.findByPk(bookInStore.fk_book_id)
                                .then(
                                    (book) => {
                                        booksList.push(book.dataValues);
                                    }
                                )
                        }
                    )
                )
                    .then(
                        () => {
                            res.json({
                                success: true,
                                books: booksList
                            })
                        }
                    )
                    .catch((err) => {
                        res.json({
                            success: false,
                            books: err
                        })
                    })
            }
        )
}

const getOneBookInStore = async (req, res) => {
    let { store_id } = req.body;
    let { bookId } = req.params;
    await Books_stores_rel.findOne({
        where: {
            [Op.and]: [
                { fk_store_id: store_id },
                { fk_book_id: bookId },
            ]
        }
    })
        .then(
            async (book_stores_rel) => {
                if (book_stores_rel) {
                    await Books.findByPk(bookId)
                        .then(
                            (book) => {
                                if (book) {
                                    res.json({
                                        success: true,
                                        book: book
                                    });
                                } else {
                                    res.status(401).json({
                                        success: false,
                                        books: "book not found"
                                    });
                                }
                            }
                        )
                } else {
                    res.status(401).json({
                        success: false,
                        books: "book not found"
                    });
                }
            }
        )
        .catch((err) => {
            res.json({
                success: false,
                books: err
            })
        });
}

const create_store = async (req, res) => {
    let sellerId = req.user.id;
    let { store_name } = req.body;
    await Users.findOne({
        where: {
            id: sellerId
        }
    })
        .then(
            async (user) => {
                if (user) {
                    await user.create_store(store_name)
                        .then(
                            (store) => {
                                res.json({
                                    "success": true,
                                });
                            }
                        )
                        .catch(
                            err => {
                                res.status(401).json({
                                    "success": false,
                                    "message": err.message
                                });
                            }
                        );
                } else {
                    res.status(401).json({
                        "success": false,
                        "message": "user not found"
                    });
                }
            }
        )
        .catch((err) => {
            res.status(401).json({
                "success": false,
                "message": err.toString()
            });
        })
}

const addBookToStore = async (req, res) => {
    let store_owner_id = req.user.id;
    await Stores.findOne({
        where: {
            fk_owner_id: store_owner_id
        }
    })
        .then(
            async (store) => {
                if (store) {
                    let { title, author, pages_number, category, rating } = req.body;
                    let newBook = {
                        title,
                        author,
                        pages_number,
                        category,
                        rating,
                    }
                    await CRUD_book.findOrCreateBook(newBook)
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
                        "message": "store not found"
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
    let sellerId = req.user.id;
    await Stores.findOne({
        where: {
            fk_owner_id: sellerId
        },
    })
        .then(
            async (store) => {
                let { bookId } = req.params;
                await store.remove_book_from_store(bookId)
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
    let sellerId = req.user.id;
    await Stores.findOne({
        where: {
            fk_owner_id: sellerId
        }
    })
        .then(
            async (store) => {
                if (store) {
                    console.log(store)
                    let { bookId } = req.params;
                    let { price, quantity, discount } = req.body;
                    Books_stores_rel.update(
                        {
                            price,
                            discount,
                            quantity,
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
    let sellerId = req.user.id;
    await Stores.findOne({
        where: {
            fk_owner_id: sellerId
        }
    })
        .then(
            async (store) => {
                if (store) {
                    // Books_stores_rel.de
                    await Books_stores_rel.destroy({
                        cascade: true,
                        where: {
                            fk_store_id: store.id
                        },
                    })
                        .then(
                            result => {
                                if (result > 0) {
                                    res.json({
                                        success: true
                                    })
                                } else {
                                    res.json({
                                        success: false,
                                        message: "there is no books to delete"
                                    })
                                }
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
    deleteAllBooksInStore,
    getAllBooksInStore,
    getOneBookInStore
}
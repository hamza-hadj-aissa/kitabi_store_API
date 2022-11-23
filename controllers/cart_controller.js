const Books_stores_rel = require('../db/models/books_stores_rel')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Cart = require('../db/cart');


const getCart = (req, res) => {
    let cart = new Cart(req.session.cart);
    if (cart) {
        return res.json({
            success: true,
            cart: cart.books
        });
    } else {
        return res.json({
            success: false,
            message: "cart not found"
        });
    }
}

const addBookToCart = async (req, res) => {
    let { id, price, quantity, storeId } = req.body;
    let bookInfo = {
        id, price, quantity, storeId
    }

    let cart = new Cart(req.session.cart);
    if (bookInfo) {
        await Books_stores_rel.findOne({
            where: {
                fk_store_id: bookInfo.storeId,
                fk_book_id: bookInfo.id
            }
        })
            .then(
                (foundBook) => {
                    if (foundBook) {
                        cart.addBookToCart(bookInfo);
                        req.session.cart = cart.books
                        return res.json({
                            success: true,
                            cart: cart.books
                        });
                    } else {
                        return res.status(401).json({
                            success: false,
                            message: "book not found"
                        });
                    }
                }
            );
    } else {
        return res.status(401).json({
            "success": false,
        });
    }
}

const removeBookFromCart = async (req, res) => {
    let { id, price, quantity, storeId } = req.body;
    let bookInfo = {
        id, price, quantity, storeId
    }
    let cart = new Cart(req.session.cart);
    if (bookInfo) {
        await Books_stores_rel.findOne({
            where: {
                fk_store_id: bookInfo.storeId,
                fk_book_id: bookInfo.id
            }
        })
            .then(
                (foundBook) => {
                    if (foundBook) {
                        cart.removeBookFromCart(bookInfo);
                        req.session.cart = cart.books;
                        return res.json({
                            success: true,
                            cart: cart.books
                        });
                    } else {
                        return res.status(401).json({
                            success: false,
                            message: "book not found"
                        });
                    }

                }
            );
    } else {
        return res.status(401).json({
            "success": false,
        });
    }
}

module.exports = {
    getCart,
    addBookToCart,
    removeBookFromCart,
}
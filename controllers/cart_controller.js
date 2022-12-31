const Books = require('../db/models/books')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
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
    let { bookId } = req.params;
    bookId = parseInt(bookId);
    let cart = new Cart(req.session.cart);
    if (bookId) {
        bookId = parseInt(bookId);
        await Books.findByPk(bookId)
            .then(
                (foundBook) => {
                    if (foundBook) {
                        cart.addBookToCart(bookId);
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

const removeBookFromCart = async (req, res) => {
    let { bookId } = req.params;
    bookId = parseInt(bookId);
    let cart = new Cart(req.session.cart);
    if (bookId) {
        bookId = parseInt(bookId);
        await Books.findByPk(bookId)
            .then(
                (foundBook) => {
                    if (foundBook) {
                        cart.removeBookFromCart(bookId);
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
const { json } = require('express');
const Book = require('../db/models/books')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Joi = require('joi');
const CRUD_book = require('./crud/crud_book');


const book_schema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    description: Joi.string(),
    pages_number: Joi.number().sign('positive').required(),
    category: Joi.string(),
    rating: Joi.number().sign('positive'),
});

async function validateBookSchema(bookInfo) {
    return await book_schema.validateAsync(bookInfo)
        .then(
            (err) => {
                errors: err.details[0].message
            }
        );
}

const get_one_book = async (req, res) => {
    let bookId = req.params.id;
    await CRUD_book.findOneBook(bookId)
        .then(
            (book) => res.json({
                "success": true,
                "book": book,
            })
        )
        .catch(
            (err) => {
                (err) => res.json({
                    "success": false,
                    "message": err.message
                })
            }
        );
}

const get_all_books = async (req, res) => {
    await CRUD_book.findAllBooks()
        .then(
            (booksList) => {
                return res.json({
                    "success": true,
                    "books": booksList
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

const create_book = async (req, res) => {
    await CRUD_book.findOrCreateBook(req.body)
        .then((newBook) => {
            res.json({
                "success": true,
                "book": newBook
            });
        })
        .catch(
            (err) => {
                if (err.toString().includes('ValidationError')) {
                    res.status(400).json({
                        "success": false,
                        "message": err.message
                    })
                } else {
                    res.json({
                        "success": false,
                        "message": err.message
                    })
                }
            }
        );
}

const delete_book = async (req, res) => {
    let bookId = req.params.id;
    await CRUD_book.deleteBook(bookId)
        .then(
            (result) => res.json({
                "success": true,
            })
        )
        .catch(
            (err) => {
                if (err.message.toString().includes('book does not exist')) {
                    res.status(400).json({
                        "success": false,
                        "message": err.message
                    })
                } else {
                    res.json({
                        "success": false,
                        "message": err.message
                    })
                }
            }
        );
}

const update_book = async (req, res) => {
    let bookId = req.params.id;
    await CRUD_book.updateBook(bookId, req.body)
        .then(
            (result) => res.json({
                "success": true,
            })
        )
        .catch(
            (err) => {
                if (err.message.includes('ValidationError') || err.message.includes('book does not exist')) {
                    res.status(400).json({
                        "success": false,
                        "message": err.message
                    })
                } else {
                    res.json({
                        "success": false,
                        "message": err.message
                    })
                }
            }
        );
}

const delete_all_books = async (req, res) => {
    await CRUD_book.deleteAllBooks()
        .then(
            () => {
                res.json({
                    "success": true,
                })
            }
        )
        .catch(
            (err) => {
                res.json({
                    "success": false,
                    "message": err.message
                })
            }
        );
}

module.exports = {
    get_one_book,
    get_all_books,
    create_book,
    delete_book,
    delete_all_books,
    update_book,
}
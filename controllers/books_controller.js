const Books = require('../db/models/books')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Categories = require('../db/models/categories')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Joi = require('joi');
const { Op } = require('sequelize');

const book_schema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    description: Joi.string(),
    pages_number: Joi.number().sign('positive').required(),
    fk_category_id: Joi.number().required(),
    rating: Joi.number().sign('positive'),
    quantity: Joi.number().min(0).required(),
    price: Joi.number().min(0).required(),
    discount: Joi.number().min(0).max(100),
    image: Joi.string().required(),
});

async function validateBookSchema(bookInfo) {
    return await book_schema.validateAsync(bookInfo)
        .catch(
            (err) => {
                return {
                    errors: err.details[0].message
                }
            }
        );
}

const get_one_book = async (req, res) => {
    let bookId = req.params.id;
    await Books.findByPk(bookId, {
        where: {
            quantity: {
                [Op.gt]: 0
            }
        }
    })
        .then(
            async (book) => {
                if (book) {
                    await book.getCategory()
                        .then((category) => {
                            return res.json({
                                success: true,
                                book,
                                category,
                            });
                        })
                } else {
                    res.json({
                        success: false,
                        book: "book not found",
                    });
                }
            }
        )
        .catch(
            (err) => res.json({
                success: false,
                message: err.message
            })
        );
}

const get_all_books = async (req, res) => {
    await Books.findAll({
        // where: {
        //     quantity: {
        //         [Op.gt]: 0
        //     }
        // }
    })
        .then(
            (booksList) => {
                return res.json({
                    success: true,
                    books: booksList
                });
            }
        )
        .catch(
            (err) => res.json({
                success: false,
                message: err.message
            })
        )
}

const get_one_book_admin = async (req, res) => {
    let bookId = req.params.id;
    await Books.findByPk(bookId)
        .then(
            async (book) => {
                if (book) {
                    await book.getCategory()
                        .then((category) => {
                            return res.json({
                                success: true,
                                book,
                                category,
                            });
                        })
                } else {
                    res.json({
                        success: false,
                        book: "book not found",
                    });
                }
            }
        )
        .catch(
            (err) => res.json({
                success: false,
                message: err.message
            })
        );
}

const get_all_books_admin = async (req, res) => {
    await Books.findAll()
        .then(
            (booksList) => {
                return res.json({
                    success: true,
                    books: booksList
                });
            }
        )
        .catch(
            (err) => res.json({
                success: false,
                message: err.message
            })
        )
}

const get_books_by_category = async (req, res) => {
    let { value, category } = req.query;
    await Books.findAll({
        where: {
            [Op.or]: [
                { title: { [Op.like]: '%' + value + '%' }, },
                { author: { [Op.like]: '%' + value + '%' }, },
            ],
        },
        order: [
            ['title', 'DESC'],
            ['author', 'DESC']
        ],
    })
        .then(
            (booksList) => {
                return res.json({
                    success: true,
                    books: category ? booksList.filter(book => book.fk_category_id == category) : booksList
                });
            }
        )
        .catch(
            (err) => res.json({
                success: false,
                message: err.message
            })
        )
}

const create_book = async (req, res) => {
    const bookInfo = {
        title: req.body.title,
        author: req.body.author,
        fk_category_id: req.body.category,
        description: req.body.description,
        pages_number: req.body.pages_number,
        price: req.body.price,
        discount: req.body.discount,
        quantity: req.body.quantity,
        image: req?.file?.filename,
    }
    let { errors } = await validateBookSchema(bookInfo);
    if (errors) {
        res.json({
            success: false,
            message: errors,
        });
    } else {
        await Books.create_book(bookInfo)
            .then(
                (newBook) => {
                    res.json({
                        success: true,
                        book: newBook
                    });
                }
            )
            .catch(
                (err) => {
                    res.json({
                        success: false,
                        message: err.message
                    })
                }
            );
    }
}

const delete_book = async (req, res) => {
    let bookId = req.params.id;
    await Books.delete_book(bookId)
        .then(
            (result) => res.json({
                success: true,
            })
        )
        .catch(
            (err) => {
                res.json({
                    success: false,
                    message: err.message
                })
            }
        );
}

const update_book = async (req, res) => {
    // retreiving book's id from request's query parameters
    let bookId = req.params.id;
    // check if the book with the received data already exists before updating it
    await Books.findOne({
        where: {
            [Op.and]: {
                id: bookId,
                title: req.body.title,
                author: req.body.author,
                fk_category_id: req.body.category,
                description: req.body.description,
                pages_number: req.body.pages_number,
                price: req.body.price,
                discount: req.body.discount,
                quantity: req.body.quantity,
                // If the book's image has been changed from the user.
                // image attribute will have the new image's value
                // after treating it with multer(upload) middleware.
                // Else it will have the value that has been sent
                // along with the request body.
                image: req?.file?.filename ?? req.body?.image,
            }
        }
    })
        .then(
            async (book) => {
                if (book) {
                    req?.file?.filename ? await Books.deleteBookImage(req?.file?.filename) : null;
                    // book exits, no need to update it
                    return res.json({
                        success: true
                    });
                } else {
                    // book does not exist
                    const bookInfo = {
                        title: req.body.title,
                        author: req.body.author,
                        fk_category_id: req.body.category,
                        description: req.body.description,
                        pages_number: req.body.pages_number,
                        price: req.body.price,
                        discount: req.body.discount,
                        quantity: req.body.quantity,
                        image: req?.file?.filename ?? req.body?.image,
                    }

                    // validate book info before inserting it to the DB
                    let { errors } = await validateBookSchema(bookInfo);
                    if (errors) {
                        req?.file?.filename ? await Books.deleteBookImage(req?.file?.filename) : null;
                        // errors has been detected in book info
                        res.status(401).json({
                            success: false,
                            message: errors
                        });
                    } else {
                        // updating the book in the DB
                        await Books.update_book(bookId, bookInfo)
                            .then(
                                (updatedBook) => res.json({
                                    success: true,
                                    book: updatedBook
                                })
                            )
                    }
                }
            }
        )
        .catch(
            async (err) => {
                req?.file?.filename ? await Books.deleteBookImage(req?.file?.filename) : null;
                res.status(401).json({
                    success: false,
                    message: err.message
                })
            }
        );

}

const delete_all_books = async (req, res) => {
    await Books.delete_all_books()
        .then(
            () => {
                res.json({
                    success: true,
                })
            }
        )
        .catch(
            (err) => {
                res.json({
                    success: false,
                    message: err.message
                })
            }
        );
}

const get_all_categories = async (req, res) => {
    await Categories.findAll({
        attributes: {
            exclude: [
                'createdAt', 'updatedAt'
            ]
        }
    })
        .then((categories) => {
            if (categories) {
                res.json({
                    success: true,
                    categories: categories
                })
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Could not get categories'
                });
            }
        })
        .catch((err) => {
            res.json({
                success: false,
                message: err.message
            })
        })
}

module.exports = {
    get_one_book,
    get_all_books,
    get_all_books_admin,
    get_one_book_admin,
    create_book,
    delete_book,
    delete_all_books,
    update_book,
    get_books_by_category,
    get_all_categories,
}
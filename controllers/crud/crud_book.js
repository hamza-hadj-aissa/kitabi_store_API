const Book = require('../../db/models/books')(require("../../db/models/index").sequelize, require('sequelize').DataTypes);
const Joi = require('joi');

const book_schema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    description: Joi.string(),
    pages_number: Joi.number().sign('positive').required(),
    category: Joi.string(),
    rating: Joi.number().sign('positive'),
})

async function validateBookSchema(bookInfo) {
    return await book_schema.validateAsync(bookInfo)
        .then((result) => {
            return {
                value: result,
                errors: null
            }
        })
        .catch((err) => {
            return {
                value: null,
                errors: err.details[0].message
            }
        }
        );
}


const findOrCreateBook = async (newBookInfo) => {
    let { errors, value } = await validateBookSchema(newBookInfo);
    newBookInfo = value;
    if (errors) {
        throw new Error(errors);
    } else {
        return await Book.findOrCreate({
            where: newBookInfo
        })
            .then(
                ([instance, created]) => {
                    return instance;
                }
            )
            .catch(
                (err) => {
                    throw err;
                }
            );
    }
}

const findOneBook = async (bookId) => {
    return await Book.findOne({
        where: {
            id: bookId
        }
    })
        .then(
            (book) => {
                if (book) {
                    return book;
                } else {
                    throw new Error('book does not exist');
                }
            }
        )
        .catch(
            (err) => {
                throw err;
            }
        );
}

const findAllBooks = async () => {
    return await Book.findAll({
        where: {
            category,
        }
    })
        .then(
            (booksList) => booksList
        )
        .catch(
            (err) => {
                throw err;
            }
        );
}

const findAllBooksByCategory = async (category) => {
    return await Book.findAll({
        where: {
            category,
        }
    })
        .then(
            (booksList) => booksList
        )
        .catch(
            (err) => {
                throw err;
            }
        );
}

const deleteBook = async (bookId) => {
    await Book.destroy({
        where: {
            id: bookId,
        }
    })
        .then(
            (result) => {
                if (result == 0) {
                    throw new Error('book does not exist');
                }
                return;
            }
        ).catch(
            (err) => {
                throw err;
            }
        );
}

const deleteAllBooks = async () => {
    await Book.truncate()
        .catch(
            (err) => {
                throw err;
            }
        );
}

const updateBook = async (bookId, updatedBookInfo) => {
    let { error, value } = validateBookSchema(updatedBookInfo);
    if (error) {
        throw new Error(error.toString());
    } else {
        let updatedBookInfo = value;
        await Book.update(updatedBookInfo, {
            where: {
                id: bookId
            },
        })
            .then((result) => {
                if (result[0] == 0) {
                    throw new Error('book does not exist');
                }
            })
            .catch(
                (err) => {
                    throw err;
                }
            );
    }
}

module.exports = {
    findOrCreateBook,
    deleteBook,
    updateBook,
    findOneBook,
    findAllBooks,
    deleteAllBooks,
    findAllBooksByCategory
}
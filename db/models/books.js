'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Categories = require('./categories')(sequelize, DataTypes);

  class Books extends Model { }
  Books.init({
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT
    },
    pages_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    rating: {
      type: DataTypes.FLOAT,
      validate: {
        min: 0,
        max: 5,
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      },
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0
      },
    },
    discount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: {
        min: 0
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Books',
  });

  Books.create_book = async (newBookInfo) => {
    let { title, author, pages_number, fk_category_id, price, discount, quantity, image, rating, description } = newBookInfo;
    return await Books.findOrCreate({
      where: {
        title, author, pages_number, fk_category_id
      },
      defaults: {
        title, author, pages_number, fk_category_id, price, discount, quantity, image, rating, description
      },
    })
      .then(
        async ([book, created]) => {
          if (!created) {
            await book.set('price', price).save();
            await book.set('discount', discount).save();
            await book.increment('quantity', { by: quantity })
              .then((result) => result);
          }
          return book;
        }
      )
      .catch(
        (err) => {
          throw err;
        }
      );
  }

  const deleteAllBooks = async () => {
    await Books.destroy()
      .catch(
        (err) => {
          throw err;
        }
      );
  }

  Books.update_book = async (bookId, bookInfo) => {
    return await Books.findOne({
      where: {
        id: bookId
      },
    })
      .then(
        async (book) => {
          if (book) {
            await Books.deleteBookImage(book?.image);
            return await book.update(bookInfo)
              .then((updatedBook) => {
                return updatedBook;
              });
          } else {
            throw Error('book not found');
          }
        }
      )
      .catch(
        (err) => {
          throw err;
        }
      );
  }

  Books.delete_book = async (bookId) => {
    return await Books.findByPk(bookId)
      .then(
        async (book) => {
          if (book) {
            return await book.destroy()
              .then(
                async (result) => {
                  if (result === 0) {
                    throw new Error('book does not exist');
                  }
                  await Books.deleteBookImage(book.image);
                  return;
                }
              ).catch(
                (err) => {
                  throw err;
                }
              );
          } else {
            throw Error('Book does not exist');
          }
        }
      )

  }

  Books.buy_book = async (bookId, quantity) => {
    return await Books.findByPk(bookId)
      .then(
        async (book) => {
          if (book) {
            if (book.quantity === 0) {
              throw Error(`${book.title} is out of stock`);
            } else {
              if (book.quantity >= quantity) {
                return await book.decrement('quantity', { by: quantity })
                  .then(
                    async (result) => await Books.findByPk(bookId)
                  );
              } else {
                throw Error(`Only ${book.quantity} is left of ${book.title}`);
              }
            }
          } else {
            throw Error('book does not exist');
          }
        }
      )
      .catch((err) => {
        throw err;
      });
  }

  Books.deleteBookImage = async (fileName) => {
    const fs = require('fs');
    const path = require('path');
    fs.readdir(path.join(__dirname, '../../public/images'), (err, files) => {
      if (!err) {
        files.forEach(
          async (file) => {
            if (file.includes(fileName)) {
              fs.unlink(path.join(__dirname, `../../public/images/`, file), (err) => {
              });
            }
          });
      }
    })
  }

  Categories.hasMany(Books, {
    foreignKey: 'fk_category_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
  Books.belongsTo(Categories, {
    foreignKey: 'fk_category_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
  return Books;
}






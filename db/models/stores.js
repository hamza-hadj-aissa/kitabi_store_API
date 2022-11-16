'use strict';
const {
  Model
} = require('sequelize');
const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Books_stores_rel = require('./books_stores_rel')(sequelize, DataTypes);
  class Stores extends Model { }
  Stores.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    fk_owner_id: {
      allowNull: false,
      unique: true,
      type: DataTypes.INTEGER,
      foreignKey: true,
      onDelete: 'cascade',
      onUpdate: 'cascade',
      references: {
        model: 'Users',
        key: 'id',
      }
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Stores',
  });

  Stores.prototype.add_book_to_store = async function (book) {
    let storeId = this.id;
    let { fk_book_id, quantity, price, discount } = book;
    return await Books_stores_rel.findOrCreate({
      where: {
        [Op.and]: [
          { fk_store_id: storeId },
          { fk_book_id: fk_book_id }
        ]
      },
      defaults: {
        fk_book_id: fk_book_id,
        fk_store_id: storeId,
        quantity: quantity,
        price: price,
        discount: discount
      }
    })
      .then(
        async ([addedBook, created]) => {
          if (!created) {
            await addedBook.increment('quantity', { by: book.quantity });
            await addedBook.set('price', price).save();
          } else {
            await Books_stores_rel.create(book);
          }
        }
      )
      .catch((err) => {
        throw err;
      });
  }

  Stores.prototype.remove_book_from_store = async function (bookId) {
    let storeId = this.id;
    await Books_stores_rel.destroy({
      where: {
        [Op.and]: [
          { fk_store_id: storeId },
          { fk_book_id: bookId }
        ]
      }
    })
      .then(
        (numberOfDeletedRows) => {
          if (numberOfDeletedRows == 0) {
            throw new Error('book does not exist');
          }
        }
      )
      .catch(
        (err) => {
          throw err
        }
      );
  }

  Stores.prototype.update_book_in_store = async function (bookId, updatedInfo) {
    let storeId = this.id;
    await Books_stores_rel.update(updatedInfo, {
      where: {
        [Op.and]: [
          { fk_store_id: storeId },
          { fk_book_id: bookId }
        ]
      }
    })
      .then(
        (numberOfDeletedRows) => {
          if (numberOfDeletedRows[0] == 0) {
            throw new Error('book does not exist');
          }
        }
      )
      .catch(
        (err) => {
          throw err
        }
      );
  }

  return Stores;
};
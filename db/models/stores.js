'use strict';
const {
  Model
} = require('sequelize');
const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Users = require('./users')(sequelize, DataTypes);
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
      type: DataTypes.INTEGER,
      foreignKey: true,
      unique: true,
      // primaryKey: true,
      // onDelete: 'cascade',
      // onUpdate: 'cascade',
      // references: {
      //   model: 'Users',
      //   key: 'id',
      // }
    },
    store_name: {
      allowNull: false,
      type: DataTypes.STRING,
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Stores',
  });

  Users.hasOne(Stores, {
    foreignKey: 'fk_owner_id',
    onDelete: 'cascade',
    onUpdate: 'cascade',
  });

  Stores.belongsTo(Users, {
    foreignKey: 'fk_owner_id',
    onDelete: 'cascade',
    onUpdate: 'cascade',
  });



  Users.prototype.get_seller_store = async function () {
    if (this.user_type == 'seller') {
      return Stores.findOne({
        where: {
          fk_owner_id: this.id,
        }
      })
        .then((store) => store)
        .catch((err) => err);
    }
  }

  Stores.prototype.add_book_to_store = async function (book) {
    const Books_stores_rel = require('./books_stores_rel')(sequelize, DataTypes);
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
        fk_store_id: storeId,
        fk_book_id: fk_book_id,
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
            await Books_stores_rel.create({
              fk_store_id: storeId,
              fk_book_id: fk_book_id,
              quantity: quantity,
              price: price,
              discount: discount
            })
              .catch((err) => {
                console.log(err);
              })
          }
        }
      )
      .catch((err) => {
        throw err;
      });
  }



  Stores.prototype.remove_book_from_store = async function (bookId) {
    const Books_stores_rel = require('./books_stores_rel')(sequelize, DataTypes);

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
    const Books_stores_rel = require('./books_stores_rel')(sequelize, DataTypes);

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
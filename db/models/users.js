'use strict';
const {
  Model
} = require('sequelize');



module.exports = (sequelize, DataTypes) => {
  const Stores = require('./stores')(sequelize, DataTypes);
  const Orders = require('./orders')(sequelize, DataTypes);
  class Users extends Model {


  }
  Users.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      }
    },
    phone_number: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isNumeric: true,
      }
    },
    address: {
      allowNull: true,
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user_type: {
      type: DataTypes.ENUM('buyer', 'seller', 'admin'),
      allowNull: false,
      defaultValue: 'buyer',
    },
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Users',
  });

  Users.prototype.create_order = async function () {
    return await Orders.create({
      fk_buyer_id: this.id,
    })
      .then(() => console.log('order created'))
      .catch((err) => {
        throw err;
      })
  }

  Users.prototype.create_store = async function () {
    if (this.user_type == 'seller') {
      return await Stores.create({
        fk_owner_id: this.id
      })
        .then(
          (store) => store
        )
        .catch(
          (err) => {
            throw err;
          });
    }
  }

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
  return Users;
};
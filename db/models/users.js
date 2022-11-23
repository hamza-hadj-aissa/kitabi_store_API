'use strict';
const {
  Model
} = require('sequelize');



module.exports = (sequelize, DataTypes) => {
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
      // true for male
      // false for female
      type: DataTypes.INTEGER,
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
      // 0 for buyer
      // 1 for seller
      // 2 for admin
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      // comment: '0 for buyer / 1 for seller / 2 for admin'
    },
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Users',
  });

  Users.prototype.create_store = async function (store_name) {
    const Stores = require('./stores')(sequelize, DataTypes);
    if (this.user_type == 1) {
      return await Stores.findOrCreate({
        where: {
          fk_owner_id: this.id,
        },
        defaults: {
          fk_owner_id: this.id,
          store_name: store_name,
        }
      })
        .then(
          ([instance, created]) => {
            if (!created) {
              throw new Error('user already has a store');
            }
            return instance;
          }
        )
        .catch(
          (err) => {
            throw err;
          }
        );
    } else {
      throw new Error('user is not authorized to have a store');
    }
  }


  return Users;
};
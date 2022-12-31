'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

  class Categories extends Model { }
  Categories.init({
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true,
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Categories',
  });

  return Categories;
};
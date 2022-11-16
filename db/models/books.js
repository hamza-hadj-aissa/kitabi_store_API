'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {

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
    category: {
      allowNull: false,
      type: DataTypes.ENUM(
        'Adventure',
        'Classics',
        // 'Crime',
        // 'Fairy tales, fables, and folk tales',
        // 'Fantasy',
        // 'Historical fiction',
        // 'Horror',
        // 'Humour and satire',
        // 'Literary fiction',
        // 'Mystery',
        // 'Poetry',
        // 'Plays',
        // 'Romance',
        // 'Science fiction',
        // 'Short stories',
        // 'Thrillers',
        // 'War',
        // 'Women\'s fiction',
        // 'Young adult',
        // 'Autobiography and memoir',
        // 'Biography',
        // 'Essays',
        // 'Non fiction novel',
        // 'Self help',
      ),
    },
    rating: {
      type: DataTypes.FLOAT,
      validate: {
        min: 0,
        max: 5,
      }
    },
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Books',
  });



  return Books;
};
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('books', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      author: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT
      },
      pages_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      category: {
        allowNull: false,
        type: Sequelize.ENUM(
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
        type: Sequelize.FLOAT,
        validate: {
          min: 0,
          max: 5,
        }
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('books');
  }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('books_stores_rel', {
      fk_store_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        primaryKey: true,
        foreignKey: true,
        onDelete: 'cascade',
        onUpdate: 'cascade',
        references: {
          model: 'Stores',
          key: 'id',
        }
      },
      fk_book_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        primaryKey: true,
        foreignKey: true,
        onDelete: 'cascade',
        onUpdate: 'cascade',
        references: {
          model: 'Books',
          key: 'id',
        }
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        },
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 0
        },
      },
      discount: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
        validate: {
          min: 0
        },
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
    await queryInterface.dropTable('books_stores_rel');
  }
};

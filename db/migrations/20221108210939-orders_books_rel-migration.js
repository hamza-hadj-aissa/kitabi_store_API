'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders_books_rel', {
      fk_order_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        foreignKey: true,
        primaryKey: true,
        onDelete: 'cascade',
        onUpdate: 'cascade',
        references: {
          model: 'Orders',
          key: 'id',
        }
      },
      fk_store_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        foreignKey: true,
        primaryKey: true,
        onDelete: 'cascade',
        onUpdate: 'cascade',
        references: {
          model: 'Books_stores_rel',
          key: 'fk_store_id',
        }
      },
      fk_book_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        foreignKey: true,
        primaryKey: true,
        onDelete: 'cascade',
        onUpdate: 'cascade',
        references: {
          model: 'Books_stores_rel',
          key: 'fk_book_id',
        }
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
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
    await queryInterface.dropTable('orders_books_rel');
  }
};

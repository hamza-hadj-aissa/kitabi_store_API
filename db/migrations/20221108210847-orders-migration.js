'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fk_buyer_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        foreignKey: true,
        onDelete: 'cascade',
        onUpdate: 'cascade',
        references: {
          model: 'Users',
          key: 'id',
        }
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('not confirmed', 'confirmed', 'cancelled'),
        defaultValue: 'not confirmed',
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
    await queryInterface.dropTable('orders');
  }
};

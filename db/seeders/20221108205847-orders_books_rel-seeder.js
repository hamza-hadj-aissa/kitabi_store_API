'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('orders_books_rel', [
      {
        fk_order_id: 1,
        fk_store_id: 3,
        fk_book_id: 2,
      },
      {
        fk_order_id: 2,
        fk_store_id: 1,
        fk_book_id: 1,
      },
      {
        fk_order_id: 1,
        fk_store_id: 1,
        fk_book_id: 2,
      }
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('orders_books_rel', null, {});
  }
};

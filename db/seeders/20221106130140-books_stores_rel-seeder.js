'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('books_stores_rel', [
      {
        fk_store_id: 1,
        fk_book_id: 1,
        discount: 0,
        price: 1500,
        quantity: 5
      },
      {
        fk_store_id: 2,
        fk_book_id: 2,
        discount: 5,
        price: 250,
        quantity: 15
      }
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('books_stores_rel', null, {});
  }
};

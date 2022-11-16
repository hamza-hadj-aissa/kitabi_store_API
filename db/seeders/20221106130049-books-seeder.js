'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('books', [
      {
        title: 'Atomic habits',
        author: 'Hamza HADJ AISSA',
        pages_number: 200,
        rating: 4.5,
        category: 0
      },
      {
        title: 'The theory of all',
        author: 'Hamza',
        pages_number: 150,
        rating: 3.5,
        category: 0
      }
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('books', null, {});
  }
};

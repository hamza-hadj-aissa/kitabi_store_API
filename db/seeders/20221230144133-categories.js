'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Categories', [
      {
        id: 1,
        name: 'Action and adventure'
      },
      {
        id: 2,
        name: 'Alternate history'
      },
      {
        id: 3,
        name: 'Anthology'
      },
      {
        id: 4,
        name: 'Children\'s'
      },
      {
        id: 5,
        name: 'Classic'
      },
      {
        id: 6,
        name: 'Comics'
      },
      {
        id: 7,
        name: 'Crime'
      },
      {
        id: 8,
        name: 'Drama'
      },
      {
        id: 9,
        name: 'Fairytale'
      },
      {
        id: 10,
        name: 'Fantasy'
      },
      {
        id: 11,
        name: 'Graphic novel'
      },
      {
        id: 12,
        name: 'Historical fiction'
      },
      {
        id: 13,
        name: 'Mystery'
      },
      {
        id: 14,
        name: 'Suspense'
      },
      {
        id: 15,
        name: 'Self help'
      },
      {
        id: 16,
        name: 'True crime'
      },
      {
        id: 17,
        name: 'Travel'
      },
      {
        id: 18,
        name: 'Philosophy'
      },
      {
        id: 19,
        name: 'History'
      },
      {
        id: 20,
        name: 'Cookbook'
      },
      {
        id: 21,
        name: 'Biography'
      },
      {
        id: 22,
        name: 'Autobiography'
      },
      {
        id: 23,
        name: 'Business/economics'
      },
      {
        id: 24,
        name: 'Novel',
      },
      {
        id: 25,
        name: 'Psychology'
      }
    ], {
      ignoreDuplicates: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {});
  }
};

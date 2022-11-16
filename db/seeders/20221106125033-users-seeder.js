'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        firstName: 'Hamza',
        lastName: 'HADJ AISSA',
        email: 'hza788@gmail.com',
        phone_number: '0664632704',
        birth_date: '2002-07-30',
        gender: 'male',
        user_type: 3,
        password: 'hamza1243',
      },
      {
        firstName: 'Youcef',
        lastName: 'MECHKAK',
        email: 'example@gmail.com',
        phone_number: '0564632704',
        birth_date: '2002-02-25',
        gender: 'male',
        user_type: 2,
        password: 'youcef123',
      },
      {
        firstName: 'Mohammed',
        lastName: 'ABI',
        email: 'abi@gmail.com',
        phone_number: '0564632777',
        birth_date: '2001-11-17',
        gender: 'male',
        user_type: 1,
        password: 'mohammed',
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
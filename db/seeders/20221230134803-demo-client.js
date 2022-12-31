'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const bcrypt = require('bcryptjs');
    const hashPassword = (password) => {
      let salt = bcrypt.genSaltSync(10, (err, salt) => {
        if (err) {
          throw err;
        }
        return salt;
      });
      let hashedPassword = bcrypt.hashSync(password, salt, (err, hash) => {
        if (err) {
          throw err;
        }
        return hash;
      });
      return hashedPassword;
    }
    await queryInterface.bulkInsert('Users', [{
      id: 2,
      firstName: 'Client',
      lastName: 'One',
      email: 'client@email.com',
      password: hashPassword('client123')
    }], { ignoreDuplicates: true });

    await queryInterface.bulkInsert('Clients', [{
      fk_user_id: 2,
      phone_number: '1234567890',
      address: '2 Didouche Mourad, Algies',
      email_verified: 1,
    }], { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `DELETE from USERS where email='client@email.com' LIMIT 1`
    );
  }
};

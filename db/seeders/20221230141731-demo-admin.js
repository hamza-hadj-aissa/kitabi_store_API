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
      id: 1,
      firstName: 'Admin',
      lastName: 'One',
      email: 'admin@email.com',
      password: hashPassword('admin123')
    }], { ignoreDuplicates: true });
    await queryInterface.bulkInsert('Admins', [{
      fk_user_id: 1,
    }], { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `DELETE from USERS where email='admin@email.com' LIMIT 1`
    );
  }
};

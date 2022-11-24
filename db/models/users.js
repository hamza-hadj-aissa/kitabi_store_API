'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


function generateAccessToken(id, user_type, email_verified) {
  return jwt.sign({
    id,
    user_type,
    email_verified
  }, process.env.JWT_SECRET, {
    expiresIn: 86400 // 24 hours
  });
}

function hashPassword(password) {
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

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
  }
  Users.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    gender: {
      // true for male
      // false for female
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      }
    },
    phone_number: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isNumeric: true,
      }
    },
    address: {
      allowNull: true,
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user_type: {
      // 0 for buyer
      // 1 for seller
      // 2 for admin
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      // comment: '0 for buyer / 1 for seller / 2 for admin'
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Users',
  });

  // Create user
  Users.register_user = async function (userInfo) {
    let { firstName, lastName, birth_date, gender, address, email, phone_number, user_type, password } = userInfo;
    return await Users.findOne({
      where: {
        email
      },
    })
      .then(
        async (user) => {
          if (user) {
            throw Error('user already exists');
          } else {
            return await Users.create({
              firstName,
              lastName,
              birth_date,
              gender,
              address,
              email,
              phone_number,
              user_type,
              password: hashPassword(password)
            })
              .then(
                (user) => {
                  return;
                }
              )
              .catch(
                (err) => {
                  throw err;
                }
              );
          }
        }
      );
  }

  Users.login_user = async (userInfo) => {
    let { email, password } = userInfo;
    return await Users.findOne({
      where: {
        email
      }
    })
      .then(
        (user) => {
          if (!user) {
            throw Error('user not found');
          } else {
            if (!user.email_verified) {
              throw Error('email is not verified');
            } else {
              var passwordIsValid = bcrypt.compareSync(
                password,
                user.password
              );
              if (!passwordIsValid) {
                throw Error('incorrect password');
              } else {
                let token = generateAccessToken(user.id, user.user_type, user.email_verified);
                return token;
              }
            }
          }
        }
      );
  }

  Users.verify_user = async (emailVerificationToken) => {
    return jwt.verify(emailVerificationToken, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          throw Error('email confirmation link has expired');
        } else {
          throw err;
        }
      } else {
        return await Users.findOne({
          where: {
            email: decoded.email
          }
        })
          .then(
            async (user) => {
              if (user) {
                if (user.email_verified) {
                  throw Error('user is already verified');
                } else {
                  return await user.set('email_verified', true).save()
                    .then(
                      (user1) => {
                        if (user1) {
                          if (user1.email_verified) {
                            return true;
                          } else {
                            throw Error('could not verify user');
                          }
                        } else {
                          throw Error('user not found');
                        }
                      }
                    );
                }
              } else {
                throw Error('user not found');
              }
            }
          )
      }
    });
  }

  Users.change_password = async (id, oldPassword, newPassword) => {
    await Users.findByPk(id)
      .then(
        async (user) => {
          if (user) {
            let validOldPassword = bcrypt.compareSync(
              oldPassword,
              user.password,
            );
            let validNewPassword = bcrypt.compareSync(
              newPassword,
              user.password,
            );
            if (validOldPassword) {
              if (!validNewPassword) {
                await user.set('password', hashPassword(newPassword)).save()
                  .then((result) => {
                    if (result) {
                      return true;
                    } else {
                      throw Error('password has not changed');
                    }
                  });
              } else {
                throw Error('you can not reset the password with the previous one');
              }
            } else {
              throw Error('incorrect old password');
            }
          } else {
            throw Error('user not found');
          }
        }
      )
  }

  Users.prototype.create_store = async function (store_name) {
    const Stores = require('./stores')(sequelize, DataTypes);
    if (this.user_type == 1) {
      return await Stores.findOrCreate({
        where: {
          fk_owner_id: this.id,
        },
        defaults: {
          fk_owner_id: this.id,
          store_name: store_name,
        }
      })
        .then(
          ([instance, created]) => {
            if (!created) {
              throw new Error('user already has a store');
            }
            return instance;
          }
        )
        .catch(
          (err) => {
            throw err;
          }
        );
    } else {
      throw new Error('user is not authorized to have a store');
    }
  }
  return Users;
};
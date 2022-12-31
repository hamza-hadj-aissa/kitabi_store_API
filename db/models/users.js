'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

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
    class Users extends Model { }
    Users.init({
        id: {
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
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true,
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        sequelize,
        freezeTableName: true,
        modelName: 'Users',
    });


    Users.change_password = async (id, oldPassword, newPassword) => {
        await Users.findByPk(id)
            .then(
                async (user) => {
                    if (user) {
                        let validOldPassword = bcrypt.compareSync(
                            oldPassword,
                            user.password,
                        );

                        // check if newPassword === oldPassword
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
                                throw Error('You can not change your password to the actual one');
                            }
                        } else {
                            throw Error('Incorrect old password');
                        }
                    } else {
                        throw Error('User not found');
                    }
                }
            )
    }
    return Users;
};
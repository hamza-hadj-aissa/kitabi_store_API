'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


function generateTokens(id, email_verified) {

    let payload = {
        id,
        role: 'client',
    }
    let accessToken = jwt.sign(payload, process.env.ACCESS_JWT_SECRET, {
        expiresIn: "15m" // 15 minutes
    });

    let refreshToken = jwt.sign(payload, process.env.REFRESH_JWT_SECRET, {
        expiresIn: "3d" // 3 days
    });

    return {
        accessToken,
        refreshToken
    };
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
    const Users = require('./users')(sequelize, DataTypes);
    const RefreshTokens = require('./refreshTokens')(sequelize, DataTypes);

    class Clients extends Model {
    }
    Clients.init({
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        fk_user_id: {
            allowNull: false,
            foreignKey: true,
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'id',
            }
        },
        // birth_date: {
        //     type: DataTypes.DATEONLY,
        //     allowNull: false,
        // },
        // gender: {
        //     // true for male
        //     // false for female
        //     type: DataTypes.INTEGER,
        //     allowNull: false,
        // },
        phone_number: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isNumeric: true,
            }
        },
        address: {
            allowNull: false,
            type: DataTypes.STRING
        },
        email_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        sequelize,
        freezeTableName: true,
        modelName: 'Clients',
    });

    // Create user
    Clients.register_user = async function (userInfo) {
        let { firstName, lastName, address, email, phone_number, password } = userInfo;
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
                            email,
                            password: hashPassword(password),
                        })
                            .then(
                                (user) => {
                                    user.createClient({
                                        // birth_date,
                                        // gender,
                                        address,
                                        phone_number,
                                    })
                                }
                            )
                    }
                }
            )
            .catch(
                (err) => {
                    throw err;
                }
            );;
    }

    Clients.login_user = async (userInfo) => {
        let { email, password } = userInfo;
        return await Users.findOne({
            where: {
                email
            }
        })
            .then(
                async (user) => {
                    if (!user) {
                        throw Error('user not found');
                    } else {
                        return await Clients.findOne({
                            where: {
                                fk_user_id: user.id,
                            }
                        })
                            .then(
                                async (client) => {
                                    if (!client) {
                                        throw Error('user not found');
                                    } else {
                                        if (!client.email_verified) {
                                            throw Error('email is not verified');
                                        } else {
                                            var passwordIsValid = bcrypt.compareSync(
                                                password,
                                                user.password
                                            );
                                            if (!passwordIsValid) {
                                                throw Error('incorrect password');
                                            } else {
                                                let { refreshToken, accessToken } = generateTokens(user?.id, client?.email_verified);
                                                await RefreshTokens.destroy({
                                                    where: {
                                                        fk_user_id: user.id
                                                    }
                                                })
                                                    .then(
                                                        async (destroyedRefreshToken) => {
                                                            await RefreshTokens.create({
                                                                fk_user_id: user.id,
                                                                refreshToken
                                                            })
                                                                .then((createdRefreshToken) => {
                                                                    if (createdRefreshToken) {
                                                                        return;
                                                                    } else {
                                                                        throw Error('could not log in');
                                                                    }
                                                                })
                                                        }
                                                    )
                                                    .catch((err) => {
                                                        throw err;
                                                    });
                                                return { id: user.id, accessToken, refreshToken };
                                            }
                                        }
                                    }
                                }
                            )
                    }
                }
            );
    }

    Clients.verify_user = async (emailVerificationToken) => {
        return jwt.verify(emailVerificationToken, process.env.EMAIL_JWT_SECRET, async (err, decoded) => {
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
                                return await Clients.findOne({
                                    where: {
                                        fk_user_id: user.id
                                    }
                                })
                                    .then(
                                        async (client) => {
                                            if (client) {
                                                if (client.email_verified) {
                                                    throw Error('email is already verified');
                                                } else {
                                                    return await client.set('email_verified', true).save()
                                                        .then(
                                                            (clientVerified1) => {
                                                                if (clientVerified1?.email_verified) {
                                                                    return true;
                                                                } else {
                                                                    throw Error('could not verify user');
                                                                }
                                                            }
                                                        );
                                                }
                                            } else {
                                                throw Error('user not found');
                                            }
                                        }
                                    )
                            } else {
                                throw Error('user not found');
                            }
                        }
                    )
            }
        });
    }

    Clients.delete_user = async (id) => {
        return await Clients.destroy({
            where: {
                id: id,
            },
        })
            .then(
                (numberOfDeletedRows) => {
                    if (numberOfDeletedRows > 0) {
                        return true
                    } else {
                        throw Error('user does not exist')
                    }
                }
            )
            .catch(
                (err) => {
                    throw err;
                }
            );
    }

    Clients.change_client_info = async (userId, phone_number, address) => {
        await Clients.findOne({
            where: {
                fk_user_id: userId
            }
        })
            .then(
                async (client) => {
                    if (client) {
                        await client.set('phone_number', phone_number).save();
                        await client.set('address', address).save();
                        return;
                    } else {
                        throw Error('User was not found')
                    }
                }
            )
            .catch((err) => {
                throw err;
            });
    }

    Users.hasOne(Clients, {
        foreignKey: 'fk_user_id',
        onDelete: 'cascade',
        onUpdate: 'cascade',
    });
    Clients.belongsTo(Users, {
        foreignKey: 'fk_user_id',
        onDelete: 'cascade',
        onUpdate: 'cascade',
    });


    return Clients;
};
'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateTokens = (id) => {

    let payload = {
        id,
        role: 'admin'
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

    class Admins extends Model { }
    Admins.init({
        id: {
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
        }
    }, {
        sequelize,
        freezeTableName: true,
        modelName: 'Admins',
    });

    Admins.register_admin = async function (userInfo) {
        let { firstName, lastName, email, password } = userInfo;
        return await Users.findOne({
            where: {
                email
            },
        })
            .then(
                async (user) => {
                    if (user) {
                        throw Error('admin already exists');
                    } else {
                        return await Users.create({
                            firstName,
                            lastName,
                            email,
                            password: hashPassword(password)
                        })
                            .then(
                                async (user) => {
                                    await user.createAdmin().then((admin) => admin);
                                }
                            )
                    }
                }
            )
            .catch(
                (err) => {
                    throw err;
                }
            );
    }

    Admins.login_admin = async (userInfo) => {
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
                        const bcrypt = require('bcryptjs');
                        var passwordIsValid = bcrypt.compareSync(
                            password,
                            user.password
                        );
                        if (!passwordIsValid) {
                            throw Error('incorrect password');
                        } else {
                            let { refreshToken, accessToken } = generateTokens(user.id);
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
            );
    }

    Users.hasOne(Admins, {
        foreignKey: 'fk_user_id',
        onDelete: 'cascade',
        onUpdate: 'cascade',
    });
    Admins.belongsTo(Users, {
        foreignKey: 'fk_user_id',
        onDelete: 'cascade',
        onUpdate: 'cascade',
    });


    return Admins;
};
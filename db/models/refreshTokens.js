'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Users = require('./users')(sequelize, DataTypes);

    class RefreshTokens extends Model { }
    RefreshTokens.init({
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        refreshToken: {
            allowNull: false,
            type: DataTypes.STRING,
        }
    }, {
        sequelize,
        freezeTableName: true,
        modelName: 'RefreshTokens',
    });

    RefreshTokens.belongsTo(Users, {
        foreignKey: 'fk_user_id',
        onDelete: 'cascade',
        onUpdate: 'cascade',
    });

    Users.hasOne(RefreshTokens, {
        foreignKey: 'fk_user_id',
        onDelete: 'cascade',
        onUpdate: 'cascade',
    })
    return RefreshTokens;
};
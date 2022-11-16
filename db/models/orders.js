'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Users = require('./users')(sequelize, DataTypes);
    class Orders extends Model { }
    Orders.init({
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        // fk_buyer_id: {
        //     allowNull: false,
        //     type: DataTypes.INTEGER,
        //     foreignKey: true,
        // onDelete: 'cascade',
        // onUpdate: 'cascade',
        // references: {
        //     model: 'Users',
        //     key: 'id',
        // }
        // },
        status: {
            allowNull: false,
            type: DataTypes.ENUM('not confirmed', 'confirmed', 'cancelled'),
            defaultValue: 'not confirmed',
        },
    }, {
        sequelize,
        freezeTableName: true,
        modelName: 'Orders',
    });


    Orders.belongsTo(Users, {
        foreignKey: 'fk_buyer_id',
        constraints: true,
        onDelete: 'cascade',
        onUpdate: 'cascade'
    });
    Users.hasMany(Orders, {
        foreignKey: 'fk_buyer_id',
        constraints: true,
        onDelete: 'cascade',
        onUpdate: 'cascade'
    });
    return Orders;
};
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
            type: DataTypes.INTEGER,
            values: [0, 1, 2, 3],
            // 0 for confirmed
            // 1 for in delivery
            // 2 for delivered
            // 3 for cancelled
            // defaultValue: 'not confirmed',
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
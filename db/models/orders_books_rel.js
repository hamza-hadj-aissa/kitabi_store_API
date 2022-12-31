'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Orders = require('./orders')(sequelize, DataTypes);
    const Books = require('./books')(sequelize, DataTypes);
    class Orders_books_rel extends Model { }
    Orders_books_rel.init({
        // fk_order_id: {
        //     allowNull: false,
        //     type: DataTypes.INTEGER,
        //     foreignKey: true,
        //     primaryKey: true,
        //     onDelete: 'cascade',
        //     onUpdate: 'cascade',
        //     references: {
        //         model: 'Orders',
        //         key: 'id',
        //     }
        // },
        // fk_store_id: {
        //     allowNull: false,
        //     type: DataTypes.INTEGER,
        //     foreignKey: true,
        //     primaryKey: true,
        //     onDelete: 'cascade',
        //     onUpdate: 'cascade',
        //     references: {
        //         model: 'Books_stores_rel',
        //         key: 'fk_store_id',
        //     }
        // },
        // fk_book_id: {
        //     allowNull: false,
        //     type: DataTypes.INTEGER,
        //     foreignKey: true,
        //     primaryKey: true,
        //     onDelete: 'cascade',
        //     onUpdate: 'cascade',
        //     references: {
        //         model: 'Books_stores_rel',
        //         key: 'fk_book_id',
        //     }
        // },
        cost: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                min: 0
            },
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 0
            },
        },
    }, {
        sequelize,
        freezeTableName: true,
        modelName: 'Orders_books_rel',
    });

    Orders.belongsToMany(Books, {
        through: Orders_books_rel,
        foreignKey: 'fk_order_id',
        onDelete: 'cascade',
        onUpdate: 'cascade',
    });

    Books.belongsToMany(Orders, {
        through: Orders_books_rel,
        foreignKey: 'fk_book_id',
        onDelete: 'cascade',
        onUpdate: 'cascade',
    });
    return Orders_books_rel;
};
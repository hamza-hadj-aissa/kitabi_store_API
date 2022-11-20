'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Stores = require('./stores')(sequelize, DataTypes);
    const Books = require('./books')(sequelize, DataTypes);

    class Books_stores_rel extends Model { }
    Books_stores_rel.init({
        id: {
            allowNull: false,
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fk_store_id: {
            allowNull: false,
            type: DataTypes.INTEGER,
            // primaryKey: true,
            // foreignKey: true,
            // onDelete: 'cascade',
            // onUpdate: 'cascade',
            // references: {
            //     model: 'Stores',
            //     key: 'id',
            // }
        },
        fk_book_id: {
            allowNull: false,
            type: DataTypes.INTEGER,
            // primaryKey: true,
            // foreignKey: true,
            //     // onDelete: 'cascade',
            //     // onUpdate: 'cascade',
            //     // references: {
            //     //     model: 'Books',
            //     //     key: 'id',
            //     // }
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0
            },
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                min: 0
            },
        },
        discount: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            validate: {
                min: 0
            },
        },
    }, {
        sequelize,
        freezeTableName: true,
        modelName: 'Books_stores_rel',
    });

    Stores.belongsToMany(Books, {
        through: Books_stores_rel,
        foreignKey: 'fk_store_id',
        onDelete: 'cascade',
        onUpdate: 'cascade',
    });
    Books.belongsToMany(Stores, {
        through: Books_stores_rel,
        foreignKey: 'fk_book_id',
        onDelete: 'cascade',
        onUpdate: 'cascade',
    });
    return Books_stores_rel;
};
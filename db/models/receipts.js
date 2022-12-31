'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    const Orders = require('./orders')(sequelize, DataTypes);

    class Receipts extends Model { }
    Receipts.init({
        id: {
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            type: DataTypes.INTEGER
        },
        totalAmount: {
            allowNull: false,
            type: DataTypes.FLOAT,
            validate: {
                min: 0,
            }
        },
        books: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    }, {
        sequelize,
        freezeTableName: true,
        modelName: 'Receipts',
    });

    Receipts.create_receipt = async (orderId) => {
        const Books = require('./books')(sequelize, DataTypes);
        const Orders_books_rel = require('./orders_books_rel')(sequelize, DataTypes);
        let booksList = [];
        let totalAmount = 0;
        return await Orders_books_rel.findAll({
            where: {
                fk_order_id: orderId
            }
        })
            .then(
                async (orders_books_relList) => {
                    if (orders_books_relList.length) {
                        await Promise.all(
                            orders_books_relList.map(
                                async order_books => {
                                    await Books.findByPk(order_books.fk_book_id)
                                        .then(
                                            (book) => {
                                                if (book) {
                                                    booksList.push({
                                                        title: book.title,
                                                        quantity: order_books.quantity,
                                                        const: order_books.cost
                                                    });
                                                    totalAmount += order_books.cost;
                                                } else {
                                                    throw Error('book does not exist');
                                                }
                                            }
                                        )
                                }
                            )
                        )
                        return await Receipts.create({
                            books: JSON.stringify(booksList),
                            totalAmount
                        })
                            .then((receipt) => {
                                if (receipt) {
                                    return receipt
                                } else {
                                    throw Error('receipt was not created');
                                }
                            })
                            .catch((err) => {
                                throw err;
                            })
                    } else {
                        throw Error('order does not exist');
                    }
                }
            )
            .catch((err) => {
                throw err;
            })
    }

    Receipts.belongsTo(Orders, {
        foreignKey: 'fk_order_id',
        onDelete: 'cascade',
        onUpdate: 'cascade'
    });

    Orders.hasOne(Receipts, {
        foreignKey: 'fk_order_id',
        onDelete: 'cascade',
        onUpdate: 'cascade'
    });

    return Receipts;
}






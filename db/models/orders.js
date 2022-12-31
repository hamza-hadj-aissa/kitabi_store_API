'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Clients = require('./clients')(sequelize, DataTypes);
    const Books = require('./books')(sequelize, DataTypes);
    // Check books availabily in the inventory before making an order
    async function checkBooksAvailability(books) {
        await Promise.all(
            books.map(
                async book => {
                    if (book.quantity > 0) {
                        await Books.findByPk(book.id)
                            .then(
                                (foundBook) => {
                                    if (foundBook) {
                                        if (foundBook.quantity < book.quantity) {
                                            throw Error(`only ${foundBook.quantity} is left of ${foundBook.title}`);
                                        }
                                    } else {
                                        throw Error('book does not exist');
                                    }
                                }
                            )
                    } else {
                        throw Error('invalid quantity value');
                    }
                }
            )
        )
    }

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
        //     model: 'Clients',
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
            defaultValue: 0,
        },
    }, {
        sequelize,
        freezeTableName: true,
        modelName: 'Orders',
    });

    Orders.belongsTo(Clients, {
        foreignKey: 'fk_buyer_id',
        onDelete: 'cascade',
        onUpdate: 'cascade'
    });
    Clients.hasMany(Orders, {
        foreignKey: 'fk_buyer_id',
        onDelete: 'cascade',
        onUpdate: 'cascade'
    });

    Orders.make_an_order = async (userId, books) => {
        const Orders_books_rel = require('./orders_books_rel')(sequelize, DataTypes);
        const Receipts = require('./receipts')(sequelize, DataTypes);

        return await checkBooksAvailability(books)
            .then(
                async () => {
                    await Clients.findOne({
                        where: {
                            fk_user_id: userId
                        }
                    })
                        .then(async (client) => {
                            if (client) {
                                return await Orders.create({
                                    fk_buyer_id: client.id
                                })
                                    .then(
                                        async (newOrder) => {
                                            console.log('new one', newOrder)
                                            if (newOrder) {
                                                let orderResult;
                                                await Promise.all(
                                                    books.map(
                                                        async book => {
                                                            await Books.buy_book(book.id, book.quantity)
                                                                .then(
                                                                    async (boughtBook) => {
                                                                        if (boughtBook) {
                                                                            let bookPriceAfterDiscount = boughtBook.price - (boughtBook.price * (boughtBook.discount / 100));
                                                                            let cost = book.quantity * bookPriceAfterDiscount;
                                                                            orderResult = await Orders_books_rel.create({
                                                                                fk_order_id: newOrder.id,
                                                                                fk_book_id: book.id,
                                                                                quantity: book.quantity,
                                                                                cost: cost,
                                                                            })
                                                                                .then(
                                                                                    async (orders_books_rel) => {
                                                                                        return await Receipts.create_receipt(newOrder.id)
                                                                                            .then((receipt) => {
                                                                                                return receipt;
                                                                                            })
                                                                                    }
                                                                                )
                                                                                .catch(err => { throw err });
                                                                        } else {
                                                                            throw Error('book was not bought');
                                                                        }
                                                                    }
                                                                )
                                                                .catch(
                                                                    (err) => {
                                                                        throw err;
                                                                    }
                                                                );
                                                        }
                                                    )
                                                )
                                                return orderResult;
                                            } else {
                                                throw Error('order was not made');
                                            }
                                        }
                                    )
                                    .catch(err => {
                                        throw err;
                                    });
                            } else {
                                throw Error('User not found');
                            }
                        })
                }
            )
            .catch(err => { throw err });

    }
    return Orders;
};
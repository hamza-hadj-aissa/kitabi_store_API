const Books = require('../db/models/books')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Orders = require('../db/models/orders')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Clients = require('../db/models/clients')(require("../db/models/index").sequelize, require('sequelize').DataTypes);


const getCountOf_clients_books_orders = async (req, res) => {
    let clientscount, booksCount, ordersCount;
    await Clients.count({
        where: {
            email_verified: true,
        }
    })
        .then((count) => {
            if (count !== null) {
                clientscount = count;
            } else {
                throw Error('could not get clients count');
            }
        })
        .catch((err) => {
            return res.json({
                success: false,
                message: err.message,
            });
        });
    await Books.count()
        .then((count) => {
            if (count !== null) {
                booksCount = count;
            } else {
                throw Error('could not get books count');
            }
        })
        .catch((err) => {
            return res.json({
                success: false,
                message: err.message,
            })
        });
    await Orders.count()
        .then((count) => {
            if (count !== null) {
                ordersCount = count;
                return res.json({
                    success: true,
                    counts: {
                        clients: clientscount,
                        books: booksCount,
                        orders: ordersCount
                    }
                });
            } else {
                throw Error('could not get orders count');
            }
        })
        .catch((err) => {
            return res.json({
                success: false,
                message: err.message,
            })
        });

}

module.exports = {
    getCountOf_clients_books_orders
}
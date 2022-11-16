const Orders = require('../db/models/orders')(require("../db/models/index").sequelize, require('sequelize').DataTypes);

const create_order = async (res, buyer_id) => {
    await Orders.create({
        fk_buyer_id: buyer_id,
    })
        .then((newOrder) => {
            return res.json({
                "success": true,
            });
        })
        .catch((err) => {
            return res.json({
                "success": false,
                "message": err
            });
        })
}

module.exports = {
    create_order,
};
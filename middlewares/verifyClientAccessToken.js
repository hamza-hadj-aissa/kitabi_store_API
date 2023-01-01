const verifyClientAccessToken = async (req, res, next) => {
    const jwt = require('jsonwebtoken');
    require('dotenv').config({
        path: '../.env'
    });
    const Clients = require('../db/models/clients')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
    let authorized = false;
    // get the accessToken from the headers
    let accessToken = req.headers?.authorization;
    if (!accessToken) {
        return res.sendStatus(401);
    }
    accessToken = accessToken.split(' ')[1];
    // verify the accessToken
    let decodedToken = null;
    jwt.verify(accessToken, process.env.ACCESS_JWT_SECRET, (err, decoded) => {
        if (!err) {
            // valid token
            authorized = true;
            decodedToken = decoded;
        }
    });
    if (authorized) {
        await Clients.findOne({
            where: {
                fk_user_id: decodedToken?.id
            }
        })
            .then((client) => {
                if (client) {
                    if (client?.email_verified) {
                        let user = {
                            id: decodedToken?.id,
                            role: decodedToken?.role,
                            email_verified: client?.email_verified,
                        };
                        req.user = user;
                        next();
                    } else {
                        return res.status(403).json({
                            message: "email is not verified"
                        });
                    }
                } else {
                    // user does not exist
                    return res.sendStatus(403);
                }
            });
    } else {
        // invalid accessToken
        res.sendStatus(403);
    }
}

module.exports = verifyClientAccessToken;
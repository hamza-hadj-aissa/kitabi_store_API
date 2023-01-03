// verify and refresh client access token
const refreshClientAccessToken = async (req, res, next) => {
    const jwt = require('jsonwebtoken');
    require('dotenv').config({
        path: '../.env'
    });
    const Clients = require('../db/models/clients')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
    const RefreshTokens = require('../db/models/refreshTokens')(require("../db/models/index").sequelize, require('sequelize').DataTypes);

    let authorized = false;
    // get the accessToken from the headers
    let refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return res.sendStatus(403);
    }
    // verify the accessToken
    let decodedToken = null;
    jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET, (err, decoded) => {
        if (!err) {
            // valid token
            authorized = true;
            decodedToken = decoded;
        }
    });
    if (authorized) {
        await Clients.findOne({
            where: {
                fk_user_id: decodedToken?.id,
            },
        })
            .then(
                async (client) => {
                    if (client) {
                        await RefreshTokens.findOne({
                            where: {
                                fk_user_id: client?.fk_user_id
                            }
                        })
                            .then(
                                (refreshToken) => {
                                    if (refreshToken) {
                                        if (client?.email_verified) {
                                            let payload = {
                                                id: decodedToken?.id,
                                                role: decodedToken?.role,
                                            };
                                            req.user = payload;
                                            res.json({
                                                id: decodedToken?.id,
                                                role: decodedToken?.role,
                                                accessToken: jwt.sign(payload, process.env.ACCESS_JWT_SECRET, {
                                                    expiresIn: "15m" // 15 minutes
                                                })
                                            });
                                        } else {
                                            // email is not verified
                                            res.clearCookie('refreshToken');
                                            return res.status(403).json({
                                                message: "email is not verified"
                                            });
                                        }
                                    } else {
                                        // refreshToken deleted from DB
                                        res.clearCookie('refreshToken');
                                        return res.sendStatus(403);
                                    }
                                }
                            )
                    } else {
                        // user is not a client
                        res.sendStatus(403);
                    }
                }
            );
    } else {
        // invalid refreshToken
        res.clearCookie('refreshToken');
        res.sendStatus(401);
    }
}

module.exports = refreshClientAccessToken;
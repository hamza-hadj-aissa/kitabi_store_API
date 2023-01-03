// verify and refresh admin access token
const refreshAdminAccessToken = async (req, res, next) => {
    const jwt = require('jsonwebtoken');
    require('dotenv').config({
        path: '../.env'
    });
    const Admins = require('../db/models/admins')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
    const RefreshTokens = require('../db/models/refreshTokens')(require("../db/models/index").sequelize, require('sequelize').DataTypes);

    let authorized = false;
    // get the refreshToken from the cookies
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
        await Admins.findOne({
            where: {
                fk_user_id: decodedToken?.id
            },
        })
            .then(
                async (admin) => {
                    if (admin) {
                        await RefreshTokens.findOne({
                            where: {
                                fk_user_id: decodedToken?.id
                            }
                        })
                            .then(
                                async (refreshToken) => {
                                    if (refreshToken) {
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
                                            }),
                                        });
                                    } else {
                                        res.clearCookie('refreshToken');
                                        return res.sendStatus(403);
                                    }
                                }
                            )
                    } else {
                        // user is not an admin
                        return res.sendStatus(403);
                    }
                }
            );
    } else {
        // invalid token
        res.clearCookie('refreshToken');
        res.sendStatus(401);
    }
}

module.exports = refreshAdminAccessToken;
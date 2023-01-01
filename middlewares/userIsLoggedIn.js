// check if user already logged in
const userIsLoggedIn = async (req, res, next) => {
    const jwt = require('jsonwebtoken');
    require('dotenv').config({
        path: '../.env'
    });
    let refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
        const RefreshTokens = require('../db/models/refreshTokens')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
        let decodedToken;
        jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET, (err, decoded) => {
            if (err) {
                res.clearCookie('refreshToken');
                req.user = null;
            } else {
                decodedToken = decoded;
            }
        })
        await RefreshTokens.findOne({
            where: {
                fk_user_id: decodedToken?.id
            }
        })
            .then((refreshToken) => {
                if (refreshToken) {
                    next();
                } else {
                    res.clearCookie('refreshToken');
                    res.sendStatus(403);
                }
            })
            .catch(
                (err) => {
                    res.sendStatus(500);
                }
            )
    } else {
        return res.status(403).json({
            message: "user is not logged in"
        });
    }
}

module.exports = userIsLoggedIn;
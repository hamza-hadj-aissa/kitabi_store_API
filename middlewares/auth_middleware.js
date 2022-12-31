const jwt = require('jsonwebtoken');
require('dotenv').config({
    path: '../.env'
});

const verfiyClientAccessToken = async (req, res, next) => {
    const Clients = require('../db/models/clients')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
    let authorized = false;
    // get the accessToken from the headers
    let accessToken = req.headers?.authorization;
    if (!accessToken) {
        return res.sendStatus(401);
    }
    accessToken = accessToken.split(' ')[1];
    // verfiy the accessToken
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
                    return res.sendStatus(403);
                }
            });
    } else {
        res.sendStatus(403);
    }
    // valid accessToken
}

const verfiyAdminAccessToken = (req, res, next) => {
    // get the accessToken from the headers
    let accessToken = req.headers?.authorization;

    if (!accessToken) {
        console.log('access token not sent')
        return res.sendStatus(401);
    }
    console.log(accessToken)

    accessToken = accessToken.split(' ')[1];
    // verfiy the accessToken
    jwt.verify(accessToken, process.env.ACCESS_JWT_SECRET, (err, decoded) => {
        if (!err) {
            console.log(decoded)
            if (decoded.role === 'admin') {
                // valid accessToken
                let user = {
                    id: decoded.id,
                    role: decoded.role,
                };
                req.user = user;
                next();
            } else {
                return res.sendStatus(403);
            }
        } else {
            // invalid accessToken
            console.log('invalide token')
            return res.sendStatus(401);
        }
    })
}

// verify and refresh admin access token
const refreshAdminAccessToken = async (req, res, next) => {
    const Admins = require('../db/models/admins')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
    let authorized = false;
    // get the refreshToken from the cookies
    let refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return res.sendStatus(401);
    }
    // verfiy the accessToken
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
            }
        })
            .then((admin) => {
                if (admin) {
                    let user = {
                        id: decodedToken?.id,
                        role: decodedToken?.role,
                    };
                    req.user = user;
                    res.json({
                        id: decodedToken?.id,
                        role: decodedToken?.role,
                        accessToken: jwt.sign(user, process.env.ACCESS_JWT_SECRET, {
                            expiresIn: "15m" // 15 minutes
                        }),
                    });
                } else {
                    // user does not exist
                    return res.sendStatus(403);
                }
            });
    } else {
        // invalid token
        res.sendStatus(403);
    }
}

// verify and refresh client access token
const refreshClientAccessToken = async (req, res, next) => {
    const Clients = require('../db/models/clients')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
    let authorized = false;
    // get the accessToken from the headers
    let refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return res.sendStatus(401);
    }
    // verfiy the accessToken
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
                fk_user_id: decodedToken?.id
            }
        })
            .then((client) => {
                if (client) {
                    if (client?.email_verified) {
                        let user = {
                            id: decodedToken?.id,
                            role: decodedToken?.role,
                        };
                        req.user = user;
                        res.json({
                            id: decodedToken?.id,
                            role: decodedToken?.role,
                            accessToken: jwt.sign(user, process.env.ACCESS_JWT_SECRET, {
                                expiresIn: "15m" // 15 minutes
                            })
                        });
                    } else {
                        return res.status(403).json({
                            message: "email is not verified"
                        });
                    }
                } else {
                    return res.sendStatus(403);
                }
            });
    } else {
        res.sendStatus(403);
    }
    // valid accessToken
}

const userIsNotLoggedIn = (req, res, next) => {
    let refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET, (err, decoded) => {
            if (err) {
                res.clearCookie('refreshToken');
            }
        })
        next();
    } else {
        return res.status(401).json({
            success: false,
            message: "user is already logged in"
        });
    }
}

const userIsLoggedIn = (req, res, next) => {
    let refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
        jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET, (err, decoded) => {
            if (err) {
                res.clearCookie('refreshToken');
                req.user = null;
            }
        })
        next();
    } else {
        return res.status(401).json({
            message: "user is not logged in"
        });
    }
}

module.exports = {
    refreshAdminAccessToken,
    refreshClientAccessToken,
    verfiyAdminAccessToken,
    verfiyClientAccessToken,
    userIsLoggedIn,
    userIsNotLoggedIn,
};
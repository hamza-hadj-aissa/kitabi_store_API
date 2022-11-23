const jwt = require('jsonwebtoken');
require('dotenv').config({
    path: '../.env'
});
const Users = require('../db/models/users')(require("../db/models/index").sequelize, require('sequelize').DataTypes);

const verfiyToken = (req, res, next) => {
    // get the cookie from the req
    let token = req.cookies.token;

    if (!token) {
        return res.sendStatus(403);
    }
    // verfiy the cookie
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (!err) {
            let user = {
                id: decoded.id,
                user_type: decoded.user_type,
            };
            req.user = user;
            next();
        } else {
            res.clearCookie('token');
            return res.sendStatus(403);
        }
    })
}

const isAdmin = (req, res, next) => {
    let user_type = req.user.user_type;
    if (user_type == 2) {
        next();
    } else {
        return res.sendStatus(403);
    }
}

const isSeller = (req, res, next) => {
    let user_type = req.user.user_type;
    if (user_type == 1) {
        next();
    } else {
        return res.sendStatus(403);
    }
}

const isClient = (req, res, next) => {
    let user_type = req.user.user_type;
    if (user_type == 0) {
        next();
    } else {
        return res.sendStatus(403);
    }
}


const isAdminOrSeller = (req, res, next) => {
    let user_type = req.user.user_type;
    if (user_type >= 1) {
        next();
    } else {
        return res.sendStatus(403);
    }
}

const isLoggedIn = (req, res, next) => {
    let token = req.cookies.token;
    if (!token) {
        next();
    } else {
        return res.status(401).json({
            message: "user is already logged in"
        });
    }
}

const isNotLoggedIn = (req, res, next) => {
    let token = req.cookies.token;
    if (token) {
        req.user = null;
        next();
    } else {
        return res.status(401).json({
            message: "user is not logged in"
        });
    }
}

module.exports = {
    verfiyToken,
    isAdmin,
    isSeller,
    isAdminOrSeller,
    isClient,
    isLoggedIn,
    isNotLoggedIn
};
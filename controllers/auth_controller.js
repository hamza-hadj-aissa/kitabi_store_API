const Users = require('../db/models/users')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const user_schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    birth_date: Joi.date().required(),
    email: Joi.string().email().required(),
    phone_number: Joi.number().required(),
    address: Joi.string().required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string().min(8).required(),
    user_type: Joi.number().valid(0, 1, 2).required(),
    gender: Joi.number().valid(0, 1).required(),
},);

async function validateUserSchema(userInfo) {
    return await user_schema.validateAsync(userInfo)
        .catch(
            (err) => {
                return {
                    "errors": err.details[0].message
                }
            }
        );
}


function generateAccessToken(id, user_type) {
    return jwt.sign({
        id,
        user_type
    }, process.env.JWT_SECRET, {
        expiresIn: 86400 // 24 hours
    });
}

const register = async (req, res) => {
    let { errors } = await validateUserSchema(req.body);
    if (errors) {
        return res.json({
            "success": false,
            "message": errors,
        });
    } else {
        let { firstName, lastName, birth_date, gender, address, email, phone_number, user_type, password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.json({
                "success": false,
                "message": "passwords don\'t match"
            });
        }
        await Users.findOne({
            where: {
                email
            },
        })
            .then(
                (user) => {
                    if (user) {
                        return res.json({
                            "success": false,
                            "message": "email is already in use"
                        });
                    } else {
                        // hash password
                        bcrypt.genSalt(10,
                            async (err, salt) => {
                                if (!err) {
                                    bcrypt.hash(password, salt,
                                        async (err, hash) => {
                                            if (err) {
                                                console.log(err);
                                                return res.json({
                                                    "success": false,
                                                    "message": err
                                                });
                                            }
                                            // set password to hashed password
                                            await Users.create({
                                                firstName,
                                                lastName,
                                                birth_date,
                                                gender,
                                                address,
                                                email,
                                                phone_number,
                                                user_type,
                                                password: hash,
                                            })
                                                .then(
                                                    (user) => {
                                                        return res.json({
                                                            "success": true,
                                                        });
                                                    }
                                                )
                                                .catch(
                                                    (err) => {
                                                        console.log(err);
                                                        return res.json({
                                                            "success": false,
                                                            "message": err
                                                        });
                                                    }
                                                )
                                        }
                                    )
                                } else {
                                    console.log(err);
                                    return res.json({
                                        "success": false,
                                        "message": err
                                    });
                                }
                            }
                        );
                    }
                }
            );
    }
}

const login = async (req, res) => {
    let { email, password } = req.body;
    await Users.findOne({
        where: {
            email
        }
    })
        .then(
            (user) => {
                if (!user) {
                    res.status(404).json({
                        "message": "user not found"
                    });
                } else {
                    var passwordIsValid = bcrypt.compareSync(
                        password,
                        user.password
                    );
                    if (!passwordIsValid) {
                        res.clearCookie('token');
                        res.status(401).json({
                            "message": "incorrect password"
                        });
                    } else {
                        var token = generateAccessToken(user.id, user.user_type);
                        res.cookie('token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 });
                        res.json({
                            "success": true,
                        });
                    }
                }
            }
        );
}


const logout = (req, res, next) => {
    res.clearCookie('token');
    res.json({ "success": res.cookie.token == null });
}


module.exports = {
    register,
    login,
    logout,
}
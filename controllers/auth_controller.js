const Users = require('../db/models/users')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Joi = require('joi');
// const passport = require('passport');
const bcrypt = require('bcryptjs');


const user_schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    birth_date: Joi.date().required(),
    email: Joi.string().email().required(),
    phone_number: Joi.number().required(),
    address: Joi.string().required(),
    password: Joi.string().required(),
    passport2: Joi.string().required(),
    user_type: Joi.number().valid(0, 1, 2).required(),
    gender: Joi.number().valid(0, 1).required(),
});

function validateUserSchema(userInfo) {
    return user_schema.validate(userInfo);
}


const register = async (req, res) => {
    let { errors } = validateUserSchema(req.body);

    if (errors) {
        return res.json({
            "success": false,
            "message": errors.details[0].message,
        });
    } else {
        let { firstName, lastName, birth_date, gender, address, email, phone_number, user_type, password, password2 } = req.body;
        if (password !== password2) {
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
                            "message": "email is already in user"
                        });
                    } else {
                        // hash password
                        bcrypt.genSalt(10,
                            async (err, salt) =>
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
                                            password: hash
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
                        );
                    }
                }
            );
    }
}

const login = (req, res, next, passport) => {
    passport.authenticate('local',);
    // next();
}

const logout = (req, res) => {
    req.logout(false,
        (err) => {
            if (err) {
                console.log(err);
            }
        }
    );
    res.json({
        "success": req.isAuthenticated(),
    })
}

module.exports = {
    register,
    login,
    logout,
}
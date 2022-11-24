// imports
const Users = require('../db/models/users')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');

// consts
const verifyEmailBaseUrl = 'http://' + process.env.HOST + ':' + process.env.PORT + '/auth/confirm-email';
const password_schema = Joi.object({
    password: Joi.string().min(8).required(),
});
const user_schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    birth_date: Joi.date().required(),
    email: Joi.string().email().required(),
    phone_number: Joi.number().required(),
    address: Joi.string().required(),
    password: Joi.string().min(8).required(),
    user_type: Joi.number().valid(0, 1, 2).required(),
    gender: Joi.number().valid(0, 1).required(),
});

// functions
var readHTMLFile = function (path, callback) {
    fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};

const sendVerificationEmail = async (email) => {
    const emailVerificationToken = jwt.sign({
        email
    }, process.env.JWT_SECRET, {
        expiresIn: 3600, // 1 hour
    });

    let htmlFilePath = path.join(__dirname, '../views/email_verification_page.html');

    return readHTMLFile(htmlFilePath, async function (err, html) {
        if (err) {
            console.log('error reading file', err);
            return;
        }
        var template = handlebars.compile(html);
        var replacements = {
            link: verifyEmailBaseUrl + '?signature=' + emailVerificationToken
        };
        var htmlToSend = template(replacements);

        let mailTransporter = nodemailer.createTransport({
            service: "gmail",
            host: 'smtp.gmail.com',
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD_APP,
            },
        });

        return await mailTransporter.sendMail({
            from: {
                name: process.env.STORE_NAME,
                address: process.env.EMAIL_FROM
            },
            to: email,
            subject: "Email verification",
            priority: "high",
            html: htmlToSend,
        })
            .catch(
                (err) => {
                    console.log(err);
                    throw err;
                }
            );
    });
}


async function validateUserSchema(userInfo) {
    if (userInfo.password !== userInfo.confirmPassword) {
        return {
            errors: "passwords don\'t match"
        }
    }
    return await user_schema.validateAsync(userInfo)
        .catch(
            (err) => {
                return {
                    "errors": err.details[0].message
                }
            }
        );
}

async function validatePasswordSchema(newPassword, newConfirmPassword) {
    if (newPassword !== newConfirmPassword) {
        return {
            errors: "passwords don\'t match"
        }
    }
    return await password_schema.validateAsync({
        password: newPassword,
        confirmPassword: newConfirmPassword
    })
        .catch(
            (err) => {
                return {
                    errors: err.details[0].message
                }
            }
        );
}

const register = async (req, res) => {
    let { errors } = await validateUserSchema(req.body);
    if (errors) {
        return res.json({
            "success": false,
            "message": errors,
        });
    } else {
        let userInfo = req.body;
        await Users.register_user(userInfo)
            .then(
                async () => {
                    await sendVerificationEmail(userInfo.email);
                    res.json({
                        success: true,
                    });
                }
            )
            .catch(
                (err) => {
                    res.json({
                        success: false,
                        message: err.message,
                    });
                }
            );
    }
}

const login = async (req, res) => {
    let userInfo = req.body;
    await Users.login_user(userInfo)
        .then(
            token => {
                if (token) {
                    res.cookie('token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 });
                    res.json({
                        success: true,
                    });
                }
            }
        )
        .catch(
            err => res.json({
                success: false,
                message: err.message,
            })
        );
}

const verifyEmail = async (req, res, next) => {
    let { signature } = req.query;
    await Users.verify_user(signature)
        .then(
            (user_verified) => {
                if (user_verified) {
                    res.json({
                        success: user_verified,
                    });
                } else {
                    res.json({
                        success: user_verified,
                        message: "email was not verified"
                    });
                }
            }
        )
        .catch(
            err => {
                console.log(err);
                if (err.message === 'invalid signature') {
                    next();
                } else {
                    res.status(401).json({
                        success: false,
                        message: err.message
                    });
                }
            }
        )
}

const resendVerificationEmail = async (req, res) => {
    let { email } = req.body;
    await Users.findOne({
        where: {
            email
        }
    })
        .then(
            async (user) => {
                if (user) {
                    if (user.email_verified) {
                        res.status(401).json({
                            success: false,
                            message: "email is already verified"
                        })
                    } else {
                        await sendVerificationEmail(user.email)
                            .then(() => {
                                res.json({
                                    success: true
                                })
                            });
                    }
                } else {
                    res.status(401).json({
                        success: false,
                        message: "user does not exist"
                    })
                }
            }
        )
        .catch((err) => res.json({
            success: false,
            message: err
        }));
}

const changePassword = async (req, res) => {
    let { oldPassword, newPassword, newConfirmPassword } = req.body;
    let { id } = req.user;
    let { errors } = await validatePasswordSchema(newPassword, newConfirmPassword);
    if (errors) {
        res.json({
            success: false,
            message: errors
        });
    } else {
        await Users.change_password(id, oldPassword, newPassword)
            .then(
                (result) => {
                    res.json({
                        success: true
                    });
                }
            )
            .catch((err) => {
                res.json({
                    success: false,
                    message: err.message
                })
            });
    }
}

// const resetPassword = async (req, res) => {
//     sendVerificationEmail()
// }

const logout = (req, res, next) => {
    res.clearCookie('token');
    res.json({
        "success": res.cookie.token == null
    });
}


module.exports = {
    register,
    login,
    logout,
    verifyEmail,
    resendVerificationEmail,
    changePassword
}
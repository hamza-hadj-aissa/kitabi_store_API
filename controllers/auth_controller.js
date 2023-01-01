// imports
const Users = require('../db/models/users')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Clients = require('../db/models/clients')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Admins = require('../db/models/admins')(require("../db/models/index").sequelize, require('sequelize').DataTypes);

const Joi = require('joi');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config('../.env');
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');

// consts
const verifyEmailBaseUrl = 'http://localhost:3000/auth/email-verification/';
const password_schema = Joi.object({
    password: Joi.string().min(8).required(),
});

const admin_schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string().min(8).required(),
});

const user_schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    // birth_date: Joi.date().required(),
    email: Joi.string().email().required(),
    phone_number: Joi.number().required(),
    address: Joi.string().required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string().min(8).required(),
    // gender: Joi.number().valid(0, 1).required(),
});

const refresh_token_schema = Joi.object({
    refreshToken: Joi.string().required()
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
    }, process.env.EMAIL_JWT_SECRET, {
        expiresIn: 3600, // 1 hour
    });

    let htmlFilePath = path.join(__dirname, '../views/email_verification_page.html');

    return readHTMLFile(htmlFilePath, async function (err, html) {
        if (err) {
            return;
        }
        var template = handlebars.compile(html);
        var replacements = {
            link: `${verifyEmailBaseUrl}${emailVerificationToken}`
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
            .then((result) => {
                if (!result.accepted.includes(email)) {
                    throw Error('email was not sent successfully');
                }
            })
            .catch(
                (err) => {
                    throw err;
                }
            );
    });
}

async function validateAdminSchema(userInfo) {
    if (userInfo.password !== userInfo.confirmPassword) {
        return {
            errors: "passwords don\'t match"
        }
    }
    return await admin_schema.validateAsync(userInfo)
        .catch(
            (err) => {
                return {
                    "errors": err.details[0].message
                }
            }
        );
}

async function validateClientSchema(userInfo) {
    if (userInfo.password !== userInfo.confirmPassword) {
        return {
            errors: "passwords don\'t match"
        }
    }
    return await user_schema.validateAsync(userInfo)
        .catch(
            (err) => {
                return {
                    errors: err.details[0].message
                }
            }
        );
}

async function validateRefreshTokenSchema(tokenInfo) {
    return await refresh_token_schema.validateAsync(tokenInfo)
        .catch(
            (err) => {
                return {
                    errors: err.details[0].message
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
    })
        .catch(
            (err) => {
                return {
                    errors: err.details[0].message
                }
            }
        );
}

const register_client = async (req, res) => {
    let { errors } = await validateClientSchema(req.body);
    if (errors) {
        return res.json({
            "success": false,
            "message": errors,
        });
    } else {
        let userInfo = req.body;
        await Clients.register_user(userInfo)
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
                    res.status(401).json({
                        success: false,
                        message: err.message,
                    });
                }
            );
    }
}

const register_admin = async (req, res) => {
    let { errors } = await validateAdminSchema(req.body);
    if (errors) {
        return res.json({
            "success": false,
            "message": errors,
        });
    } else {
        let userInfo = req.body;
        await Admins.register_admin(userInfo)
            .then(
                async () => {
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

const login_client = async (req, res) => {
    let userInfo = req.body;
    await Clients.login_user(userInfo)
        .then(
            ({ id, accessToken, refreshToken }) => {
                if ({ id, accessToken, refreshToken }) {
                    res.cookie('refreshToken', refreshToken, {
                        httpOnly: true,
                        maxAge: 1000 * 60 * 60 * 24 * 3
                    });
                    // res.cookie('accessToken', accessToken, {
                    //     maxAge: 1000 * 60 * 15
                    // });
                    res.json({
                        success: true,
                        id,
                        role: 'client',
                        accessToken
                    });
                }
            }
        )
        .catch(
            err => res.status(401).json({
                success: false,
                message: err.message,
            })
        );
}

const login_admin = async (req, res) => {
    let userInfo = req.body;
    await Admins.login_admin(userInfo)
        .then(
            ({ id, accessToken, refreshToken }) => {
                if ({ id, accessToken, refreshToken }) {
                    res.cookie('refreshToken', refreshToken, {
                        httpOnly: true,
                        maxAge: 1000 * 60 * 60 * 24
                    });
                    // res.cookie('accessToken', accessToken, {
                    //     maxAge: 1000 * 60 * 15
                    // });
                    res.json({
                        success: true,
                        id,
                        role: 'admin',
                        accessToken
                    });
                }
            }
        )
        .catch(
            err => res.status(401).json({
                success: false,
                message: err.message,
            })
        );
}

const verifyEmail = async (req, res, next) => {
    let { signature } = req.query;
    await Clients.verify_user(signature)
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
                    await Clients.findOne({
                        where: {
                            fk_user_id: user.id
                        }
                    })
                        .then(
                            async (client) => {
                                if (client) {
                                    if (client.email_verified) {
                                        res.status(401).json({
                                            success: false,
                                            message: "Email is already verified"
                                        })
                                    } else {
                                        await sendVerificationEmail(user.email)
                                            .then(() => {
                                                res.json({
                                                    success: true
                                                })
                                            })
                                            .catch((err) => {
                                                throw err
                                            });
                                    }
                                } else {
                                    res.status(401).json({
                                        success: false,
                                        message: "User does not exist"
                                    })
                                }
                            }
                        );
                } else {
                    res.status(401).json({
                        success: false,
                        message: "User does not exist"
                    })
                }
            }
        )
        .catch(
            (err) => {
                return res.status(401).json({
                    success: false,
                    message: err
                });
            }
        );
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

const logout = (req, res, next) => {
    req.user = null;
    res.clearCookie('refreshToken');
    res.json({
        success: res.cookie?.refreshToken == null
    });
}

module.exports = {
    register_admin,
    register_client,
    login_admin,
    login_client,
    logout,
    verifyEmail,
    resendVerificationEmail,
    changePassword,
}
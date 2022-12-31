const Clients = require('../db/models/clients')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Users = require('../db/models/users')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Admins = require('../db/models/admins')(require("../db/models/index").sequelize, require('sequelize').DataTypes);


const Joi = require('joi')
const auth_controller = require('./auth_controller');

const user_schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    birth_date: Joi.date().required(),
    email: Joi.string().email().required(),
    phone_number: Joi.number().required(),
    address: Joi.string().required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string().min(8).required(),
    user_type: Joi.number().valid(0, 1).required(),
    gender: Joi.number().valid(0, 1).required(),
});

function validateUserSchema(userInfo) {
    return user_schema.validate(userInfo);
}



const create_user = async (req, res) => {
    await auth_controller.register(req, res);
}

const delete_user = async (req, res) => {
    await Clients.delete_user(req.params.id)
        .then((isDeleted) => {
            if (isDeleted) {
                res.json({
                    success: true
                });
            } else {
                res.json({
                    success: false,
                    message: 'user was not deleted'
                });
            }
        })
        .then(
            (err) => res.json({
                success: false,
                message: err.message
            })
        );
}

const get_user = async (req, res) => {
    let userId = req.user.id;
    await Clients.findOne({
        where: {
            fk_user_id: userId,
        },
        attributes: {
            exclude: [
                'password',
            ]
        }
    })
        .then(
            async (client) => {
                if (client) {
                    await client.getUser()
                        .then((user) => {
                            // user.phone_number = client.phone_number;
                            // user.address = client.address;
                            return res.json({
                                success: true,
                                user: {
                                    firstName: user.firstName,
                                    lastName: user.lastName,
                                    email: user.email,
                                    address: client.address,
                                    phone_number: client.phone_number
                                }
                            });
                        })
                } else {
                    return res.json({
                        success: false,
                        message: "user does not exist"
                    });
                }
            }
        )
        .catch(
            (err) => {
                return res.json({
                    success: false,
                    message: err
                });
            }
        )
}

const get_admin = async (req, res) => {
    let userId = req.user.id;
    await Users.findByPk(userId, {
        attributes: {
            exclude: [
                'password'
            ]
        }
    })
        .then(
            async (admin) => {
                if (admin) {
                    return res.json({
                        success: true,
                        admin
                    });
                } else {
                    return res.json({
                        success: false,
                        message: "User does not exist"
                    });
                }
            }
        )
        .catch(
            (err) => {
                return res.json({
                    success: false,
                    message: err
                });
            }
        )
}

const get_all_users = async (req, res) => {
    await Clients.findAll({
        where: {
            email_verified: 1,
        },
        // attributes: {
        //     include: [
        //         'fk_user_id',
        //     ]
        // }
    })
        .then(
            async (clients) => {
                if (clients) {
                    let clientsList = [];
                    await Promise.all(
                        clients.map(async (client) => {
                            await Users.findOne({
                                where: {
                                    id: client.fk_user_id
                                },
                                attributes: {
                                    exclude: [
                                        'password'
                                    ]
                                }
                            })
                                .then((user) => {
                                    clientsList.push({
                                        id: client.id,
                                        firstName: user.firstName,
                                        lastName: user.lastName,
                                        email: user.email,
                                        phone_number: client.phone_number
                                    });
                                });
                        })
                    );
                    return res.json({
                        success: true,
                        clients: clientsList,
                    })
                } else {
                    return res.json({
                        success: false,
                    });
                }
            }
        )
        .catch((err) => {
            return res.status(401).json({
                success: false,
                message: err
            });
        })
}

const change_client_info = async (req, res) => {
    const userId = req.user.id;
    const { phone_number, address } = req.body;
    await Clients.change_client_info(userId, phone_number, address)
        .then(() => {
            return res.json({
                success: true
            });
        })
        .catch(
            (err) => {
                return res.status(401).json({
                    success: false,
                    message: err
                });
            }
        );
}

module.exports = {
    create_user,
    get_user,
    get_admin,
    get_all_users,
    delete_user,
    change_client_info
}
const Users = require('../db/models/users')(require("../db/models/index").sequelize, require('sequelize').DataTypes);
const Joi = require('joi')
const Stores_controller = require('./stores_controller');
const Orders_controller = require('./orders_controller');

const user_schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    birth_date: Joi.date().required(),
    email: Joi.string().email().required(),
    phone_number: Joi.number().required(),
    address: Joi.string().required(),
    password: Joi.string().required(),
    user_type: Joi.string().valid('buyer', 'seller', 'admin').required(),
    gender: Joi.string().valid('male', 'female').required(),
});

function validateUserSchema(userInfo) {
    return user_schema.validate(userInfo);
}

async function deleteUser(res, id) {
    return await Users.destroy({
        where: {
            id: id,
        }
    })
        .then(
            (numberOfDeletedRows) => {
                if (numberOfDeletedRows > 0) {
                    return res.json({
                        "success": true,
                    });
                } else {
                    return res.json({
                        "success": false,
                        "message": "the user you want to delete does not exist"
                    });
                }

            }
        )
        .catch(
            (err) => {
                return res.json({
                    "success": false,
                    "message": err
                });
            }
        );
}

const create_user = async (req, res) => {
    let { error, value } = validateUserSchema(req.body);
    if (error) {
        return res.status(400).json(
            {
                "success": false,
                "message": error.details[0].message,
            },
        );
    } else {
        let newUserInfo = value;
        await Users.create(newUserInfo)
            .then(
                async (newUser) => {
                    await newUser.create_store();
                    return res.json({
                        "success": true,
                        "message": 'user created successfully',
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
            );
    }
}

const delete_user = async (req, res) => {
    let adminId = req.params.id;
    await Users.findByPk(adminId, {
        attributes: [
            'user_type'
        ]
    })
        .then(
            async (admin) => {
                if (admin) {
                    if (admin.user_type == 'admin') {
                        let deletedUserId = req.body.id;
                        return await deleteUser(res, deletedUserId);
                    } else {
                        return res.status(403).json({
                            "success": false,
                            "message": "unauthorized operation"
                        });
                    }
                } else {
                    return res.status(400).json({
                        "success": false,
                        "message": "user does not exist"
                    });
                }
            }
        )
        .catch((err) => {
            return res.json({
                "success": false,
                "message": err
            });
        });
}

const get_user = async (req, res) => {
    let userId = req.params.id;
    await Users.findByPk(userId, {
        attributes: {
            exclude: [
                'password',
            ]
        }
    })
        .then(
            (user) => {
                user = JSON.stringify(user);
                if (user) {
                    return res.json({
                        "success": true,
                        "user": user
                    });
                } else {
                    return res.json({
                        "success": false,
                        "message": "user does not exist"
                    });
                }
            }
        )
        .catch((err) => {
            return res.json({
                "success": false,
                "message": err
            });
        })
}

const get_all_users = async (req, res) => {
    await Users.findAll({
        attributes: {
            exclude: [
                'password',
            ]
        }
    })
        .then(
            (users) => {
                users = JSON.stringify(users);
                if (users) {
                    return res.json({
                        "success": true,
                        "users": users
                    });
                } else {
                    return res.json({
                        "success": false,
                    });
                }
            }
        )
        .catch((err) => {
            return res.json({
                "success": false,
                "message": err
            });
        })
}

const change_name = async (req, res) => {
    // await 
}

module.exports = {
    create_user,
    get_user,
    get_all_users,
    delete_user
}
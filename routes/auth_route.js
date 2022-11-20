const express = require('express');
const router = express.Router();
const user_controller = require('../controllers/users_controller');
const auth_controller = require('../controllers/auth_controller');
const passport = require('passport');
const { json } = require('sequelize');


router.get('/users', user_controller.get_all_users);

router.get('/users/:id', user_controller.get_user);

router.post('/users/create', user_controller.create_user);

router.delete('/users/delete/:id', user_controller.delete_user);

// router.put('/update/:id', user_controller.update_book);

router.post('/register', auth_controller.register);


router.post('/login', passport.authenticate('local'));



router.get('/logout', auth_controller.logout);


router.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        },
    });
});

router.use((req, res) => {
    res.status(404).send('404 Not found');
});

module.exports = router;
const express = require('express');
const router = express.Router();
const user_controller = require('../controllers/users_controller');
const auth_controller = require('../controllers/auth_controller');
const auth_middleware = require('../middlewares/auth_middleware');

// router.use(auth_middleware.verfiyToken);

router.get('/admin', auth_middleware.verfiyAdminAccessToken, user_controller.get_all_users);

router.get('/', auth_middleware.verfiyClientAccessToken, user_controller.get_user);

router.get('/admin/profile', auth_middleware.verfiyAdminAccessToken, user_controller.get_admin);

router.post('/create', auth_middleware.verfiyAdminAccessToken, user_controller.create_user);

router.delete('/delete/:id', auth_middleware.verfiyAdminAccessToken, user_controller.delete_user);

router.put('/update-info', auth_middleware.verfiyClientAccessToken, user_controller.change_client_info);


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
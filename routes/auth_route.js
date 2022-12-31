const express = require('express');
const router = express.Router();
const auth_controller = require('../controllers/auth_controller');
const auth_middleware = require('../middlewares/auth_middleware');

// These routes for admins
router.post('/admin/register', auth_middleware.userIsNotLoggedIn, auth_controller.register_admin);
router.post('/admin/login', auth_middleware.userIsNotLoggedIn, auth_controller.login_admin);


// This route is for clients

router.post('/register', auth_middleware.userIsNotLoggedIn, auth_controller.register_client);

router.post('/login', auth_middleware.userIsNotLoggedIn, auth_controller.login_client);

router.delete('/logout', auth_middleware.userIsLoggedIn, auth_controller.logout);

router.get('/confirm-email?', auth_controller.verifyEmail);

router.post('/resend-confirmation-email', auth_controller.resendVerificationEmail)

router.put('/change-password', auth_middleware.verfiyClientAccessToken, auth_controller.changePassword);

router.put('/admin/change-password', auth_middleware.verfiyAdminAccessToken, auth_controller.changePassword);

// refresh client token
router.get('/refreshToken', auth_middleware.refreshClientAccessToken)

// refresh admin token
router.get('/admin/refreshToken', auth_middleware.refreshAdminAccessToken)

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
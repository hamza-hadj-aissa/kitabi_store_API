const express = require('express');
const router = express.Router();
const auth_controller = require('../controllers/auth_controller');
const auth_middleware = require('../middlewares/auth_middleware');

// This route is for all type of users

router.post('/register', auth_middleware.isLoggedIn, auth_controller.register);

router.post('/login', auth_middleware.isLoggedIn, auth_controller.login);

router.get('/logout', auth_middleware.isNotLoggedIn, auth_controller.logout);

router.get('/confirm-email?', auth_controller.verifyEmail);

router.post('/resend-confirmation-email', auth_controller.resendVerificationEmail)

router.put('/change-password', auth_middleware.verfiyToken, auth_controller.changePassword);

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
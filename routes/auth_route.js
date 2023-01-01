const express = require('express');
const router = express.Router();
const auth_controller = require('../controllers/auth_controller');
const refreshClientAccessToken = require('../middlewares/refreshClientAccessToken');
const refreshAdminAccessToken = require('../middlewares/refreshAdminAccessToken');
const userIsLoggedIn = require('../middlewares/userIsLoggedIn');
const userIsNotLoggedIn = require('../middlewares/userIsNotLoggedIn');
const verifyAdminAccessToken = require('../middlewares/verifyAdminAccessToken');
const verifyClientAccessToken = require('../middlewares/verifyClientAccessToken');

// These routes for admins
router.post('/admin/register', userIsNotLoggedIn, auth_controller.register_admin);

router.post('/admin/login', userIsNotLoggedIn, auth_controller.login_admin);

router.put('/admin/change-password', verifyAdminAccessToken, auth_controller.changePassword);

router.get('/admin/refreshToken', refreshAdminAccessToken)


// This route is for clients
router.post('/register', userIsNotLoggedIn, auth_controller.register_client);

router.post('/login', userIsNotLoggedIn, auth_controller.login_client);

router.delete('/logout', userIsLoggedIn, auth_controller.logout);

router.get('/confirm-email?', auth_controller.verifyEmail);

router.post('/resend-confirmation-email', auth_controller.resendVerificationEmail)

router.put('/change-password', verifyClientAccessToken, auth_controller.changePassword);
// refresh client token
router.get('/refreshToken', refreshClientAccessToken);



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
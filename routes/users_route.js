const express = require('express');
const router = express.Router();
const user_controller = require('../controllers/users_controller');
const verifyAdminAccessToken = require('../middlewares/verifyAdminAccessToken');
const verifyClientAccessToken = require('../middlewares/verifyClientAccessToken');

// admin routes
router.get('/admin', verifyAdminAccessToken, user_controller.get_all_users);
router.get('/admin/profile', verifyAdminAccessToken, user_controller.get_admin);
router.post('/create', verifyAdminAccessToken, user_controller.create_user);
router.delete('/delete/:id', verifyAdminAccessToken, user_controller.delete_user);


// client route
router.get('/', verifyClientAccessToken, user_controller.get_user);
router.put('/update-info', verifyClientAccessToken, user_controller.change_client_info);


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
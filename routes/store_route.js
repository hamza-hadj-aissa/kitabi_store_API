const express = require('express');
const router = express.Router();
const stores_controllers = require('../controllers/stores_controller');
const auth_middleware = require('../middlewares/auth_middleware');

// This route is for sellers only


router.get('/counts', auth_middleware.verfiyAdminAccessToken, stores_controllers.getCountOf_clients_books_orders);


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
const express = require('express');
const router = express.Router();
const orders_controller = require('../controllers/orders_controller');
const auth_middleware = require('../middlewares/auth_middleware');

// get all orders of a specific user
router.get('/', auth_middleware.verfiyToken, orders_controller.get_all_orders);

router.post('/buy', auth_middleware.verfiyToken, orders_controller.buy_book);

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
const express = require('express');
const router = express.Router();
const orders_controller = require('../controllers/orders_controller');
const auth_middleware = require('../middlewares/auth_middleware');

// get all orders of a specific user
router.get('/', auth_middleware.verfiyClientAccessToken, orders_controller.get_all_orders);

router.get('/admin', auth_middleware.verfiyAdminAccessToken, orders_controller.get_all_orders_for_all_cients);

router.post('/buy', auth_middleware.verfiyClientAccessToken, orders_controller.buy_book);

router.post('/receipt', auth_middleware.verfiyClientAccessToken, orders_controller.getOrderReceipt);

router.put('/update/:id', auth_middleware.verfiyAdminAccessToken, orders_controller.updateOrderStatus);

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
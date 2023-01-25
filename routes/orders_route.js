const express = require('express');
const router = express.Router();
const orders_controller = require('../controllers/orders_controller');
const verifyAdminAccessToken = require('../middlewares/verifyAdminAccessToken');
const verifyClientAccessToken = require('../middlewares/verifyClientAccessToken')


// admin routes
router.get('/admin', verifyAdminAccessToken, orders_controller.get_all_orders_for_all_cients);
router.put('/update/:id', verifyAdminAccessToken, orders_controller.updateOrderStatus);

// client routes
router.get('/', verifyClientAccessToken, orders_controller.get_all_orders);
router.post('/buy', verifyClientAccessToken, orders_controller.buy_book);
router.post('/receipt', verifyClientAccessToken, orders_controller.getOrderReceipt);
router.put('/client/update/:id', verifyClientAccessToken, orders_controller.updateOrderStatus);


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
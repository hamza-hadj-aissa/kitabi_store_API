const express = require('express');
const router = express.Router();
const orders_controller = require('../controllers/orders_controller');

router.get('/', orders_controller.get_all_orders);

// router.get('/users/:id', user_controller.get_user);

// router.post('/create', orders_controller.create_order);

// router.delete('/users/delete/:id', user_controller.delete_user);

// router.put('/update/:id', user_controller.update_book);

router.post('/buy', orders_controller.buy_book);

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
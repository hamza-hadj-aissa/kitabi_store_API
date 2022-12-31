const express = require('express');
const router = express.Router();
const cart_controller = require('../controllers/cart_controller');

// This route is for all type of users


router.get('/', cart_controller.getCart);

router.get('/add-to-cart/:bookId', cart_controller.addBookToCart);

router.delete('/remove-from-cart/:bookId', cart_controller.removeBookFromCart);

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
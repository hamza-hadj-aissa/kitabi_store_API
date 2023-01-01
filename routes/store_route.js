const express = require('express');
const router = express.Router();
const stores_controllers = require('../controllers/stores_controller');
const verifyAdminAccessToken = require('../middlewares/verifyAdminAccessToken');

// count number of cutomers, books and orders // authorized for admins only
router.get('/counts',
    verifyAdminAccessToken,
    stores_controllers.getCountOf_clients_books_orders
);

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
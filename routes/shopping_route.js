const express = require('express');
const router = express.Router();
// const shopping_controllers = require('../controllers/stores_controller');

router.get('/cart', (req, res) => {
    let { cart } = req.session;
    if (cart) {
        return res.json(
            cart
        );
    } else {
        return res.json({
            "message": "you have no cart"
        });
    }
});

router.post('/add-to-cart', (req, res) => {
    let { book } = req.body;
    let { cart } = req.session;
    if (book) {
        if (cart) {
            req.session.cart.books.push(book);
        } else {
            req.session.cart = {
                books: [book],
            }
        }
        return res.json({
            "success": true,
        })
    }
    return res.json({
        "success": false,
    });
});

// router.delete('/deleteBook', stores_controllers.removeBookFromStore);

// router.delete('/deleteAll', stores_controllers.deleteAllBooksInStore);

// router.put('/updateBook', stores_controllers.updateBookInStore);

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
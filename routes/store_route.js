const express = require('express');
const router = express.Router();
const stores_controllers = require('../controllers/stores_controller');
const auth_middleware = require('../middlewares/auth_middleware');

// This route is for sellers only


router.get('/books', stores_controllers.getAllBooksInStore);

router.get('/books/:bookId', stores_controllers.getOneBookInStore);

router.post('/books/add', auth_middleware.verfiyToken, auth_middleware.isSeller, stores_controllers.addBookToStore);

router.post('/create', auth_middleware.verfiyToken, auth_middleware.isSeller, stores_controllers.create_store);

router.delete('/books/delete/:bookId', auth_middleware.verfiyToken, auth_middleware.isSeller, stores_controllers.removeBookFromStore);

router.delete('/books/delete', auth_middleware.verfiyToken, auth_middleware.isSeller, stores_controllers.deleteAllBooksInStore);

router.put('/books/update/:bookId', auth_middleware.verfiyToken, auth_middleware.isSeller, stores_controllers.updateBookInStore);

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
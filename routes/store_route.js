const express = require('express');
const router = express.Router();
const stores_controllers = require('../controllers/stores_controller');

// router.get('/', stores_controllers.get_all_books);

// router.get('/:id', stores_controllers.get_one_book);

router.post('/addBook', stores_controllers.addBookToStore);

router.delete('/deleteBook', stores_controllers.removeBookFromStore);

router.delete('/deleteAll', stores_controllers.deleteAllBooksInStore);

router.put('/updateBook', stores_controllers.updateBookInStore);

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
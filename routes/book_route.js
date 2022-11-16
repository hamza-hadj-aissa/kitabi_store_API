const express = require('express');
const router = express.Router();
const book_controllers = require('../controllers/books_controller');

router.get('/', book_controllers.get_all_books);

router.get('/:id', book_controllers.get_one_book);

router.post('/create', book_controllers.create_book);

router.delete('/delete/:id', book_controllers.delete_book);

router.delete('/deleteAll', book_controllers.delete_all_books);

router.put('/update/:id', book_controllers.update_book);

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
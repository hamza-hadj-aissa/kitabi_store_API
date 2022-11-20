const express = require('express');
const router = express.Router();
const book_controllers = require('../controllers/books_controller');

const isAuthenticated = (req, res, next) => {
    console.log(req.user)
    if (req.user) next();
    else res.status(401).send(401);
}

router.get('/', book_controllers.get_all_books);

router.get('/:id', book_controllers.get_one_book);

router.post('/create', isAuthenticated, book_controllers.create_book);

router.delete('/delete/:id', isAuthenticated, book_controllers.delete_book);

router.delete('/deleteAll', isAuthenticated, book_controllers.delete_all_books);

router.put('/update/:id', isAuthenticated, book_controllers.update_book);

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
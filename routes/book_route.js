const express = require('express');
const router = express.Router();
const book_controllers = require('../controllers/books_controller');
const authMiddleware = require('../middlewares/auth_middleware')
// This route is for all type of users
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + path.basename(file.originalname))
    },
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/images'));
    }
})
const upload = multer({
    limits: {
        files: 1
    },
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        return callback(null, true)
    },
    storage: storage,
});

router.get('/search/?', book_controllers.get_books_by_category);

router.get('/categories', book_controllers.get_all_categories);

// router.get('/categories/:id', book_controllers.get_one_categories);

// get all books // for clients
router.get('/', book_controllers.get_all_books);

// get all books // for admin
router.get('/admin', book_controllers.get_all_books_admin);


// get one book by id
router.get('/:id', book_controllers.get_one_book);

// create one book / authorized to admin only
router.post('/create',
    authMiddleware.verfiyAdminAccessToken,
    upload.single('image'),
    book_controllers.create_book
);

// delete one book by id / authorized to admin only
router.delete('/delete/:id', authMiddleware.verfiyAdminAccessToken, book_controllers.delete_book);

// update one book by id / authorized to admin obly
router.put('/update/:id',
    authMiddleware.verfiyAdminAccessToken,
    upload.single('image'),
    book_controllers.update_book
);

router.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        error: {
            message: error.message,
        },
    });
});

router.use((req, res) => {
    res.status(404).send('404 Not found');
});

module.exports = router;
const express = require('express');
const router = express.Router();
const book_controllers = require('../controllers/books_controller');
const verifyAdminAccessToken = require('../middlewares/verifyAdminAccessToken');
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

// get all books // for admin
router.get('/admin',
    verifyAdminAccessToken,
    book_controllers.get_all_books_admin
);

// create one book / authorized to admin only
router.post('/create',
    verifyAdminAccessToken,
    upload.single('image'),
    book_controllers.create_book
);

// delete one book by id / authorized to admin only
router.delete('/delete/:id',
    verifyAdminAccessToken,
    book_controllers.delete_book
);

// update one book by id / authorized to admin obly
router.put('/update/:id',
    verifyAdminAccessToken,
    upload.single('image'),
    book_controllers.update_book
);



// auth not requiered

router.get('/search/?', book_controllers.get_books_by_category);

router.get('/categories', book_controllers.get_all_categories);

// get all books
router.get('/', book_controllers.get_all_books);
// get one book by id
router.get('/:id', book_controllers.get_one_book);


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
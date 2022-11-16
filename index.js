const { response } = require('express');
const express = require('express');
const app = express();
// const db = require('./bin/db');
const morgan = require('morgan');

// db.initDB()
//     .then((result) => app.listen(8000));
app.listen(8000);
// routes
const book_route = require('./routes/book_route');
const auth_route = require('./routes/auth_route');
const store_route = require('./routes/store_route');

// Middleware static files
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

// index
app.get('/', (req, res) => {
    res.send('Hello world');
});

// authentification
app.use('/auth', auth_route);

// books
app.use('/books', book_route);


// books
app.use('/store', store_route);

// 404 error
app.use((req, res) => {
    res.status(404).send('404 Not found');
});
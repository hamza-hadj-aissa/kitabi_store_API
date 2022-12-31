const express = require('express');
const app = express();
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('dotenv').config();
const cors = require('cors');
var SequelizeStore = require("connect-session-sequelize")(session.Store);
const sequelize = require('./db/models/index').sequelize;
const sessionStore = new SequelizeStore({
    db: sequelize
});
sessionStore.sync();
// routes
const book_route = require('./routes/book_route');
const auth_route = require('./routes/auth_route');
const store_route = require('./routes/store_route');
const orders_route = require('./routes/orders_route');
const shopping_route = require('./routes/cart_route');
const users_route = require('./routes/users_route');

// for front-end
app.use(cors({
    credentials: true, origin: 'http://localhost:3000',
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.set('etag', false);
// Middleware static files
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(
    session({
        key: 'sessionCart',
        secret: 'thisismysecrctekeyfhrgfgrfrty84fwir767',
        saveUninitialized: true,
        resave: false,
        store: sessionStore,
        cookie: {
            maxAge: 2147483647,
            encode: "utf-8",
        },
    })
);

app.use(cookieParser());
// app.use(passport.initialize());
// app.use(passport.session());
app.listen(process.env.PORT);

// index
app.get('/', (req, res) => {
    res.send('Hello world');
});

// authentification
app.use('/auth', auth_route);

// users
app.use('/users', users_route);

// // books
app.use('/store', store_route);

// books
app.use('/books', book_route);

//orders
app.use('/orders', orders_route);

// // shopping
app.use('/cart', shopping_route);


// 404 error
app.use((req, res) => {
    res.status(404).send('404 Not found');
});
# books_store API

This is an ecommerce website API.

There's 3 types of users + Guest user. Client (buyer) / Seller / Admin.

Guest user could view all books and stores, he could also manage his cart. Without having an account necessarily.

A client could buy books (for now..).

A seller could create one store and name it. He could manage his store by:

-   Adding and supplying books with their specific prices, discount and quantity.
-   Removing and updating books.

An admin has the privilege to manage accounts.

Privileges go like this:
Admin > Seller > Client > Guest

# Project setup

make sure you install dependencies

```bash
npm install
```

Copy the .env file sample and edit it depending on your environment

```bash
cp .env.sample .env
```

-   server is running on port 8000.
-   make sure to start mysql and appache servers.
-   Create a Database and name it 'auth_db'.

# Usage

```bash
npm start
```

And here we go, API is running

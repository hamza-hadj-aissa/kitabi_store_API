# books_store API

This is an ecommerce website API.

There's 3 types of users. Guest / Client / Admin.

Guest user could view all books and stores, he could also manage his cart. Without having an account necessarily.

A client could buy books, view his account and edit it, track his orders status.

A seller could:

-   Add and supply books with their specific prices, discount and quantity.
-   Removing and updating books.

# Project setup

* Firstly, on your terminal, make sure you are on the root project directory and run these following commands:
make sure you install the dependencies
```bash
npm install
```
Copy the .env file sample and add the envirement variables on your host
```bash
cp .env.sample .env
```
-   server is running on port 8000.
-   make sure to start mysql and appache servers.
Database creation and migration
1. Navigate to db/ directory
```bash
cd db/
```
2. Create the database named 'kitabi_store_db' with the following command:
```bash
sequelize db:create
```
3. Create the database tables with this command:
```bash
node models/index.js
```

4. Run this command to migrate data into the database:

```bash
sequelize db:seed:all
```
5. Finally, navigate back to the root project directory and start the server by this command:
```bash
cd .. && npm start
```
And here we go, API is running

## 🔗 Contact
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/hadjaissahamza/)

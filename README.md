# Kitabi Store API

This the backend API for [Kitabi Store website](https://github.com/hamza-hadj-aissa/kitabi_store_interface). It's a website that manages an online books store.

## Features
There's 3 types of users. Guest / Client / Admin.

* Guest user could view all books and stores, he could also manage his cart. Without having an account necessarily.

* A client could buy books, view his account and edit it, track his orders status.

* A seller could:

  -   Add and supply books with their specific prices, discount and quantity.
  -   Remove and update books.


## Installation
Clone this project to your host by running:
```bash
https://github.com/hamza-hadj-aissa/kitabi_store_API.git
```

### Environment Variables
Copy the .env file sample and add the envirement variables on your host
```bash
cp .env.sample .env
```
To run this project, you will need to add the following environment variables to your .env file

* In order to run email verification, you must provide your email and your password (You don't have to put your own personal password. Instead, you should use another password that you can get by following these instructions [Get my app password](https://stackoverflow.com/a/45479968/19293939))
  *  `EMAIL`
  * `EMAIL_PASSWORD_APP`

* These env variables are necaissary for secure authentification. Make sure you put different secrets for each variable
  * `ACCESS_JWT_SECRET`


  * `REFRESH_JWT_SECRET`


  * `EMAIL_JWT_SECRET`

* Firstly, on your terminal, make sure you are on the root project directory and run these following commands:
make sure you install the dependencies
```bash
npm install
```
-   Server is running on port 8000.
-   MySql is running on port 3306 by default, you can always change that on the env variables
-   Make sure to start mysql and appache servers.

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
5. Next, go back to the root directory and run this command to serve images to the front app:
```bash
cd ..
http-server
```

6. Finally, start the server by typing this command:
```bash
npm start
```
And voila! API is running!

## 🔗 Contact
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/hadjaissahamza/)

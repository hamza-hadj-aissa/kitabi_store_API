'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
require('dotenv').config();
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config, {
    define: {
      timestamps: true,
      freezeTableName: true,
    },
  });
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config, {
    define: {
      timestamps: true,
      freezeTableName: true,
    },
  });
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// This is used to sync the DB with new changes
// Object.keys(db).forEach(async modelName => {
//   await db[modelName].sync({
//     alter: true
//   });
// });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

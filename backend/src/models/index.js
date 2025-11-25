const { Sequelize } = require("sequelize");
const config = require("../config/config");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load Models
db.Department = require("./Department")(sequelize, Sequelize.DataTypes);
db.User = require("./User")(sequelize, Sequelize.DataTypes);

// Setup Associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;

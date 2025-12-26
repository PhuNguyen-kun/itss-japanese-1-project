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
db.Category = require("./Category")(sequelize, Sequelize.DataTypes);
db.Topic = require("./Topic")(sequelize, Sequelize.DataTypes);
db.Story = require("./Story")(sequelize, Sequelize.DataTypes);
db.Comment = require("./Comment")(sequelize, Sequelize.DataTypes);
db.Reaction = require("./Reaction")(sequelize, Sequelize.DataTypes);
db.Document = require("./Document")(sequelize, Sequelize.DataTypes);
db.SavedDocument = require("./SavedDocument")(sequelize, Sequelize.DataTypes);
db.SavedStory = require("./SavedStory")(sequelize, Sequelize.DataTypes);
db.Notification = require("./Notification")(sequelize, Sequelize.DataTypes);
db.Follow = require("./Follow")(sequelize, Sequelize.DataTypes);

// Setup Associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;

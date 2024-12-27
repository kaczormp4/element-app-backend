// models/Element.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User"); // Correct path to the User model

const Element = sequelize.define("Element", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateCreated: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("toDo", "note"),
    allowNull: false,
  },
  visibility: {
    type: DataTypes.ENUM("public", "private"),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("done", "inProgress"),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT, // New content field
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users", // Table name
      key: "id",
    },
  },
  sharedForUserIds: {
    type: DataTypes.ARRAY(DataTypes.INTEGER), // Array of integers
    defaultValue: [], // Default to an empty array
  },
});

// Define the relationship: Element belongs to User
Element.belongsTo(User, {
  foreignKey: "userId",
  as: "owner", // Alias for the association
});

module.exports = Element;

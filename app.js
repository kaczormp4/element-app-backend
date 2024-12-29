// app.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const sequelize = require("./config/db"); // Import DB configuration
const userRoutes = require("./routes/userRoutes"); // Import user routes
const elementRoutes = require("./routes/elementRoutes");
const publicRoutes = require("./routes/publicRoutes");

dotenv.config(); // Load environment variables

const app = express();

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true); // Allow any origin
    }, // Your frontend URL
    // origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies or credentials
  })
);
app.use(bodyParser.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/elements", elementRoutes);
app.use("/api/public", publicRoutes);

//updating datebase table schema
// (async () => {
//   try {
//     await queryInterface.addColumn("Elements", "content", {
//       type: Sequelize.TEXT, // Use TEXT for longer content
//       allowNull: true, // Adjust based on your requirements
//     });
//     console.log('Column "content" added successfully.');
//   } catch (error) {
//     console.error("Error adding column:", error);
//   }
// })();

// const { Sequelize } = require("sequelize");

// (async () => {
//   try {
//     const queryInterface = sequelize.getQueryInterface(); // Get QueryInterface instance

//     // Add the `sharedForUserIds` column to the `Elements` table
//     await queryInterface.addColumn("Elements", "sharedForUserIds", {
//       type: Sequelize.ARRAY(Sequelize.INTEGER), // Array of integers
//       allowNull: true, // Allow null for existing records
//       defaultValue: [], // Default to an empty array
//     });

//     console.log('Column "sharedForUserIds" added successfully.');
//   } catch (error) {
//     console.error("Error adding column:", error);
//   } finally {
//     await sequelize.close(); // Close the database connection
//   }
// })();

// Synchronize Sequelize models with the database
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database & tables synchronized!");
  })
  .catch((err) => {
    console.error("Unable to synchronize database:", err);
  });

// Test DB connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected...");
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

// Start server
// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

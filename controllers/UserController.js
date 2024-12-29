// controllers/UserController.js
const User = require("../models/User"); // Import the User model
const bcrypt = require("bcrypt"); // Assuming you use bcrypt for hashing passwords
const jwt = require("jsonwebtoken");

const UserController = {
  // Create a new user
  async createUser(req, res) {
    try {
      const { username, password } = req.body;

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({ username, password: hashedPassword });

      res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  // Authenticate a user (login)
  async loginUser(req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ where: { username } });

      if (!user) return res.status(400).json({ message: "User not found" });

      // Check password match
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid)
        return res.status(400).json({ message: "Invalid password" });

      // Create JWT token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      //   res.cookie("jwt", token, {
      //     httpOnly: true, // Prevents access via JavaScript
      //     secure: process.env.NODE_ENV === "production", // Ensures cookies are sent over HTTPS in production
      //     sameSite: "strict", // Prevents CSRF attacks
      //     maxAge: 3600000, // 1 hour in milliseconds
      //   });

      res.json({ message: "Login successful", token });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  async getAllUsers(req, res) {
    try {
      const users = await User.findAll({
        attributes: ["id", "username"], // You can specify other attributes if needed
      });

      res.status(200).json({ users });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users", error });
    }
  },
  //   app.post('/logout', (req, res) => {
  //     res.clearCookie('jwt', {
  //       httpOnly: true,
  //       secure: process.env.NODE_ENV === 'production',
  //       sameSite: 'strict',
  //     });
  //     res.json({ message: 'Logged out successfully' });
  //   });

  async logout(req, res) {
    try {
      // Clear the token if it's stored as a cookie
      res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "Error during logout", error });
    }
  },
};

module.exports = UserController;

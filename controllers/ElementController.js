const { Op } = require("sequelize");

const Element = require("../models/Element");
const User = require("../models/User"); // Import User model

const ElementController = {
  // Create a new element and associate it with a user
  async createElement(req, res) {
    try {
      const { title, type, visibility, status, content } = req.body;
      const userId = req.user.userId; // Assuming the user ID is set by the authentication middleware

      const element = await Element.create({
        title,
        dateCreated: new Date().toISOString(),
        type,
        visibility,
        status,
        content,
        userId,
      });

      res
        .status(201)
        .json({ message: "Element created successfully", element });
    } catch (error) {
      console.error("Error creating element:", error);
      res.status(500).json({ message: "Error creating element", error });
    }
  },

  // Clone an existing element (must belong to the user)
  async cloneElement(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId; // Assuming user is authenticated

      // Find the element by its ID and check if it belongs to the current user
      const element = await Element.findOne({ where: { id, userId } });
      if (!element)
        return res
          .status(404)
          .json({ message: "Element not found or you don't have permission" });

      // Clone the element
      const clonedElement = await Element.create({
        title: element.title + " (Copy)",
        dateCreated: new Date().toISOString(),
        type: element.type,
        visibility: element.visibility,
        status: element.status,
        userId, // Associate the cloned element with the user
      });

      res
        .status(201)
        .json({ message: "Element cloned successfully", clonedElement });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  // Delete an element (only if it belongs to the user)
  async deleteElement(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId; // Assuming user is authenticated

      // Find the element by its ID and check if it belongs to the current user
      const element = await Element.findOne({ where: { id, userId } });
      if (!element)
        return res
          .status(404)
          .json({ message: "Element not found or you don't have permission" });

      // Delete the element
      await element.destroy();

      res.status(200).json({ message: "Element deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  // Edit an element (only if it belongs to the user)
  async editElement(req, res) {
    try {
      const { id } = req.params;
      const { title, dateCreated, type, visibility, status, content } =
        req.body;
      const userId = req.user.userId; // Assuming user is authenticated

      // Find the element by its ID and check if it belongs to the current user
      const element = await Element.findOne({ where: { id, userId } });
      if (!element)
        return res
          .status(404)
          .json({ message: "Element not found or you don't have permission" });

      // Update the element
      element.title = title || element.title;
      element.dateCreated = dateCreated || element.dateCreated;
      element.type = type || element.type;
      element.visibility = visibility || element.visibility;
      element.status = status || element.status;
      element.content = content || element.content;

      // Save the updated element
      await element.save();

      res
        .status(200)
        .json({ message: "Element updated successfully", element });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  // Publish an element (only if it belongs to the user)
  async publishElement(req, res) {
    try {
      const { id } = req.params;

      const userId = req.user.userId; // Assuming user is authenticated

      // Find the element by its ID and check if it belongs to the current user
      const element = await Element.findOne({ where: { id, userId } });
      if (!element)
        return res
          .status(404)
          .json({ message: "Element not found or you don't have permission" });

      // Set the visibility to 'public' and save
      element.visibility = "public";
      await element.save();

      res
        .status(200)
        .json({ message: "Element published successfully", element });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  // Publish an element (only if it belongs to the user)
  async unPublishElement(req, res) {
    try {
      const { id } = req.params;

      const userId = req.user.userId; // Assuming user is authenticated

      // Find the element by its ID and check if it belongs to the current user
      const element = await Element.findOne({ where: { id, userId } });
      if (!element)
        return res
          .status(404)
          .json({ message: "Element not found or you don't have permission" });

      // Set the visibility to 'private' and save
      element.visibility = "private";
      await element.save();

      res
        .status(200)
        .json({ message: "Element unpublished successfully", element });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  // Fetch a single element by its ID
  async getElement(req, res) {
    try {
      const { id } = req.params;

      // Find the element with its associated user
      const element = await Element.findByPk(id, {
        include: {
          model: User,
          as: "owner",
          attributes: ["id", "username"], // Include specific user fields
        },
      });

      if (!element) {
        return res.status(404).json({ message: "Element not found" });
      }

      res.status(200).json({ element });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching element1", error });
    }
  },

  // Fetch all elements with optional filters
  async getElements(req, res) {
    try {
      const { type, status } = req.query;
      const userId = req.user.userId; // Extract the authenticated user's ID from req.user

      // Build a filter object dynamically based on query parameters
      const filter = { userId }; // Always filter by the authenticated user
      if (type) filter.type = type;
      if (status) filter.status = status;

      // Find all elements matching the filter and include user data
      const elements = await Element.findAll({
        where: filter,
        include: {
          model: User,
          as: "owner",
          attributes: ["id", "username"], // Include specific user fields
        },
        order: [["updatedAt", "DESC"]], // Sort by updatedAt in descending order
      });

      res.status(200).json({ elements });
    } catch (error) {
      console.error("Error fetching elements:", error);
      res.status(500).json({ message: "Error fetching elements", error });
    }
  },

  async shareElement(req, res) {
    try {
      const { id } = req.params; // Element ID from the URL
      const { sharedForUserIds } = req.body; // Array of user IDs to share with
      const userId = req.user.userId; // Authenticated user ID

      // Find the element
      const element = await Element.findOne({ where: { id } });

      if (!element) {
        return res.status(404).json({ message: "Element not found" });
      }

      // Ensure the user is the owner of the element
      if (element.userId !== userId) {
        return res
          .status(403)
          .json({ message: "You are not the owner of this element" });
      }

      // Update the sharedForUserIds column
      const updatedElement = await element.update({
        sharedForUserIds: Array.from(
          new Set([...element.sharedForUserIds, ...sharedForUserIds])
        ), // Merge unique IDs
      });

      res.status(200).json({
        message: "Element shared successfully",
        element: updatedElement,
      });
    } catch (error) {
      console.error("Error sharing element:", error);
      res.status(500).json({ message: "Error sharing element", error });
    }
  },

  // Get elements shared with the authenticated user
  async getSharedElements(req, res) {
    try {
      const userId = parseInt(req.user.userId, 10); // Ensure userId is a valid integer

      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Query the database for elements shared with the user
      const sharedElements = await Element.findAll({
        where: {
          sharedForUserIds: {
            [Op.contains]: [userId], // Check if userId exists in the array
          },
        },
        include: {
          model: User,
          as: "owner",
          attributes: ["id", "username"], // Include specific user fields
        },
      });

      // Log and respond with the retrieved shared elements
      res.status(200).json({ sharedElements });
    } catch (error) {
      console.error("Error fetching shared elements:", error);

      // Check if the error is related to a type mismatch or invalid query
      if (error.name === "SequelizeDatabaseError" && error.code === "22P02") {
        return res.status(400).json({
          message: "Invalid data type in the query",
          error: error.message,
        });
      }

      res
        .status(500)
        .json({ message: "Error fetching shared elements", error });
    }
  },
};

module.exports = ElementController;

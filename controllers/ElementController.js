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
      console.log("REQQQ", id);

      const userId = req.user.userId; // Assuming user is authenticated
      console.log("USER ID", userId);

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
      res.status(500).json({ message: "Error fetching element", error });
    }
  },

  // Fetch all elements with optional filters
  async getElements(req, res) {
    try {
      const { type, status } = req.query;
      const userId = req.user.userId; // Extract the authenticated user's ID from req.user
      console.log("RES,", req.user);

      // Build a filter object dynamically based on query parameters
      const filter = { userId }; // Always filter by the authenticated user
      if (type) filter.type = type;
      if (status) filter.status = status;
      console.log("FILTER", filter);

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
};

module.exports = ElementController;

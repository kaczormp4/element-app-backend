const express = require("express");
const router = express.Router();
const ElementController = require("../controllers/ElementController");
const authMiddleware = require("../middlewares/auth"); // Optional: protect routes with JWT

// Create a new element
router.post("/create", authMiddleware, ElementController.createElement);

// Clone an existing element
router.post("/:id/clone", authMiddleware, ElementController.cloneElement);

// Delete an element
router.delete("/:id", authMiddleware, ElementController.deleteElement);

// Edit an element
router.put("/:id", authMiddleware, ElementController.editElement);

// Publish an element
router.put("/:id/publish", authMiddleware, ElementController.publishElement);

// UnPublish an element
router.put(
  "/:id/unpublish",
  authMiddleware,
  ElementController.unPublishElement
);

// Route to fetch a single element by ID
router.get("/:id", authMiddleware, ElementController.getElement);

// Route to fetch all elements with optional filters
router.get("/", authMiddleware, ElementController.getElements);

module.exports = router;

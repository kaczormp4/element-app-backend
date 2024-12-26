const express = require("express");
const router = express.Router();
const PublicController = require("../controllers/PublicController");

// Route to fetch all public elements
router.get("/elements", PublicController.getPublicElements);

module.exports = router;

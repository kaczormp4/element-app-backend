const Element = require("../models/Element");
const User = require("../models/User"); // Include user data if needed

const PublicController = {
  // Get all public elements
  async getPublicElements(req, res) {
    try {
      const publicElements = await Element.findAll({
        where: { visibility: "public" }, // Filter only public elements
        include: {
          model: User,
          as: "owner",
          attributes: ["id", "username"], // Include specific user fields
          order: [["updatedAt", "DESC"]], // Sort by updatedAt in descending order
        },
      });

      res.status(200).json({ elements: publicElements });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error fetching public elements", error });
    }
  },
};

module.exports = PublicController;

// middlewares/auth.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];
  const extractedToken = token?.startsWith("Bearer ")
    ? token.split(" ")[1]
    : token;
  console.log("TOKEN", req.headers);

  if (!extractedToken)
    return res.status(403).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(extractedToken, process.env.JWT_SECRET);
    req.user = decoded; // Attach user information to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired, please log in again" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token signature" });
    }

    res.status(400).json({ message: "Invalid token", error });
  }
};

module.exports = authMiddleware;

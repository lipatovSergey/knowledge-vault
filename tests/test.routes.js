const express = require("express");
const router = express.Router();

console.log("test router CONNECTED");
// set fake userId to session
router.post("/session/:userId", (req, res) => {
  req.session.userId = req.params.userId;
  res.status(200).json({ message: "Fake session set" });
});

router.get("/unexpected-error", () => {
  throw new Error("Simulated unexpected error");
});

module.exports = router;

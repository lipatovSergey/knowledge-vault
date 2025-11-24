import { Router } from "express";
const router = Router();

console.log("test router CONNECTED");
// set fake userId to session
router.post("/session/:userId", (req, res) => {
  req.session.userId = req.params.userId;
  res.status(200).json({ message: "Fake session set" });
});

router.get("/touch", (req, res) => {
  req.session.test_touch = true;
  req.session.save((err) => {
    if (err) return res.status(500).json({ ok: false, error: String(err) });
    res.status(200).json({ ok: true });
  });
});

router.get("/unexpected-error", () => {
  throw new Error("Simulated unexpected error");
});

export default router;

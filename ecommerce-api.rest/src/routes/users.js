const express = require("express");

//crea una mini aplicacion
const router = express.Router();
//genera token jwt
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Cart = require("../models/Cart");
const { authMiddleware, requireRole } = require("../middlewares/auth");
const bcrypt = require("bcrypt");

//registrar admin o usuario
router.post("/", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(400)
        .json({ success: false, error: "Email ya registrado" });

    // Creamos un  usuario con rol "user"
    const newUser = await User.create({
      name,
      email,
      password,
      role: "user",
    });

    await Cart.create({ user: newUser._id, items: [] });

    const token = jwt.sign(
      { _id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Usuario registrado correctamente",
      data: { user: newUser, token },
    });
  } catch (err) {
    next(err);
  }
});

// Crear admin (solo un admin puede hacerlo)
router.post(
  "/admin",
  authMiddleware(),
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      const existing = await User.findOne({ email });
      if (existing)
        return res
          .status(400)
          .json({ success: false, error: "Email ya registrado" });

      const hashedPassword = await bcrypt.hash(password, 10);

      const newAdmin = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "admin",
      });

      res.json({ success: true, data: newAdmin });
    } catch (err) {
      next(err);
    }
  }
);

// Login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials" });
    const ok = await user.comparePassword(password);
    if (!ok)
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials" });
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "change_this_secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// Listar usuarios solo (admin)
router.get(
  "/",
  authMiddleware(),
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const users = await User.find().select("-password");
      res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  }
);

// Get obener usuario por id
router.get("/:id", authMiddleware(false), async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id).select("-password");
    if (!u) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: u });
  } catch (err) {
    next(err);
  }
});

// Delete user y tambien delete carrito
router.delete(
  "/:id",
  authMiddleware(),
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const u = await User.findByIdAndDelete(req.params.id);
      if (!u)
        return res.status(404).json({ success: false, error: "Not found" });
      await Cart.findOneAndDelete({ user: req.params.id });
      res.json({ success: true, data: "deleted" });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

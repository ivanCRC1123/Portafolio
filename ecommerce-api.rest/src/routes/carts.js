const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { authMiddleware } = require("../middlewares/auth");

// ver carito completo por id
router.get("/:userId", authMiddleware(), async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId }).populate(
      "items.product"
    );
    if (!cart)
      return res.status(404).json({ success: false, error: "Cart not found" });
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// ver el valor total del  carrito completo por la id
router.get("/:userId/total", authMiddleware(), async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId }).populate(
      "items.product"
    );
    if (!cart)
      return res.status(404).json({ success: false, error: "Cart not found" });
    let total = 0;
    const items = cart.items.map((it) => {
      if (!it.product) return null;
      const subtotal = (it.product.price || 0) * it.quantity;
      total += subtotal;
      return { product: it.product, quantity: it.quantity, subtotal };
    });
    res.json({ success: true, data: { items, total } });
  } catch (err) {
    next(err);
  }
});

// añadir o actualizar producto
router.post("/:userId", authMiddleware(), async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    //lo buscamos nache
    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, error: "Producto no encontrado" });

    let cart = await Cart.findOne({ user: req.params.userId });
    if (!cart) cart = await Cart.create({ user: req.params.userId, items: [] });

    // Revisamos si el producto ya está en el carrito
    const found = cart.items.find((i) => i.product.toString() === productId);
    if (found) {
      found.quantity += quantity; // suma
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    // Poblar productos para ver detalles
    const populated = await cart.populate("items.product");
    res.json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
});

// eliminar carrito
router.delete(
  "/:userId/:productId",
  authMiddleware(),
  async (req, res, next) => {
    try {
      const cart = await Cart.findOne({ user: req.params.userId });
      if (!cart)
        return res
          .status(404)
          .json({ success: false, error: "Cart not found" });
      cart.items = cart.items.filter(
        (i) => i.product.toString() !== req.params.productId
      );
      await cart.save();
      res.json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

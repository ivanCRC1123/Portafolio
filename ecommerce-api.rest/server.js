//cargamos las dependencias y configuracion

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
//importamos rutas
const usersRouter = require("./src/routes/users");
const productsRouter = require("./src/routes/products");
const categoriesRouter = require("./src/routes/categories");
const cartsRouter = require("./src/routes/carts");
const ordersRouter = require("./src/routes/orders");
const reviewsRouter = require("./src/routes/reviews");
//error en midleware
const { errorHandler } = require("./src/middlewares/errorHandler");
//configuramos la app express
const app = express();
app.use(morgan("dev"));
app.use(bodyParser.json());
//monatajr d erutas
app.use("/api/usuarios", usersRouter);
app.use("/api/productos", productsRouter);
app.use("/api/categorias", categoriesRouter);
app.use("/api/carrito", cartsRouter);
app.use("/api/ordenes", ordersRouter);
app.use("/api/resenas", reviewsRouter);

app.use(errorHandler);

//configuracion de puerto y la base de datos
const PORT = process.env.PORT || 3000;
const MONGO = process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";
//coneccion a mongodb
mongoose
  .connect(MONGO, {})
  .then(() => {
    console.log("MongoDB conectado");
    app.listen(PORT, () => console.log("Server running on port", PORT));
  })
  .catch((err) => {
    console.error("MongoDB connection error", err);
  });

import express from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProductById,
  updateProduct,
} from "../controllers/productController.js";
import {
  validateCreateProduct,
  validateUpdateProduct,
} from "../validators/productValidator.js";

const productRoute = express.Router();

productRoute.get("/", getProduct);
productRoute.get("/:id", getProductById);
productRoute.post("/", validateCreateProduct, createProduct);
productRoute.put("/:id", validateUpdateProduct, updateProduct);
productRoute.delete("/:id", deleteProduct);

export default productRoute;

// backend/routes/productRoutes.js
const express = require("express");
const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");

const router = express.Router();

// Get all products
router.get("/", asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
}));

// Get a single product by ID
router.get("/:id", asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
}));

// Add a product
router.post("/", asyncHandler(async (req, res) => {
  const newProduct = new Product(req.body);
  const savedProduct = await newProduct.save();
  res.status(201).json(savedProduct);
}));

// Update a product
router.put("/:id", asyncHandler(async (req, res) => {
  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Return the modified document
    runValidators: true, // Run model validation on update
  });
  
  if (updatedProduct) {
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
}));

// Delete a product
router.delete("/:id", asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne(); // Use deleteOne()
    res.json({ message: "Product deleted" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
}));

module.exports = router;
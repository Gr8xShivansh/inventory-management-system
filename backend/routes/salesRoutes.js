// backend/routes/salesRoutes.js
const express = require("express");
const mongoose = require("mongoose");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");

const router = express.Router();

// GET all sales
router.get("/", asyncHandler(async (req, res) => {
  const sales = await Sale.find()
    .populate("product", "sku name")
    .sort({ date: -1 });
  res.json(sales);
}));

// ADD a sale (No Transaction)
router.post("/", asyncHandler(async (req, res) => {
  const { product, unitsSold, date } = req.body;
  
  // Logic is now sequential, not transactional
  try {
    const productDoc = await Product.findById(product);

    if (!productDoc) {
      res.status(404);
      throw new Error("Product not found");
    }

    if (productDoc.stock < unitsSold) {
      res.status(400);
      throw new Error("Not enough stock to make sale");
    }

    // 1. Decrement stock and increment unitsSold
    productDoc.stock -= unitsSold;
    productDoc.unitsSold += unitsSold;
    await productDoc.save(); // Save product update

    // 2. Calculate sale details
    const totalRevenue = productDoc.salePrice * unitsSold;
    const totalCost = productDoc.costPrice * unitsSold;
    const profit = totalRevenue - totalCost;

    // 3. Create the sale record
    const newSale = new Sale({
      product: productDoc._id,
      productName: productDoc.name,
      category: productDoc.category,
      sku: productDoc.sku,
      date,
      unitsSold,
      costPrice: productDoc.costPrice,
      salePrice: productDoc.salePrice,
      totalRevenue,
      totalCost,
      profit,
    });
    
    const savedSale = await newSale.save(); // Save sale
    res.status(201).json(savedSale);

  } catch (error) {
    throw error; // Pass to error handler
  }
}));

// DELETE a sale (No Transaction)
router.delete("/:id", asyncHandler(async (req, res) => {
  
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      res.status(44);
      throw new Error("Sale not found");
    }

    // Find the associated product
    const productDoc = await Product.findById(sale.product);

    if (productDoc) {
      // 1. Add stock back
      productDoc.stock += sale.unitsSold;
      // 2. Reduce unitsSold count
      productDoc.unitsSold = Math.max(0, productDoc.unitsSold - sale.unitsSold);
      await productDoc.save(); // Save product update
    }

    // 3. Delete the sale
    await sale.deleteOne();
    res.json({ message: "Sale deleted and stock updated" });

  } catch (error) {
    throw error; // Pass to error handler
  }
}));

module.exports = router;
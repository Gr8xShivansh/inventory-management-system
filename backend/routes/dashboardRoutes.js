// backend/routes/dashboardRoutes.js
const express = require("express");
const Product = require("../models/Product");
const Sale = require("../models/Sale");
const asyncHandler = require("express-async-handler");

const router = express.Router();

router.get("/", asyncHandler(async (req, res) => {
  // 1. Get all products and sales in parallel
  const [products, sales] = await Promise.all([
    Product.find().sort({ createdAt: -1 }),
    Sale.find().sort({ date: -1 }),
  ]);

  // 2. Calculate Core Stats
  const totalProducts = products.length;
  const totalCategories = new Set(products.map((p) => p.category)).size;
  const totalRevenue = sales.reduce((acc, s) => acc + s.totalRevenue, 0);
  const totalProfit = sales.reduce((acc, s) => acc + s.profit, 0);

  // 3. Revenue Over Time (Last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const revenueMap = {};
  sales
    .filter(s => new Date(s.date) > thirtyDaysAgo)
    .forEach((sale) => {
      const dateKey = new Date(sale.date).toISOString().split("T")[0];
      if (!revenueMap[dateKey]) revenueMap[dateKey] = 0;
      revenueMap[dateKey] += sale.totalRevenue;
    });
  
  const revenueData = Object.entries(revenueMap)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // 4. Category Sales Split
  const categoryMap = {};
  sales.forEach((sale) => {
    const cat = sale.category || "Uncategorized";
    if (!categoryMap[cat]) categoryMap[cat] = 0;
    categoryMap[cat] += sale.totalRevenue;
  });
  const categorySplit = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }));

  // 5. Stock & Expiry Alerts
  const now = new Date();
  // Set time to 00:00:00 to ensure full-day comparison
  now.setHours(0, 0, 0, 0); 
  
  const ninetyDaysLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const lowStock = products
    .filter((p) => p.stock > 0 && p.stock <= p.lowStockAlert)
    .map(p => ({ _id: p._id, name: p.name, stock: p.stock, lowStockAlert: p.lowStockAlert }));
    
  const outOfStock = products
    .filter((p) => p.stock === 0)
    .map(p => ({ _id: p._id, name: p.name, stock: p.stock }));

  // **FEATURE UPDATE:** Get EXPIRED and NEAR-EXPIRY products
  const expiryAlerts = products
    .filter((p) =>
      p.expiryDate &&
      new Date(p.expiryDate) <= ninetyDaysLater // Get all items expired or expiring in 90 days
    )
    .map(p => {
      const expiryDate = new Date(p.expiryDate);
      expiryDate.setHours(0, 0, 0, 0); // Normalize date for comparison
      const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      return {
        _id: p._id,
        name: p.name,
        expiryDate: p.expiryDate,
        daysLeft: daysLeft,
      };
    })
    // **FEATURE UPDATE:** Sort by daysLeft (expired items first)
    .sort((a,b) => a.daysLeft - b.daysLeft); 

  const recentProducts = products.slice(0, 5).map(p => ({
     _id: p._id,
     name: p.name, 
     category: p.category, 
     stock: p.stock, 
     salePrice: p.salePrice
  }));

  res.json({
    stats: {
      totalProducts,
      totalCategories,
      totalRevenue,
      totalProfit,
    },
    charts: {
      revenueData,
      categorySplit,
    },
    alerts: {
      lowStock,
      outOfStock,
      expiryAlerts, // Renamed from nearExpiry
    },
    recentProducts
  });
}));

module.exports = router;
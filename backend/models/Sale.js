// backend/models/Sale.js
const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },
  // We store these for historical reporting, even if the product
  // name or price changes later.
  productName: { type: String, required: true },
  category: { type: String, required: true },
  sku: { type: String, required: true },

  date: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  unitsSold: { 
    type: Number, 
    required: true,
    min: [1, 'Must sell at least one unit']
  },
  costPrice: { 
    type: Number, 
    required: true // The cost price at the time of sale
  },
  salePrice: { 
    type: Number, 
    required: true // The sale price at the time of sale
  },

  // Calculated fields for easy reporting
  totalRevenue: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  profit: { type: Number, required: true },
}, {
  timestamps: true
});

module.exports = mongoose.model('Sale', saleSchema);
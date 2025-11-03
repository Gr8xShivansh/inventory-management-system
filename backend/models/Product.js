// backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: { 
    type: String, 
    required: [true, 'SKU is required'], 
    unique: true,
    trim: true,
  },
  name: { 
    type: String, 
    required: [true, 'Product name is required'], 
    trim: true 
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'], 
    trim: true,
    // **THIS IS THE UPDATE**
    // It only allows these three values.
    enum: {
      values: ['Cosmetics', 'Skincare', 'Haircare'],
      message: '{VALUE} is not a supported category. Must be Cosmetics, Skincare, or Haircare.'
    }
  },
  stock: { 
    type: Number, 
    required: true, 
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  costPrice: { 
    type: Number, 
    required: [true, 'Cost price is required'],
    default: 0,
    min: [0, 'Cost price cannot be negative']
  },
  salePrice: { 
    type: Number, 
    required: [true, 'Sale price is required'],
    default: 0,
    min: [0, 'Sale price cannot be negative']
  },
  unitsSold: { 
    type: Number, 
    default: 0 
  },
  lowStockAlert: { 
    type: Number, 
    default: 10
  },
  highStockAlert: { 
    type: Number, 
    default: 100
  },
  reorderQuantity: { 
    type: Number, 
    default: 20 
  },
  manufacturingDate: { type: Date },
  expiryDate: { type: Date },
}, {
  timestamps: true 
});

module.exports = mongoose.model('Product', productSchema);
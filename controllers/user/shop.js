const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');

// Helper function to generate filter URLs
function generateFilterUrl(req, newFilters = {}) {
  const params = new URLSearchParams();
  
  // Add existing query parameters
  if (req.query.query) params.set('query', req.query.query);
  if (req.query.category) params.set('category', req.query.category);
  if (req.query.brand) params.set('brand', req.query.brand);
  if (req.query.minPrice) params.set('minPrice', req.query.minPrice);
  if (req.query.maxPrice) params.set('maxPrice', req.query.maxPrice);
  
  // Override with new filter values
  if (newFilters.category !== undefined) {
    if (newFilters.category) params.set('category', newFilters.category);
    else params.delete('category');
  }
  
  if (newFilters.brand !== undefined) {
    if (newFilters.brand) params.set('brand', newFilters.brand);
    else params.delete('brand');
  }
  
  if (newFilters.minPrice !== undefined) {
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    else params.delete('minPrice');
  }
  
  if (newFilters.maxPrice !== undefined) {
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    else params.delete('maxPrice');
  }
  
  return '/shop?' + params.toString();
}

// Helper function to check if a price range is active
function isPriceRangeActive(req, min, max) {
  const currentMin = parseInt(req.query.minPrice) || 0;
  const currentMax = parseInt(req.query.maxPrice) || 100000;
  return currentMin === min && currentMax === max;
}

// Helper function to generate pagination URLs
function generatePageUrl(req, page) {
  const params = new URLSearchParams();
  
  // Add all existing query parameters
  if (req.query.query) params.set('query', req.query.query);
  if (req.query.category) params.set('category', req.query.category);
  if (req.query.brand) params.set('brand', req.query.brand);
  if (req.query.minPrice) params.set('minPrice', req.query.minPrice);
  if (req.query.maxPrice) params.set('maxPrice', req.query.maxPrice);
  
  // Set page parameter
  params.set('page', page);
  
  return '/shop?' + params.toString();
}

// Shop page route
router.get('/shop', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12; // Products per page
    const skip = (page - 1) * limit;
    
    // Build filter object based on query parameters
    const filter = {};
    
    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Brand filter
    if (req.query.brand) {
      filter.brand = req.query.brand;
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.salePrice = {};
      if (req.query.minPrice) {
        filter.salePrice.$gte = parseInt(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter.salePrice.$lte = parseInt(req.query.maxPrice);
      }
    }
    
    // Search query filter
    if (req.query.query) {
      filter.productName = { $regex: req.query.query, $options: 'i' };
    }
    
    // Get products with filters applied
    const products = await Product.find(filter)
      .populate('category')
      .populate('brand')
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);
    
    // Get categories and brands for filters
    const categories = await Category.find({});
    const brands = await Brand.find({});
    
    // Add helper functions to res.locals
    res.locals.generateFilterUrl = (newFilters) => generateFilterUrl(req, newFilters);
    res.locals.isPriceRangeActive = (min, max) => isPriceRangeActive(req, min, max);
    res.locals.generatePageUrl = (page) => generatePageUrl(req, page);
    
    res.render('shop', {
      products,
      categories,
      brands,
      currentPage: page,
      totalPages,
      query: req.query // Pass query parameters to template
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
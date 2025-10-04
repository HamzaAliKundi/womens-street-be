import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Product from '../models/Product';

// Create a new product (Admin only)
export const createProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    name,
    description,
    price,
    originalPrice,
    category,
    images,
    colors,
    sizes,
    material,
    dimensions,
    stockQuantity,
    discount
  } = req.body;

  const product = await Product.create({
    name,
    description,
    price,
    originalPrice,
    category,
    images,
    colors,
    sizes,
    material,
    dimensions,
    stockQuantity,
    discount: discount || 0,
    inStock: stockQuantity > 0
  });

  res.status(201).json({
    message: 'Product created successfully',
    status: 201,
    product
  });
});

// Get all products (with pagination and filtering)
export const getProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const category = req.query.category as string;
  const minPrice = req.query.minPrice as string;
  const maxPrice = req.query.maxPrice as string;
  const search = req.query.search as string;

  const filter: any = {};

  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }
  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (page - 1) * limit;

  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(filter);

  res.status(200).json({
    message: 'Products fetched successfully',
    status: 200,
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get a single product by ID
export const getProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  res.status(200).json({
    message: 'Product fetched successfully',
    status: 200,
    product
  });
});

// Update a product (Admin only)
export const updateProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData = req.body;

  const product = await Product.findById(id);
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  // Update inStock based on stockQuantity
  if (updateData.stockQuantity !== undefined) {
    updateData.inStock = updateData.stockQuantity > 0;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    message: 'Product updated successfully',
    status: 200,
    product: updatedProduct
  });
});

// Delete a product (Admin only)
export const deleteProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  await Product.findByIdAndDelete(id);

  res.status(200).json({
    message: 'Product deleted successfully',
    status: 200
  });
});



// Get products by category
export const getProductsByCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { category } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const skip = (page - 1) * limit;

  const products = await Product.find({ category })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments({ category });

  res.status(200).json({
    message: 'Products fetched successfully',
    status: 200,
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Search products
export const searchProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { q } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  if (!q) {
    res.status(400).json({ message: 'Search query is required' });
    return;
  }

  const skip = (page - 1) * limit;

  const products = await Product.find({ $text: { $search: q as string } })
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments({ $text: { $search: q as string } });

  res.status(200).json({
    message: 'Search results fetched successfully',
    status: 200,
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get all unique categories
export const getCategories = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const categories = await Product.distinct('category');

  res.status(200).json({
    message: 'Categories fetched successfully',
    status: 200,
    categories: categories.sort() // Sort alphabetically
  });
});

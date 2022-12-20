import * as fs from 'fs';
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import Order from '../models/order.model.js';
import Cart from '../models/cart.model.js';
import Variant from '../models/variant.model.js';
import { cloudinaryUpload, cloudinaryRemove } from '../utils/cloudinary.js';
import {
  productQueryParams,
  validateConstants,
  priceRangeFilter,
  ratingFilter,
} from '../utils/searchConstants.js';

const getAllProducts = async (req, res) => {
  const products = await Product.find({}).sort({ _id: -1 });
  const productSlice = products.slice(0, 10);
  res.json(productSlice);
};

// const findProductAndPaginate = async (req, res) => {
//   const pageSize = 10;
//   const page = Number(req.query.pageNumber) || 1;
//   let search = {};
//   if (req.query.keyword) {
//     search.name = {
//       $regex: req.query.keyword,
//       $options: "i",
//     };
//   }
//   if (req.query.category) {
//     search.category = req.query.category;
//   }
//   const count = await Product.countDocuments({ ...search });
//   const products = await Product.find({ ...search })
//     .populate(`category`)
//     .limit(pageSize)
//     .skip(pageSize * (page - 1))
//     .sort({ createdAt: -1 });
//   res.json({
//     products,
//     page,
//     pages: Math.ceil(count / pageSize),
//     countProducts: count,
//   });
// };

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('variants');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.status(200);
  res.json(product);
};

const reviewProduct = async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id || null;
  const product = await Product.findOne({ _id: productId });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const order = await Order.findOne({
    user: req.user._id,
    'orderItems.product': product._id,
    'orderItems.isAbleToReview': true,
    'orderItems.statusHistory.status': 'Paid',
  });
  if (!order) {
    res.status(400);
    throw new Error('You need to buy this product first');
  }
  const review = {
    name: req.user.name,
    rating: Number(rating),
    comment: comment,
    user: req.user._id,
  };
  product.reviews.push(review);
  product.rating =
    product.reviews.reduce(
      (previousValue, curentReview) => curentReview.rating + previousValue,
      0
    ) / product.reviews.length;
  const reviewOrderIndex = order.orderItems.findIndex((orderItem) => {
    return orderItem.product.toString() == product._id.toString();
  });
  if (reviewOrderIndex != -1) {
    order.orderItems[reviewOrderIndex].isAbleToReview = false;
    await Promise.all([product.save(), order.save()]);
  } else {
    await product.save();
  }
  res.status(201);
  res.json({ message: 'Added review' });
};

const deleteProduct = async (req, res) => {
  const deletedProduct = await Product.findByIdAndDelete(req.params.id);
  // const cart = await Cart.find({ 'cartItems.product': req.params.id });
  if (!deletedProduct) {
    res.status(404);
    throw new Error('Product not found');
    // res.json(newCart);
  }
  //extract product image name
  const cloudinaryImage = deletedProduct.image
    .match(/(\w+)\.(jpg|jpeg|jpe|png|webp)$/g)[0]
    .split('.')
    .shift();
  const removeCartItem = Cart.updateMany(
    {},
    { $pull: { cartItems: { deletedProduct: req.params.id } } }
  );
  const removeImage = cloudinaryRemove(cloudinaryImage);
  const removeVariants = Variant.deleteMany({ product: deleteProduct._id });
  await Promise.all([removeCartItem, removeImage, removeVariants]);
  res.json({ message: 'Product deleted' });
};

const updateProduct = async (req, res, next) => {
  const { name, price, description, category, image, countInStock } = req.body;
  let variants = JSON.parse(req.body.variants);
  const product = await Product.findById(req.params.id);
  if (
    price <= 0 ||
    countInStock < 0 ||
    price >= 10000 ||
    countInStock >= 10000
  ) {
    res.status(400);
    throw new Error(
      'Price or Count in stock is not valid, please correct it and try again'
    );
  }
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (variants.length == 0) {
    res.status(400);
    throw new Error('At least 1 variant remains');
  }
  //update product
  product.name = name || product.name;
  product.price = price || product.price;
  product.description = description || product.description;
  product.category = category || product.category;
  product.image = image || product.image;
  product.countInStock = countInStock || product.countInStock;
  //update image
  if (req.file) {
    const image = await cloudinaryUpload(req.file.path);
    if (!image) {
      res.status(404);
      throw new Error('Error while uploading image');
    }
    const cloudinaryImage = product.image
      .match(/(\w+)\.(jpg|jpeg|jpe|png|webp)$/g)[0]
      .split('.')
      .shift();
    const removeOldImageCloudinary = cloudinaryRemove(cloudinaryImage);
    const removeNewImageLocal = fs.promises.unlink(req.file.path);
    await Promise.all([removeOldImageCloudinary, removeNewImageLocal]);
    product.image = image.secure_url.toString();
  }
  //update variant
  //update current variants
  const newProductVariantIds = [];
  const variantUpdates = variants.map((variant) => {
    if (product.variants.indexOf(variant._id) != -1) {
      newProductVariantIds.push(variant._id);
      return Variant.findOneAndUpdate(
        { _id: variant },
        {
          size: variant.size,
          color: variant.color,
          quantity: variant.quantity,
          price: variant.price,
        },
        { new: true }
      );
    } else {
      const newVariant = new Variant({
        product: product._id,
        size: variant.size,
        color: variant.color,
        quantity: variant.quantity,
        price: variant.price,
      });
      newProductVariantIds.push(newVariant._id);
      return newVariant.save();
    }
  });
  const newVariants = await Promise.all(variantUpdates);
  //delete stripped out variants
  const outVariants = product.variants.filter((variant) => {
    return newProductVariantIds.indexOf(variant.toString()) == -1;
  });
  await Variant.deleteMany({ _id: { $in: outVariants } });
  product.variants = [...newProductVariantIds];
  //recalculate product price
  product.price =
    newVariants.reduce(
      (totalVariantPrice, currentVariant) =>
        totalVariantPrice + currentVariant.price,
      0
    ) / product.variants.length;
  const updatedProduct = await product.save();
  res.status(200);
  res.json(updatedProduct);
};

const createProduct = async (req, res) => {
  const name = req.body.name || null;
  let { description, category, image } = req.body;
  let variants = JSON.parse(req.body.variants);
  let imageUrl = '';
  const findProduct = Product.findOne({ name });
  const findCategory = Category.findById(category);
  const [existedProduct, existedCategory] = await Promise.all([
    findProduct,
    findCategory,
  ]);
  /* if (price <= 0 || countInStock < 0 || price >= 10000 || countInStock >= 10000) {
        res.status(400);
        throw new Error('Price or Count in stock is not valid, please correct it and try again');
    } */
  if (existedProduct) {
    res.status(400);
    throw new Error('Product name already exist');
  }
  if (!existedCategory) {
    res.status(400);
    throw new Error('Category is not found');
  }
  if (!variants || variants.length == 0) {
    res.status(400);
    throw new Error('Product must have at least one variant');
  }
  if ((!image || image.length == 0) && req.file) {
    image = await cloudinaryUpload(req.file.path);
    if (!image) {
      res.status(500);
      throw new Error('Error while uploading image');
    }
    imageUrl = image.secure_url;
    fs.unlink(req.file.path, (error) => {
      if (error) {
        throw new Error(error);
      }
    });
  }
  const product = new Product({
    name,
    description,
    category,
    image: imageUrl,
    //variants: variantIds,
  });
  if (!product) {
    res.status(500);
    throw new Error('Error while creating new proudct');
  }
  let totalVariantPrice = 0;
  const productVariants = variants.map(
    (productVariant) => new Variant({ product: product._id, ...productVariant })
  );
  const createdVariants = await Variant.insertMany(productVariants);
  const variantIds = createdVariants.map((variant) => {
    totalVariantPrice += variant.price;
    return variant._id;
  });
  if (variantIds.length == 0) {
    res.status(400);
    throw new Error('Invalid product data');
  }
  product.variants = variantIds;
  product.price = totalVariantPrice / product.variants.length;
  await product.save();
  res.status(201);
  res.json({ message: 'Product is added' });
};

const getProductsAndPaginate = async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 12;
  const page = Number(req.query.pageNumber) || 1;
  const dateOrderSortBy = validateConstants(
    productQueryParams,
    'date',
    req.query.dateOrder
  );
  const priceOrderSortBy = validateConstants(
    productQueryParams,
    'price',
    req.query.priceOrder
  );
  const bestSellerSortBy = validateConstants(
    productQueryParams,
    'totalSales',
    req.query.bestSeller
  );
  const productSortBy = {
    ...bestSellerSortBy,
    ...priceOrderSortBy,
    ...dateOrderSortBy,
  };
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {}; // TODO: return cannot find product

  //Check if category existed
  const categoryId = req.query.category || null;
  const category = await Category.findOne({ _id: categoryId });
  const categoryFilter = category ? { category: category } : {};
  const productFilter = {
    ...keyword,
    ...categoryFilter,
    ...priceRangeFilter(
      parseInt(req.query.minPrice),
      parseInt(req.query.maxPrice)
    ),
    ...ratingFilter(parseInt(req.query.rating)),
  };
  const count = await Product.countDocuments(productFilter);
  //else
  const products = await Product.find(productFilter)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort(productSortBy)
    .populate('category')
    .populate('variants');
  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    totalProducts: count,
  });
};

const getProductSearchResults = async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 20; //EDIT HERE
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};
  const productFilter = {
    ...keyword,
  };
  const products = await Product.find(productFilter)
    .limit(pageSize)
    .select('name');
  res.status(200);
  res.json(products);
};

const productController = {
  getProductById,
  getProductsAndPaginate,
  getAllProducts,
  getProductSearchResults,
  reviewProduct,
  createProduct,
  deleteProduct,
  updateProduct,
};
export default productController;

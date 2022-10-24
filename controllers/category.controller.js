import Category from "../models/category.model.js";
import { checkParams } from "../utils/validate.js";

// const findAll = async (req, res) => {
//   const exsitingCategories = await Category.find();
//   res.json(exsitingCategories);
// };

const findById = async (req, res) => {
  const { categoryId } = req.params;
  const existingCategory = await Category.findById(categoryId);
  if (!existingCategory) {
    res.status(404);
    throw new Error(`Category with id [${categoryId}] is not found`);
  }
  res.json(existingCategory);
};

//changed response
const findAndPaginate = async (req, res) => {
  const page = req.query.page || 0;
  const pageSize = req.query.pageSize || 10;
  const countCategoryDocuments = Category.countDocuments();
  const findCategories = Category.find({
    skip: page * pageSize,
    limit: pageSize,
  });
  const [categoryCount, existingCategories] = await Promise.all([
    countCategoryDocuments,
    findCategories,
  ]);
  const paginatedCategories = {
    data: existingCategories,
    totalPages: Math.ceil(categoryCount / pageSize),
    totalElements: categoryCount,
    hasNext: Math.ceil(categoryCount / pageSize) - page > 1,
  };
  res.json(paginatedCategories);
};

const create = async (req, res) => {
  const { name, description } = req.body;
  const error = checkParams({ name, description });
  if (error.length != 0) {
    res.status(400);
    throw new Error(error);
  }
  const category = await Category.findOne({ name: name.trim() });
  if (category) {
    res.status(404);
    throw new Error(`Category with name [${name}] already exists`);
  }

  const newCategory = new Category({
    name: name.trim(),
    description: description.trim(),
  });
  await newCategory.save();
  res.status(201).json({ message: `Category is added` });
};

const remove = async (req, res) => {
  const { categoryId } = req.params;
  const deletedCategory = await Category.findByIdAndDelete(req.params.id);
  if (!deletedCategory) {
    res.status(404);
    throw new Error(`Category with id [${categoryId}] is not found`);
  }
  res.json({ message: "Category was delete successfully" });
};

const update = async (req, res) => {
  const { name, description } = req.body;
  const { categoryId } = req.params;
  const error = checkParams({ name, description });
  if (error.length != 0) {
    res.status(400);
    throw new Error(error);
  }
  const existingCategory = await Category.findById(categoryId);
  if (!existingCategory) {
    res.status(404);
    throw new Error(`Category with id [${categoryId}] is not found`);
  }
  existingCategory.name = name || existingCategory.name;
  existingCategory.description = description || existingCategory.description;
  const updatedCategory = await existingCategory.save();
  res.json(updatedCategory);
};

const categoryController = {
  // findAll,
  findById,
  findAndPaginate,
  create,
  update,
  remove,
};
export default categoryController;

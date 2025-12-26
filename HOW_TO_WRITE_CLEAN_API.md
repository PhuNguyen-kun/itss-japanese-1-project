This is just an example of an API flow:

1. Route:

const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { authMiddleware, requireAdmin } = require("../middlewares/auth");
const {
validateGetAllCategories,
validateCreateCategory,
validateUpdateCategory,
} = require("../validators/categoryValidator");

router.get("/", validateGetAllCategories, categoryController.getAll);
router.get("/:slug", categoryController.getBySlug);
router.post(
"/",
authMiddleware,
requireAdmin,
validateCreateCategory,
categoryController.create
);
router.put(
"/:slug",
authMiddleware,
requireAdmin,
validateUpdateCategory,
categoryController.update
);
router.delete(
"/:slug",
authMiddleware,
requireAdmin,
categoryController.delete
);

module.exports = router;

2. Validation
const Joi = require("joi");
const { responseError } = require("../utils/apiResponse");

const validateGetAllCategories = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).optional().messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.min": "Page must be at least 1",
    }),
    per_page: Joi.number().integer().min(1).max(100).optional().messages({
      "number.base": "Per page must be a number",
      "number.integer": "Per page must be an integer",
      "number.min": "Per page must be at least 1",
      "number.max": "Per page must not exceed 100",
    }),
  });

  const { error } = schema.validate(req.query, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return responseError(res, "Validation failed", 400, errors);
  }

  next();
};

const validateCreateCategory = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
      "string.min": "Category name must be at least 2 characters",
      "string.max": "Category name must not exceed 255 characters",
      "any.required": "Category name is required",
    }),
    description: Joi.string().allow(null, "").optional(),
    parent_id: Joi.number().integer().positive().allow(null).optional(),
    is_active: Joi.boolean().optional(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return responseError(res, "Validation failed", 400, errors);
  }

  next();
};

const validateUpdateCategory = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).optional().messages({
      "string.min": "Category name must be at least 2 characters",
      "string.max": "Category name must not exceed 255 characters",
    }),
    description: Joi.string().allow(null, "").optional(),
    parent_id: Joi.number().integer().positive().allow(null).optional(),
    is_active: Joi.boolean().optional(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return responseError(res, "Validation failed", 400, errors);
  }

  next();
};

module.exports = {
  validateGetAllCategories,
  validateCreateCategory,
  validateUpdateCategory,
};

3. Controller:
const categoryService = require("../services/categoryService");
const {
  responseOk,
  responseOkWithPagination,
} = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const { HTTP_STATUS } = require("../constants");

class CategoryController {
  getAll = asyncHandler(async (req, res) => {
    const { categories, pagination } = await categoryService.getAll(req.query);
    return responseOkWithPagination(
      res,
      categories,
      pagination,
      "Categories retrieved successfully"
    );
  });

  getBySlug = asyncHandler(async (req, res) => {
    const category = await categoryService.getBySlug(req.params.slug);
    return responseOk(res, category, "Category retrieved successfully");
  });

  create = asyncHandler(async (req, res) => {
    const category = await categoryService.create(req.body);
    return responseOk(
      res,
      category,
      "Category created successfully",
      HTTP_STATUS.CREATED
    );
  });

  update = asyncHandler(async (req, res) => {
    const category = await categoryService.update(req.params.slug, req.body);
    return responseOk(res, category, "Category updated successfully");
  });

  delete = asyncHandler(async (req, res) => {
    const result = await categoryService.delete(req.params.slug);
    return responseOk(res, result, "Category deleted successfully");
  });
}

module.exports = new CategoryController();

4. Service:
const db = require("../models");
const { BadRequestError, NotFoundError } = require("../utils/ApiError");
const {
  getPaginationParams,
  getPaginationMeta,
} = require("../utils/pagination");
const slugify = require("../utils/slugify");

class CategoryService {
  async getAll(query = {}) {
    const { page, per_page, offset } = getPaginationParams(query);

    const { count, rows } = await db.Category.findAndCountAll({
      include: [
        {
          model: db.Category,
          as: "parent",
          attributes: ["id", "name", "slug"],
        },
        {
          model: db.Category,
          as: "children",
          attributes: ["id", "name", "slug", "is_active"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: per_page,
      offset,
    });

    const pagination = getPaginationMeta(count, page, per_page);

    return { categories: rows, pagination };
  }

  async getBySlug(slug) {
    const category = await db.Category.findOne({
      where: { slug },
      include: [
        {
          model: db.Category,
          as: "parent",
          attributes: ["id", "name", "slug"],
        },
        {
          model: db.Category,
          as: "children",
          attributes: ["id", "name", "slug", "is_active"],
        },
      ],
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return category;
  }

  async create(categoryData) {
    const slug = slugify(categoryData.name);

    const existingSlug = await db.Category.findOne({
      where: { slug },
    });

    if (existingSlug) {
      throw new BadRequestError("Category with similar name already exists");
    }

    if (categoryData.parent_id) {
      const parentCategory = await db.Category.findByPk(categoryData.parent_id);
      if (!parentCategory) {
        throw new NotFoundError("Parent category not found");
      }
    }

    const category = await db.Category.create({
      ...categoryData,
      slug,
    });

    return category;
  }

  async update(slug, categoryData) {
    const category = await db.Category.findOne({ where: { slug } });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    if (categoryData.name && categoryData.name !== category.name) {
      const newSlug = slugify(categoryData.name);

      const existingSlug = await db.Category.findOne({
        where: { slug: newSlug },
      });

      if (existingSlug && existingSlug.id !== category.id) {
        throw new BadRequestError("Category with similar name already exists");
      }

      categoryData.slug = newSlug;
    }

    if (categoryData.parent_id) {
      if (categoryData.parent_id === category.id) {
        throw new BadRequestError("Category cannot be its own parent");
      }

      const parentCategory = await db.Category.findByPk(categoryData.parent_id);
      if (!parentCategory) {
        throw new NotFoundError("Parent category not found");
      }
    }

    await category.update(categoryData);

    return category;
  }

  async delete(slug) {
    const category = await db.Category.findOne({ where: { slug } });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    const hasChildren = await db.Category.count({
      where: { parent_id: category.id },
    });

    if (hasChildren > 0) {
      throw new BadRequestError("Cannot delete category with subcategories");
    }

    const hasProducts = await db.Product.count({
      where: { category_id: category.id },
    });

    if (hasProducts > 0) {
      throw new BadRequestError("Cannot delete category with products");
    }

    await category.destroy();

    return { message: "Category deleted successfully" };
  }
}

module.exports = new CategoryService();

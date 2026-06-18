import Product from "../models/Product.js";

const getProduct = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, category, status } = req.query;

    const filter = {};

    if (search && search.trim().length > 0) {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    if (category && category.trim().length > 0) {
      filter.category = category.trim();
    }

    if (status === "in-stock") {
      filter.stock = { $gt: 0 };
    } else if (status === "out-of-stock") {
      filter.stock = 0;
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [products, total, categoryCounts] = await Promise.all([
      Product.find(filter)
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .lean(),

      Product.countDocuments(filter),

      Product.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    if (pageNum > totalPages && totalPages > 0) {
      return res.status(404).json({
        success: false,
        message: `Page ${pageNum} does not exist. Total pages: ${totalPages}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        products,
        categoryCounts,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock } = req.body;

    const existing = await Product.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      category,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A product named "${name}" already exists in ${category}`,
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { ...updateData } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: { id: req.params.id },
    });
  } catch (err) {
    next(err);
  }
};

export {
  getProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

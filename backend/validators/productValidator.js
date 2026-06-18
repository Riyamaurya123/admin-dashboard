const validateCreateProduct = (req, res, next) => {
  const errors = [];
  const { name, description, price, category, stock } = req.body;

  const VALID_CATEGORIES = [
    "Electronics",
    "Footwear",
    "Clothing",
    "Books",
    "Home",
  ];

  // name
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.push("Name is required");
  } else if (name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  } else if (name.trim().length > 100) {
    errors.push("Name must not exceed 100 characters");
  }

  // description
  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length === 0
  ) {
    errors.push("Description is required");
  } else if (description.trim().length < 10) {
    errors.push("Description must be at least 10 characters");
  } else if (description.trim().length > 500) {
    errors.push("Description must not exceed 500 characters");
  }

  // price
  if (price === undefined || price === null || price === "") {
    errors.push("Price is required");
  } else if (isNaN(Number(price))) {
    errors.push("Price must be a number");
  } else if (Number(price) < 0) {
    errors.push("Price must be greater than or equal to 0");
  } else if (Number(price) > 10000000) {
    errors.push("Price seems too high — max allowed is 1,00,00,000");
  }

  // category
  if (
    !category ||
    typeof category !== "string" ||
    category.trim().length === 0
  ) {
    errors.push("Category is required");
  } else if (!VALID_CATEGORIES.includes(category.trim())) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(", ")}`);
  }

  // stock
  if (stock === undefined || stock === null || stock === "") {
    errors.push("Stock is required");
  } else if (isNaN(Number(stock))) {
    errors.push("Stock must be a number");
  } else if (!Number.isInteger(Number(stock))) {
    errors.push("Stock must be a whole number");
  } else if (Number(stock) < 0) {
    errors.push("Stock must be greater than or equal to 0");
  }

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // sanitize before passing to controller
  req.body.name = name.trim();
  req.body.description = description.trim();
  req.body.price = Number(price);
  req.body.category = category.trim();
  req.body.stock = Number(stock);

  next();
};

const validateUpdateProduct = (req, res, next) => {
  const errors = [];
  const { name, description, price, category, stock } = req.body;

  const VALID_CATEGORIES = [
    "Electronics",
    "Footwear",
    "Clothing",
    "Books",
    "Home",
  ];

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      errors.push("Name cannot be empty");
    } else if (name.trim().length < 2) {
      errors.push("Name must be at least 2 characters");
    } else if (name.trim().length > 100) {
      errors.push("Name must not exceed 100 characters");
    } else {
      req.body.name = name.trim();
    }
  }

  if (description !== undefined) {
    if (typeof description !== "string" || description.trim().length === 0) {
      errors.push("Description cannot be empty");
    } else if (description.trim().length < 10) {
      errors.push("Description must be at least 10 characters");
    } else if (description.trim().length > 500) {
      errors.push("Description must not exceed 500 characters");
    } else {
      req.body.description = description.trim();
    }
  }

  if (price !== undefined) {
    if (isNaN(Number(price))) {
      errors.push("Price must be a number");
    } else if (Number(price) < 0) {
      errors.push("Price must be greater than or equal to 0");
    } else if (Number(price) > 10000000) {
      errors.push("Price seems too high — max allowed is 1,00,00,000");
    } else {
      req.body.price = Number(price);
    }
  }

  if (category !== undefined) {
    if (!VALID_CATEGORIES.includes(category.trim())) {
      errors.push(`Category must be one of: ${VALID_CATEGORIES.join(", ")}`);
    } else {
      req.body.category = category.trim();
    }
  }

  if (stock !== undefined) {
    if (isNaN(Number(stock))) {
      errors.push("Stock must be a number");
    } else if (!Number.isInteger(Number(stock))) {
      errors.push("Stock must be a whole number");
    } else if (Number(stock) < 0) {
      errors.push("Stock must be greater than or equal to 0");
    } else {
      req.body.stock = Number(stock);
    }
  }

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

export { validateCreateProduct, validateUpdateProduct };

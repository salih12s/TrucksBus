import Joi from "joi";
import { Request, Response, NextFunction } from "express";

// Password complexity requirements
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .messages({
    "string.pattern.base":
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password must not exceed 128 characters",
  });

// Email validation
const emailSchema = Joi.string().email().max(254).required().messages({
  "string.email": "Please provide a valid email address",
  "string.max": "Email must not exceed 254 characters",
});

// Phone validation (Turkish format)
const phoneSchema = Joi.string()
  .pattern(/^(\+90|0)?[5]\d{9}$/)
  .messages({
    "string.pattern.base":
      "Please provide a valid Turkish phone number (e.g., 05551234567)",
  });

// Name validation
const nameSchema = Joi.string()
  .min(2)
  .max(50)
  .pattern(/^[a-zA-ZğüşıöçĞÜŞIÖÇ\s]+$/)
  .trim()
  .messages({
    "string.pattern.base": "Name can only contain letters and spaces",
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name must not exceed 50 characters",
  });

// Company name validation
const companyNameSchema = Joi.string()
  .min(2)
  .max(200)
  .pattern(/^[a-zA-ZğüşıöçĞÜŞIÖÇ0-9\s\.\-&]+$/)
  .trim()
  .messages({
    "string.pattern.base": "Company name contains invalid characters",
    "string.min": "Company name must be at least 2 characters long",
    "string.max": "Company name must not exceed 200 characters",
  });

// Tax ID validation (Turkish format)
const taxIdSchema = Joi.string()
  .pattern(/^\d{10,11}$/)
  .messages({
    "string.pattern.base": "Tax ID must be 10 or 11 digits",
  });

// Address validation
const addressSchema = Joi.string().min(10).max(500).trim().messages({
  "string.min": "Address must be at least 10 characters long",
  "string.max": "Address must not exceed 500 characters",
});

// Validation schemas
export const authSchemas = {
  // User registration validation
  register: Joi.object({
    email: emailSchema,
    password: passwordSchema,
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),
    phone: phoneSchema.optional(),
    role: Joi.string().valid("USER", "CORPORATE").default("USER"),
    // Corporate fields
    companyName: companyNameSchema.when("role", {
      is: "CORPORATE",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    taxId: taxIdSchema.when("role", {
      is: "CORPORATE",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    tradeRegistryNo: Joi.string().optional(),
    address: addressSchema.when("role", {
      is: "CORPORATE",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    city: Joi.string().min(2).max(50).optional(),
    country: Joi.string().min(2).max(50).optional(),
  }),

  // User login validation
  login: Joi.object({
    email: emailSchema,
    password: Joi.string().required().max(128),
  }),

  // Password reset request validation
  passwordResetRequest: Joi.object({
    email: emailSchema,
  }),

  // Password reset validation
  passwordReset: Joi.object({
    token: Joi.string().required(),
    password: passwordSchema,
  }),

  // Email verification
  emailVerification: Joi.object({
    token: Joi.string().required(),
  }),

  // Profile update validation
  profileUpdate: Joi.object({
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),
    phone: phoneSchema.optional(),
    companyName: companyNameSchema.optional(),
    address: addressSchema.optional(),
    city: Joi.string().min(2).max(50).optional(),
    country: Joi.string().min(2).max(50).optional(),
  }),
};

export const adSchemas = {
  // Ad creation validation
  createAd: Joi.object({
    title: Joi.string().min(10).max(200).required().trim(),
    description: Joi.string().min(50).max(5000).required().trim(),
    price: Joi.number().positive().max(999999999).required(),
    categoryId: Joi.number().integer().positive().required(),
    brandId: Joi.number().integer().positive().required(),
    modelId: Joi.number().integer().positive().optional(),
    year: Joi.number()
      .integer()
      .min(1980)
      .max(new Date().getFullYear() + 1)
      .required(),
    mileage: Joi.number().min(0).max(9999999).optional(),
    fuelType: Joi.string()
      .valid("DIESEL", "GASOLINE", "ELECTRIC", "HYBRID", "LPG")
      .optional(),
    transmission: Joi.string()
      .valid("MANUAL", "AUTOMATIC", "SEMI_AUTOMATIC")
      .optional(),
    condition: Joi.string().valid("NEW", "USED", "DAMAGED").required(),
    location: Joi.string().min(2).max(100).required(),
    city: Joi.string().min(2).max(50).required(),
    country: Joi.string().min(2).max(50).default("Turkey"),
    images: Joi.array().items(Joi.string().uri()).max(10).optional(),
    contactPhone: phoneSchema.required(),
    contactEmail: emailSchema.optional(),
  }),

  // Ad update validation
  updateAd: Joi.object({
    title: Joi.string().min(10).max(200).optional().trim(),
    description: Joi.string().min(50).max(5000).optional().trim(),
    price: Joi.number().positive().max(999999999).optional(),
    year: Joi.number()
      .integer()
      .min(1980)
      .max(new Date().getFullYear() + 1)
      .optional(),
    mileage: Joi.number().min(0).max(9999999).optional(),
    fuelType: Joi.string()
      .valid("DIESEL", "GASOLINE", "ELECTRIC", "HYBRID", "LPG")
      .optional(),
    transmission: Joi.string()
      .valid("MANUAL", "AUTOMATIC", "SEMI_AUTOMATIC")
      .optional(),
    condition: Joi.string().valid("NEW", "USED", "DAMAGED").optional(),
    location: Joi.string().min(2).max(100).optional(),
    city: Joi.string().min(2).max(50).optional(),
    contactPhone: phoneSchema.optional(),
    contactEmail: emailSchema.optional(),
    isActive: Joi.boolean().optional(),
  }),
};

export const querySchemas = {
  // Pagination validation
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string()
      .valid("createdAt", "updatedAt", "price", "year", "mileage")
      .default("createdAt"),
    order: Joi.string().valid("asc", "desc").default("desc"),
  }),

  // Search validation
  search: Joi.object({
    q: Joi.string().min(2).max(100).optional(),
    category: Joi.number().integer().positive().optional(),
    brand: Joi.number().integer().positive().optional(),
    model: Joi.number().integer().positive().optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    minYear: Joi.number().integer().min(1980).optional(),
    maxYear: Joi.number()
      .integer()
      .max(new Date().getFullYear() + 1)
      .optional(),
    fuelType: Joi.string()
      .valid("DIESEL", "GASOLINE", "ELECTRIC", "HYBRID", "LPG")
      .optional(),
    transmission: Joi.string()
      .valid("MANUAL", "AUTOMATIC", "SEMI_AUTOMATIC")
      .optional(),
    condition: Joi.string().valid("NEW", "USED", "DAMAGED").optional(),
    city: Joi.string().min(2).max(50).optional(),
  }),
};

// Validation middleware factory
export const validate = (
  schema: Joi.ObjectSchema,
  source: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data =
      source === "body"
        ? req.body
        : source === "query"
        ? req.query
        : req.params;

    const { error, value } = schema.validate(data, {
      abortEarly: false, // Return all validation errors
      stripUnknown: true, // Remove unknown fields
      convert: true, // Convert strings to numbers where appropriate
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        value: detail.context?.value,
      }));

      res.status(400).json({
        error: "Validation failed",
        details: errorDetails,
      });
      return;
    }

    // Replace the original data with validated and sanitized data
    if (source === "body") req.body = value;
    else if (source === "query") req.query = value;
    else req.params = value;

    next();
  };
};

// Specific validation middleware
export const validateRegistration = validate(authSchemas.register);
export const validateLogin = validate(authSchemas.login);
export const validatePasswordReset = validate(authSchemas.passwordReset);
export const validatePasswordResetRequest = validate(
  authSchemas.passwordResetRequest
);
export const validateProfileUpdate = validate(authSchemas.profileUpdate);

export const validateCreateAd = validate(adSchemas.createAd);
export const validateUpdateAd = validate(adSchemas.updateAd);

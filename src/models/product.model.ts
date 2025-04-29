import { Model, Schema } from "mongoose";
import {
  ProductVariantInterface,
  ProductInterface,
} from "@/types/product.interface";

const VariantSchema = new Schema<ProductVariantInterface>({
  color: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    default: [],
  },
  specs: {
    type: Map,
    of: Schema.Types.Mixed,
  },
  stock: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  discountStart: {
    type: Date,
    default: null,
  },
  discountEnd: {
    type: Date,
    default: null,
  },
  price: {
    type: Number,
    required: true,
  },
  discountPrice: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  label: {
    type: String,
    default: "",
  },
});

const ProductSchema = new Schema<ProductInterface>(
  {
    name: {
      type: String,
      required: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    baseSpecs: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    description: {
      type: String,
      maxlength: 1000,
      required: false,
      default: "",
    },
    variants: [VariantSchema],
    seo: {
      type: String,
      required: false,
    },
    seoDescription: {
      type: String,
      required: false,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug must be URL-friendly"],
      unique: true,
    },
    path: {
      type: String,
      required: [true, "Path is required"],
      trim: true,
      match: [
        /^\/[a-z0-9-/]+$/,
        "Path must start with / and contain only lowercase letters, numbers, hyphens, and slashes",
      ],
      unique: true,
    },
  },
  {
    timestamps: true,
    virtuals: true,
  }
);

ProductSchema.pre("save", function (next) {
  if (!this.seo) {
    this.seo = `${this.name} | ${process.env.SITE_NAME || "Shop"}`;
  }

  if (!this.seoDescription && this.description) {
    this.seoDescription = this.description.substring(0, 160);
  }

  next();
});

ProductSchema.index({ path: 1, brandId: 1 });
ProductSchema.index({ slug: 1, brandId: 1 });

const Products = (
  mongoose: typeof import("mongoose")
): Model<ProductInterface> => {
  return (
    mongoose.models?.Products ||
    mongoose.model<ProductInterface>("Products", ProductSchema)
  );
};

export default Products;

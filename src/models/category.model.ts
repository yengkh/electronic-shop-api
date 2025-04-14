import { CategoryInterface } from "@/types/category.interface";
import { Model, Schema } from "mongoose";

const CategorySchema = new Schema<CategoryInterface>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug must be URL-friendly"],
      unique: true,
      index: true,
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
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Category = (
  mongoose: typeof import("mongoose")
): Model<CategoryInterface> => {
  return (
    mongoose.models?.Category ||
    mongoose.model<CategoryInterface>("Category", CategorySchema)
  );
};

export default Category;

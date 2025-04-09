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
      unique: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug must be URL-friendly"],
    },
    path: {
      type: String,
      required: [true, "Path is required"],
      unique: true,
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

CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ path: 1 }, { unique: true });

CategorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parentId",
});

const Category = (
  mongoose: typeof import("mongoose")
): Model<CategoryInterface> => {
  return (
    mongoose.models?.Category ||
    mongoose.model<CategoryInterface>("Category", CategorySchema)
  );
};

export default Category;

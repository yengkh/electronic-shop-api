import { SubcategoryInterface } from "@/types/subcategory.interface";
import mongoose, { Model, Schema, Types } from "mongoose";

const SubcategorySchema = new Schema<SubcategoryInterface>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      validate: {
        validator: async function (parentId: Types.ObjectId) {
          const category = await mongoose
            .model("Category")
            .exists({ _id: parentId });
          return !!category;
        },
        message: "Parent category does not exist",
      },
    },
    name: {
      type: String,
      required: true,
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
    image: {
      url: {
        type: String,
        required: true,
      },
      altText: {
        type: String,
        default: "",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      required: false,
      default: "",
    },
    seoTitle: {
      type: String,
      maxlength: 60,
    },
    seoDescription: {
      type: String,
      maxlength: 160,
    },
    //   createdBy: {
    //     type: Schema.Types.ObjectId,
    //     ref: "User",
    //     required: true,
    //   },
    //   updatedBy: {
    //     type: Schema.Types.ObjectId,
    //     ref: "User",
    //   },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// SubcategorySchema.pre<SubcategoryInterface>("save", function (next) {
//   if (!this.seoTitle) {
//     this.seoTitle = `${this.name} | ${
//       process.env.SITE_NAME || "Electron Shop"
//     }`.substring(0, 60);
//   }

//   if (!this.seoDescription) {
//     const baseText = `Find the best ${this.name} products`;
//     const descText = this.description
//       ? `: ${this.description.substring(0, 100)}`
//       : "";
//     this.seoDescription = `${baseText}${descText}`.substring(0, 160);
//   }
//   next();
// });

SubcategorySchema.index({ path: 1, categoryId: 1 });
SubcategorySchema.index({ slug: 1, categoryId: 1 });
SubcategorySchema.index({ isActive: 1, featured: 1, displayOrder: 1 });

const Subcategory = (
  mongoose: typeof import("mongoose")
): Model<SubcategoryInterface> => {
  return (
    mongoose.models?.Subcategory ||
    mongoose.model<SubcategoryInterface>("Subcategory", SubcategorySchema)
  );
};

export default Subcategory;

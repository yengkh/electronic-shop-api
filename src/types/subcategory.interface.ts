import mongoose, { Document } from "mongoose";

export interface SubcategoryInterface extends Document {
  name: string;
  slug: string;
  path: string;
  image: {
    url: string;
    altText?: string;
    caption?: string;
  };
  isActive: boolean;
  description?: string;
  categoryId: mongoose.Types.ObjectId;
  seoTitle?: string;
  seoDescription?: string;
  featured: boolean;
  displayOrder: number;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

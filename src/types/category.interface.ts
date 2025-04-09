import { Types, Document } from "mongoose";

export interface CategoryInterface extends Document {
  name: string;
  slug: string;
  path: string;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

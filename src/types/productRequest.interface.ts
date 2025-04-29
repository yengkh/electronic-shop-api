import { Types } from "mongoose";

export interface ProductRequestBody {
  color: string;
  specs: Record<string, any>;
  stock: number;
  discount: number;
  price: number;
  isActive: boolean;
  label?: string;
  name: string;
  brandId: Types.ObjectId;
  categoryId: Types.ObjectId;
  baseSpecs?: Record<string, any>;
  description: string;
  discountStart: Date;
  discountEnd: Date;
  images?: string;
}

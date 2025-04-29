import { Types } from "mongoose";

export interface ProductVariantInterface {
  color: string;
  images: string[];
  specs: Record<string, any>;
  stock: number;
  price: number;
  isActive?: boolean;
  discount: number;
  discountPrice?: number;
  label?: string;
  _id?: string;
  discountStart?: Date;
  discountEnd?: Date;
}

export interface ProductInterface {
  name: string;
  brandId: Types.ObjectId;
  categoryId: Types.ObjectId;
  baseSpecs?: Record<string, any>;
  description?: string;
  variants?: ProductVariantInterface[];
  seo?: string;
  seoDescription?: string;
  slug?: string;
  path?: string;
}

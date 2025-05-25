import "express";

declare module "express" {
  export interface Request {
    user?: {
      _id: string;
      role: "admin" | "customer";
      phone: string;
    };
  }
}

import { Router } from "express";
export interface Route {
  path: string;
  route: Router;
}

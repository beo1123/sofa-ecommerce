// =========================================================
// apps/api/src/routes/products.ts
// Product routes: GET /products, GET /products/:slug
// =========================================================

import { Hono } from "hono";
import { listProducts, getProduct } from "../controllers/products.controller.js";

export const productsRouter = new Hono();

productsRouter.get("/", listProducts);
productsRouter.get("/:slug", getProduct);

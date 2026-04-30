import { Hono } from "hono";
import { authService } from "../services/auth.service.js";
import { ok, normalizeError } from "../lib/response.js";

export const authRouter = new Hono();

authRouter.post("/signup", async (c) => {
  try {
    const payload = await c.req.json();
    const user = await authService.signup(payload);
    return c.json(ok(user), 201);
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

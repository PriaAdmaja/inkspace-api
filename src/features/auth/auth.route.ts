import { Hono } from "hono";

const authRoutes = new Hono();

authRoutes.get('/')

export default authRoutes;
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { Utils } from "./utils";
import { UserController } from "./controllers/user.controller";
import { PrismaClient } from "@prisma/client";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import client from "prom-client";
import {
  getMetrics,
  logger,
  metricsMiddleware,
} from "./controllers/metric.controller";
import { ProductController } from "./controllers/products.controller";
import { CommentsController } from "./controllers/comments.controller";
import { authenticateToken } from "./middleware/auth.middleware";

const app = express();
const register = new client.Registry();
dotenv.config();

const prisma = new PrismaClient();
const utils = new Utils();
const userController = new UserController(prisma, utils);
const productController = new ProductController(prisma);
const commentsController = new CommentsController(prisma);

app.use(
  cors({
    origin: `${process.env.API_BASE_URL}`,
    credentials: true,
  }),
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }),
  cookieParser(),
  metricsMiddleware
);
app.use(express.json());

app.post("/api/signup", async (req, res) => {
  await userController.createUser(req, res);
});

app.post("/api/login", async (req, res) => {
  await userController.login(req, res);
});

app.get("/", (req, res) => {
  res.send("Welcome to the REST API!");
});

app.get("/api/user/:id", (req, res) => {
  res.send("Users endpoint is under construction.");
});
app.get("/api/products/", async (req, res) => {
  await productController.getAllProducts(req, res);
});

app.get("/api/products/:id/", async (req, res) => {
  await productController.getProductById(req, res);
});

app.post("/api/product/", authenticateToken, async (req, res) => {
  await productController.createProduct(req, res);
});

app.get("/api/comments", async (req, res) => {
  await commentsController.getAllComments(req, res);
});

app.get("/api/comments/:id", async (req, res) => {
  await commentsController.getCommentById(req, res);
});

app.post("/api/comment", authenticateToken, async (req, res) => {
  await commentsController.createComment(req, res);
});

app.put("/api/comment/:id", authenticateToken, async (req, res) => {
  await commentsController.updateComment(req, res);
});

app.delete("/api/comment/:id", authenticateToken, async (req, res) => {
  await commentsController.deleteComment(req, res);
});

app.get("/api/simulate-error", (req, res) => {
  logger.error("Erreur simulée");
  res.status(500).send("Erreur interne simulée");
});

// ========== ROUTE DES MÉTRIQUES ==========

app.get("/api/metrics", getMetrics);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  logger.info(`REST API server ready at: http://localhost:${PORT}`)
);

export default app;
module.exports = app;

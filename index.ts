import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { Utils } from "./utils";
import { UserController } from "./controllers/user.controller";
import { PrismaClient } from "@prisma/client";

const app = express();
dotenv.config();

const prisma = new PrismaClient();
const utils = new Utils();
const userController = new UserController(prisma, utils);

app.use(
  cors({
    origin: `${process.env.API_BASE_URL}`,
    credentials: true,
  })
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

app.get(/user\/:id/, (req, res) => {
  res.send("Users endpoint is under construction.");
});

app.get(/products/, (req, res) => {
  res.send("Products endpoint is under construction.");
});

app.get(/products\/:id/, (req, res) => {
  const { id } = req.params;
  res.send(`Product with ID ${id} is under construction.`);
});

app.post("/product/", (req, res) => {
  const product = req.body;
  res.status(201).send(`Product created: ${JSON.stringify(product)}`);
});

app.get(/comments/, (req, res) => {
  res.send("Products endpoint is under construction.");
});

app.get(/comments\/:id/, (req, res) => {
  const { id } = req.params;
  res.send(`Product with ID ${id} is under construction.`);
});

app.post("/comment/", (req, res) => {
  const product = req.body;
  res.status(201).send(`Comments created: ${JSON.stringify(product)}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`REST API server ready at: http://localhost:${PORT}`)
);

export default app;
module.exports = app;

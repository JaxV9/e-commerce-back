import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import {Utils} from "./utils";
import {UserController} from "./controllers/user.controller";
import {PrismaClient} from "@prisma/client";
import * as os from "os";
import winston from "winston";
import morgan from 'morgan'
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();

const prisma = new PrismaClient();
const utils = new Utils();
const userController = new UserController(prisma, utils);

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({filename: 'errors.log', level: 'error'}),
  ],
})

app.use(
    cors({
      origin: `${process.env.API_BASE_URL}`,
      credentials: true,
    }),
    morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim()),
      },}),
    cookieParser()
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

app.get("/api/products", (req, res) => {
  res.send("Products endpoint is under construction.");
});

app.get("/api/products/:id", (req, res) => {
  const {id} = req.params;
  res.send(`Product with ID ${id} is under construction.`);
});

app.post("/api/product", (req, res) => {
  const product = req.body;
  res.status(201).send(`Product created: ${JSON.stringify(product)}`);
});

app.get("/api/comments", (req, res) => {
  res.send("Products endpoint is under construction.");
});

app.get("/api/comments/:id", (req, res) => {
  const {id} = req.params;
  res.send(`Product with ID ${id} is under construction.`);
});

app.post("/api/comment", (req, res) => {
  const product = req.body;
  res.status(201).send(`Comments created: ${JSON.stringify(product)}`);
});

app.get('/api/simulate-error', (req, res) => {
  logger.error('Erreur simulée')
  res.status(500).send('Erreur interne simulée')
})

// ========== ROUTE DES MÉTRIQUES ==========

app.get('/api/metrics', async (req, res) => {
  // CPU / RAM
  const cpus = os.cpus()
  const cpuLoad =
      cpus.reduce((acc, cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0)
        return acc + (cpu.times.user + cpu.times.sys) / total
      }, 0) / cpus.length

  cpuGauge.set(cpuLoad * 100)

  const totalMem = os.totalmem()
  const usedMem = totalMem - os.freemem()
  ramGauge.set((usedMem / totalMem) * 100)

  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`REST API server ready at: http://localhost:${PORT}`)
);

export default app;
module.exports = app;

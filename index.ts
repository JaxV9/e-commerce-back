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
import client from 'prom-client'

const app = express();
const register = new client.Registry()
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

// ========== MÉTRIQUES ==========

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes',
  labelNames: ['method', 'route', 'status_code'],
})

const errorCounter = new client.Counter({
  name: 'http_errors_total',
  help: 'Nombre total d’erreurs (code >= 400)',
  labelNames: ['method', 'route', 'status_code'],
})

const latencyHistogram = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes en secondes',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5],
})

const cpuGauge = new client.Gauge({
  name: 'cpu_usage_percent',
  help: 'Utilisation CPU (%)',
})

const ramGauge = new client.Gauge({
  name: 'ram_usage_percent',
  help: 'Utilisation RAM (%)',
})

register.registerMetric(httpRequestCounter)
register.registerMetric(errorCounter)
register.registerMetric(latencyHistogram)
register.registerMetric(cpuGauge)
register.registerMetric(ramGauge)

// ========== MIDDLEWARE DE MÉTRIQUES ==========

app.use((req, res, next) => {
  const end = latencyHistogram.startTimer()
  res.on('finish', () => {
    const labels = {
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode.toString(),
    }

    httpRequestCounter.inc(labels)
    if (res.statusCode >= 400) errorCounter.inc(labels)

    end(labels)
  })
  next()
})

app.post("/api/signup", async (req, res) => {
  await userController.createUser(req, res);
});

app.post("/api/login", async (req, res) => {
  await userController.login(req, res);
});

app.get("/", (req, res) => {
  res.send("Welcome to the REST API!");
});

app.get("/user/:id", (req, res) => {
  res.send("Users endpoint is under construction.");
});

app.get("/products", (req, res) => {
  res.send("Products endpoint is under construction.");
});

app.get(/products\/:id/, (req, res) => {
  const {id} = req.params;
  res.send(`Product with ID ${id} is under construction.`);
});

app.post("/product", (req, res) => {
  const product = req.body;
  res.status(201).send(`Product created: ${JSON.stringify(product)}`);
});

app.get("/comments", (req, res) => {
  res.send("Products endpoint is under construction.");
});

app.get("/comments/:id", (req, res) => {
  const {id} = req.params;
  res.send(`Product with ID ${id} is under construction.`);
});

app.post("/comment", (req, res) => {
  const product = req.body;
  res.status(201).send(`Comments created: ${JSON.stringify(product)}`);
});

app.get('/simulate-error', (req, res) => {
  logger.error('Erreur simulée')
  res.status(500).send('Erreur interne simulée')
})

// ========== ROUTE DES MÉTRIQUES ==========

app.get('/metrics', async (req, res) => {
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

import { Request, Response } from 'express'
import client from 'prom-client'
import os from 'os'
import winston from "winston";

// Crée un registre Prometheus
const register = new client.Registry()

// Compteur de requêtes HTTP
const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Nombre total de requêtes',
    labelNames: ['method', 'route', 'status_code'],
})

// Compteur d'erreurs HTTP
const errorCounter = new client.Counter({
    name: 'http_errors_total',
    help: 'Nombre total d’erreurs (code >= 400)',
    labelNames: ['method', 'route', 'status_code'],
})

// Histogramme de latence des requêtes
const latencyHistogram = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Durée des requêtes en secondes',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5],
})

// Jauges CPU et RAM
const cpuGauge = new client.Gauge({
    name: 'cpu_usage_percent',
    help: 'Utilisation CPU (%)',
})

const ramGauge = new client.Gauge({
    name: 'ram_usage_percent',
    help: 'Utilisation RAM (%)',
})

// Enregistre les métriques dans le registre
register.registerMetric(httpRequestCounter)
register.registerMetric(errorCounter)
register.registerMetric(latencyHistogram)
register.registerMetric(cpuGauge)
register.registerMetric(ramGauge)

// Middleware Express pour exposer les métriques
export const getMetrics = async (_req: Request, res: Response) => {
    // Mets à jour les métriques système à chaque appel
    updateSystemMetrics()
    res.setHeader('Content-Type', register.contentType)
    res.end(await register.metrics())
}

// Met à jour les métriques CPU et RAM
export const updateSystemMetrics = () => {
    const cpus = os.cpus()
    const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0)
    const totalTick = cpus.reduce((acc, cpu) =>
        acc + Object.values(cpu.times).reduce((a, b) => a + b, 0), 0)

    const idle = totalIdle / cpus.length
    const total = totalTick / cpus.length
    const usage = 100 - (idle / total) * 100

    const usedMem = os.totalmem() - os.freemem()
    const ramUsage = (usedMem / os.totalmem()) * 100

    cpuGauge.set(usage)
    ramGauge.set(ramUsage)
}

// Middleware à insérer autour des routes si tu veux tracer dynamiquement les requêtes :
export const metricsMiddleware = (req: Request, res: Response, next: () => void) => {
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
}

export const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({filename: 'errors.log', level: 'error'}),
    ],
})

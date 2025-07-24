import request from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'
import { ProductController } from '../controllers/products.controller'
import { authenticateToken } from '../middleware/auth.middleware'
import {beforeEach, describe, expect, jest, test} from "@jest/globals";

jest.mock('../middleware/auth.middleware')

const mockPrisma = {
    product: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
    }
}

const productController = new ProductController(mockPrisma as any)

const app = express()
app.use(bodyParser.json())

;(authenticateToken as jest.Mock).mockImplementation((_req, _res, next) => {
    (_req as any).user = { userId: 'mock-user-id' }
    next()
})

app.get('/api/products/', (req, res) => productController.getAllProducts(req, res))
app.get('/api/products/:id/', (req, res) => productController.getProductById(req, res))
app.post('/api/product/', authenticateToken, (req, res) => productController.createProduct(req, res))

describe('ProductController', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('GET /api/products/ - should return products list', async () => {
        const mockProducts = [{ id: '1', title: 'Product 1' }]
        mockPrisma.product.findMany.mockResolvedValue(mockProducts)

        const res = await request(app).get('/api/products/')

        expect(res.status).toBe(200)
        expect(res.body).toEqual(mockProducts)
        expect(mockPrisma.product.findMany).toHaveBeenCalled()
    })

    test('GET /api/products/:id/ - returns product if found', async () => {
        const mockProduct = { id: '123', title: 'Product 123' }
        mockPrisma.product.findUnique.mockResolvedValue(mockProduct)

        const res = await request(app).get('/api/products/123/')

        expect(res.status).toBe(200)
        expect(res.body).toEqual(mockProduct)
        expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
            where: { id: '123' },
            include: { user: { select: { name: true, email: true } }, comments: true }
        })
    })

    test('GET /api/products/:id/ - returns 404 if not found', async () => {
        mockPrisma.product.findUnique.mockResolvedValue(null)

        const res = await request(app).get('/api/products/999/')

        expect(res.status).toBe(404)
    })

    test('POST /api/product/ - creates product if data valid', async () => {
        const productData = {
            title: 'New Product',
            description: 'Test desc',
            imageUrl: 'https://image.url',
        }

        const createdProduct = { ...productData, id: 'p1' }
        mockPrisma.product.create.mockResolvedValue(createdProduct)

        const res = await request(app)
            .post('/api/product/')
            .send(productData)

        expect(res.status).toBe(201)
        expect(res.body).toEqual(createdProduct)
        expect(mockPrisma.product.create).toHaveBeenCalledWith({
            data: {
                ...productData,
                userId: 'mock-user-id',
            },
        })
    })

    test('POST /api/product/ - returns 400 on missing fields', async () => {
        const res = await request(app)
            .post('/api/product/')
            .send({ title: 'Incomplete' })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Missing required fields')
    })

    test('POST /api/product/ - returns 500 on Prisma error', async () => {
        mockPrisma.product.create.mockRejectedValue(new Error('DB error'))

        const res = await request(app)
            .post('/api/product/')
            .send({
                title: 'ErrorProduct',
                description: 'x',
                imageUrl: 'x',
            })

        expect(res.status).toBe(500)
        expect(res.body.error).toBe('Could not create product')
    })
})

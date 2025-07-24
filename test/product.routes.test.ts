
import { ProductController } from '../controllers/products.controller'
import {beforeEach, describe, expect, jest, test} from "@jest/globals";

import { Request, Response } from "express";

// Mock des fonctions Prisma
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();

const mockPrisma = {
    product: {
        findMany: mockFindMany,
        findUnique: mockFindUnique,
        create: mockCreate,
    },
} as any; // <-- le as any évite les erreurs TS2345/TS18046

const controller = new ProductController(mockPrisma);

// Mock de la response
const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    sendStatus: jest.fn(),
} as unknown as Response;

beforeEach(() => {
    jest.clearAllMocks();
});

describe("ProductController", () => {
    test("getAllProducts - success", async () => {
        const fakeProducts = [{ id: "1", title: "Test Product" }];
        mockFindMany.mockImplementation(() => Promise.resolve(fakeProducts));

        await controller.getAllProducts({} as Request, res);

        expect(mockFindMany).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fakeProducts);
    });

    test("getProductById - found", async () => {
        const fakeProduct = { id: "1", title: "Test Product" };
        mockFindUnique.mockImplementation(() => Promise.resolve(fakeProduct));

        const req = { params: { id: "1" } } as unknown as Request;

        await controller.getProductById(req, res);

        expect(mockFindUnique).toHaveBeenCalledWith({
            where: { id: "1" },
            include: {
                user: { select: { name: true, email: true } },
                comments: true,
            },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fakeProduct);
    });

    test("getProductById - not found", async () => {
        mockFindUnique.mockImplementation(() => Promise.resolve(null));

        const req = { params: { id: "123" } } as unknown as Request;

        await controller.getProductById(req, res);

        expect(res.sendStatus).toHaveBeenCalledWith(404);
    });

    test("createProduct - success", async () => {
        const newProduct = {
            id: "1",
            title: "New Product",
            description: "Description",
            imageUrl: "image.png",
        };
        mockCreate.mockImplementation(() => Promise.resolve(newProduct));

        const req = {
            body: {
                title: "New Product",
                description: "Description",
                imageUrl: "image.png",
            },
            user: { userId: "user-123" },
        } as any;

        await controller.createProduct(req, res);

        expect(mockCreate).toHaveBeenCalledWith({
            data: {
                title: "New Product",
                description: "Description",
                imageUrl: "image.png",
                userId: "user-123",
            },
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(newProduct);
    });

    test("createProduct - missing fields", async () => {
        const req = {
            body: { title: "", description: "", imageUrl: "" },
            user: { userId: "user-123" },
        } as any;

        await controller.createProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Missing required fields" });
    });

    test("createProduct - internal error", async () => {
        mockCreate.mockImplementation(() => {
            throw new Error("DB error");
        });

        const req = {
            body: {
                title: "A",
                description: "B",
                imageUrl: "C",
            },
            user: { userId: "user-123" },
        } as any;

        await controller.createProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Could not create product" });
    });
});

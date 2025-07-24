import { CommentsController } from "../controllers/comments.controller";
import { Request, Response } from "express";
import {beforeEach, describe, expect, jest, test} from "@jest/globals";

describe("CommentsController", () => {
    const mockFindMany = jest.fn();
    const mockFindUnique = jest.fn();
    const mockCreate = jest.fn();
    const mockUpdate = jest.fn();
    const mockDelete = jest.fn();

    const mockPrisma = {
        comment: {
            findMany: mockFindMany,
            findUnique: mockFindUnique,
            create: mockCreate,
            update: mockUpdate,
            delete: mockDelete,
        },
    } as any;

    const controller = new CommentsController(mockPrisma);

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        sendStatus: jest.fn(),
        send: jest.fn(),
    } as unknown as Response;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("getAllComments - success", async () => {
        mockFindMany.mockImplementation(() => Promise.resolve([{ id: "1", content: "Hello" }]));

        await controller.getAllComments({ query: {} } as Request, res);

        expect(mockFindMany).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([{ id: "1", content: "Hello" }]);
    });

    test("getCommentById - found", async () => {
        mockFindUnique.mockImplementation(() => Promise.resolve({ id: "1", content: "Hi" }));

        const req = { params: { id: "1" } } as unknown as Request;
        await controller.getCommentById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ id: "1", content: "Hi" });
    });

    test("getCommentById - not found", async () => {
        mockFindUnique.mockImplementation(() => Promise.resolve(null));

        const req = { params: { id: "unknown" } } as unknown as Request;
        await controller.getCommentById(req, res);

        expect(res.sendStatus).toHaveBeenCalledWith(404);
    });

    test("createComment - missing fields", async () => {
        const req = {
            body: {},
            user: { userId: "1" },
        } as any;

        await controller.createComment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Missing required fields" });
    });

    test("createComment - success", async () => {
        mockCreate.mockImplementation(() => Promise.resolve({ id: "1", content: "test" }));

        const req = {
            body: { content: "test", productId: "prod" },
            user: { userId: "1" },
        } as any;

        await controller.createComment(req, res);

        expect(mockCreate).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ id: "1", content: "test" });
    });

    test("updateComment - success", async () => {
        mockFindUnique.mockImplementation(() => Promise.resolve({ id: "1", userId: "1" }));
        mockUpdate.mockImplementation(() => Promise.resolve({ id: "1", content: "updated" }));

        const req = {
            params: { id: "1" },
            body: { content: "updated" },
            user: { userId: "1" },
        } as any;

        await controller.updateComment(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ id: "1", content: "updated" });
    });

    test("updateComment - forbidden", async () => {
        mockFindUnique.mockImplementation(() => Promise.resolve({ id: "1", userId: "other" }));

        const req = {
            params: { id: "1" },
            body: { content: "forbidden" },
            user: { userId: "1" },
        } as any;

        await controller.updateComment(req, res);

        expect(res.sendStatus).toHaveBeenCalledWith(403);
    });

    test("deleteComment - not found", async () => {
        mockFindUnique.mockImplementation(() => Promise.resolve(null));

        const req = { params: { id: "1" }, user: { userId: "1" } } as any;
        await controller.deleteComment(req, res);

        expect(res.sendStatus).toHaveBeenCalledWith(404);
    });

    test("deleteComment - forbidden", async () => {
        mockFindUnique.mockImplementation(() => Promise.resolve({ id: "1", userId: "other" }));

        const req = { params: { id: "1" }, user: { userId: "1" } } as any;
        await controller.deleteComment(req, res);

        expect(res.sendStatus).toHaveBeenCalledWith(403);
    });

    test("deleteComment - success", async () => {
        mockFindUnique.mockImplementation(() => Promise.resolve({ id: "1", userId: "1" }));
        mockDelete.mockImplementation(() => Promise.resolve());

        const req = { params: { id: "1" }, user: { userId: "1" } } as any;
        await controller.deleteComment(req, res);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });
});

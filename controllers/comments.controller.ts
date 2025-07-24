import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";

export class CommentsController {
  constructor(private prisma: PrismaClient) {}

  async getAllComments(req: Request, res: Response) {
    const productId = req.query.productId as string | undefined;

    const comments = await this.prisma.comment.findMany({
      where: productId ? { productId } : undefined,
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { title: true } },
      },
    });

    res.status(200).json(comments);
  }

  async getCommentById(req: Request, res: Response) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { title: true } },
      },
    });

    if (!comment) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json(comment);
  }

  async createComment(req: AuthRequest, res: Response) {
    const { productId, content } = req.body;

    if (!productId || !content) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    try {
      const newComment = await this.prisma.comment.create({
        data: {
          content,
          productId,
          userId: req.user!.userId,
        },
      });

      res.status(201).json(newComment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create comment" });
    }
  }

  async updateComment(req: AuthRequest, res: Response) {
    const { content } = req.body;
    const { id } = req.params;

    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      res.sendStatus(404);
      return;
    }

    if (comment.userId !== req.user!.userId) {
      res.sendStatus(403);
      return;
    }

    try {
      const updated = await this.prisma.comment.update({
        where: { id },
        data: { content },
      });
      res.status(200).json(updated);
    } catch {
      res.status(500).json({ error: "Failed to update comment" });
    }
  }

  async deleteComment(req: AuthRequest, res: Response) {
    const { id } = req.params;

    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      res.sendStatus(404);
      return;
    }

    if (comment.userId !== req.user!.userId) {
      res.sendStatus(403);
      return;
    }

    try {
      await this.prisma.comment.delete({ where: { id } });
      res.status(204).send();
    } catch {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  }
}

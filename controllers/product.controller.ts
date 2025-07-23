import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

export class ProductController {
  constructor(private prisma: PrismaClient) {}

  async getAllProducts(_req: Request, res: Response) {
    const products = await this.prisma.product.findMany({
      include: {
        user: { select: { name: true, email: true } },
        comments: true,
      },
    });
    res.status(200).json(products);
  }

  async getProductById(string: string, res: Response) {
    const  id  = string;
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        comments: true,
      },
    });

    if (!product) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json(product);
  }

  async createProduct(req: Request, res: Response) {

    const token = req.headers["authorization"]?.split(" ")[1];
    const tokenFind = await this.prisma.token.findUnique({
        where: { id: token },
        include: { user: { select: { id: true } } },
    });

    const userId = tokenFind?.userId;

    const { title, description, imageUrl } = req.body;

    if (!title || !description || !imageUrl) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    try {
      const product = await this.prisma.product.create({
        data: {
          title,
          description,
          imageUrl,
          user: {
            connect: { id: userId },
          },
        },
      });

      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: "Could not create product" });
    }
  }
}

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ProductCreate, Product, CommentCreate, Comment } from "../models";

export class ProductController {
  constructor(private prisma: PrismaClient) {}

  async getAllProducts(_req: Request, res: Response) {
    const rawProducts  = await this.prisma.product.findMany({
      include: {
        user: { select: { name: true, email: true } },
        comments: true,
      },
    });

    const products: Product[] = rawProducts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    user: {
      name: p.user.name,
      email: p.user.email,
    },
    comments: p.comments.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      user: {
        name: "",
        email: "",
      },
    })),
  }));

    res.status(200).json(products);
  }

  async getProductById(string: string, res: Response) {
    const  id  = string;
    const rawProduct = await this.prisma.product.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        comments: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!rawProduct) {
      res.sendStatus(404);
      return;
    }

    const product: Product = {
      ...rawProduct,
      createdAt: rawProduct.createdAt.toISOString(),
      updatedAt: rawProduct.updatedAt.toISOString(),
      user: {
        name: rawProduct.user.name,
        email: rawProduct.user.email,
      },
      comments: rawProduct.comments.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        user: {
          name: c.user.name,
          email: c.user.email,
        },
      })),
    };

    res.status(200).json(product);
  }

  async createProduct(req: Request<{}, {}, ProductCreate>, res: Response) {

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
     const created = await this.prisma.product.create({
      data: {
        title,
        description,
        imageUrl,
        user: { connect: { id: userId } },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        comments: true,
      },
    });

    const product: Product = {
      ...created,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
      user: {
        name: created.user.name,
        email: created.user.email,
      },
      comments: [],
    };

    res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: "Could not create product" });
    }
  }
}

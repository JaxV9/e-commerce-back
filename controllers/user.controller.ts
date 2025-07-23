import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { Utils } from "../utils";
import { Login, Signup } from "../models";

export class UserController {
  constructor(private prisma: PrismaClient, private utils: Utils) {}

  async createUserSession(userId: string) {
    const token = this.utils.generateToken();
    const now = new Date();
    const expireAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await this.prisma.token.create({
      data: {
        id: token,
        expireAt: expireAt,
        userId: userId,
      },
    });
    return token;
  }

  async deleteUserSession(userId: string): Promise<void> {
    await this.prisma.token.delete({
      where: { userId: userId },
    });
  }

  async createUser(req: Request<{}, {}, Signup>, res: Response) {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      res.status(403).json();
      return;
    }

    const alreadyExists = await this.prisma.user.findUnique({
      where: { email },
    });
    if (alreadyExists) {
      res.status(403).json();
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    const currentUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!currentUser) {
      res.sendStatus(500);
      return;
    }

    const token = await this.createUserSession(currentUser.id);
    res.setHeader("Set-Cookie", `token=${token}; Max-Age=3600`);
    res.status(201).json();
    return;
  }

  async login(req: Request<{}, {}, Login>, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      res.sendStatus(403);
      return;
    }
    const currentUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!currentUser) {
      res.sendStatus(404);
      return;
    }
    const passwordIsValid = await bcrypt.compare(
      password,
      currentUser.password
    );
    if (!passwordIsValid) {
      res.sendStatus(403);
      return;
    }
    const userHasToken = await this.prisma.token.findUnique({
      where: { userId: currentUser.id },
    });
    if (userHasToken) {
      await this.deleteUserSession(currentUser.id);
    }

    const token = this.utils.generateToken();
    res.setHeader("Set-Cookie", `token=${token}; Max-Age=3600`);
    res.status(200).json({
      userName: currentUser.name,
      email: currentUser.email,
    });
    return;
  }
}

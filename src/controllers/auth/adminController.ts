import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../../app";
import { Request, Response } from "express";

interface LoginRequestBody {
  username: string;
  password: string;
}

interface JwtPayload {
  id: string;
  role: string;
}

// Admin Login Logic
export const adminLogin = async (req: any, res: any) => {
  const { username, password }: LoginRequestBody = req.body;

  try {
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, role: "ADMIN" } as JwtPayload,
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    });

    res.json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const checkAdmin = async (req: Request, res: Response):Promise<void> => {
  const token = req.cookies.accessToken;

  if (!token) {
     res.status(401).json({ error: "Access token required" });
     return
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Check if the role is ADMIN
    if (decoded.role !== "ADMIN") {
       res
        .status(403)
        .json({ error: "Forbidden: You do not have admin privileges" });
        return
    }

    res
      .status(200)
      .json({ message: "Admin verified successfully", adminId: decoded.id });
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

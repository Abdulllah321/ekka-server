import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { prisma } from "../../app";
import { UserRole, VerificationStatus } from "@prisma/client";

// Utility function to send email
export const sendEmail = async (to: string, subject: string, text: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Change to your email provider
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your email password or app password
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
};

// Register new user
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password, firstName, lastName, phoneNumber } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      role: UserRole.customer, // Default to customer role
    },
  });

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" } // Token expiration (1 hour in this case)
  );

  // Set the token in the cookie
  res.cookie("accessToken", token, {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === "production", // Set to true in production for HTTPS
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  });

  res.status(201).json({ message: "User registered successfully", user });
};

// Login user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Find the user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  // Compare the password with the hashed password in the database
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  // Create JWT token with 30 days expiration
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "30d" } // Token expiration set to 30 days
  );

  // Set the token in the cookie
  res.cookie("accessToken", token, {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === "production", // Set to true in production for HTTPS
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  });

  res.status(200).json({ message: "Login successful" });
};

// Request password reset via OTP
export const requestPasswordReset = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  // Find the user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  // Generate OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date();
  otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP expires in 10 minutes

  // Save OTP and expiry to the user's record
  await prisma.user.update({
    where: { email },
    data: { otpCode, otpExpiry },
  });

  // Send OTP via email
  await sendEmail(
    email,
    "OTP for Password Reset",
    `Your OTP code is: ${otpCode}`
  );

  res.status(200).json({ message: "OTP sent to your email" });
};

// Reset password using OTP
export const resetPasswordWithOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, newPassword } = req.body;

  // Find the user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the user's password
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword, otpCode: null, otpExpiry: null },
  });

  res.status(200).json({ message: "Password reset successful" });
};

export const logoutUser = (req: Request, res: Response): void => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({ message: "Logout successful" });
};

export const checkUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated." });
      return;
    }

    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
        id: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Return the user data
    res.status(200).json({
      id: user.id,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { otpCode: true, otpExpiry: true },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (new Date() > user.otpExpiry!) {
      res.status(400).json({ message: "OTP expired" });
      return;
    }

    console.log("Otp code" + user.otpCode);
    console.log("Otp " + otp);

    if (user.otpCode !== otp) {
      res.status(400).json({ message: "Invalid OTP." });
      return;
    }

    // Reset the OTP and otpExpiry fields
    await prisma.user.update({
      where: { email },
      data: { otpCode: null, otpExpiry: null },
    });

    res.status(200).json({ message: "OTP verified successfully." });
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "An error occurred while verifying OTP." });
  }
};

export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const { id } = req.user as { id: string };

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      res.status(400).json({ message: "Current password is incorrect." });
      return;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedNewPassword },
    });

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error: any) {
    console.error("Error changing password:", error);
    res
      .status(500)
      .json({ message: "An error occurred while changing password." });
  }
};

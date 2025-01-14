import { Request, Response } from "express";
import generateOtp from "../services/genrateOtp";
import { transporter } from "../services/emailTransporter";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import winston from "winston";
import { prisma } from "../app";
import { verifyOtpTemplate } from "../services/vendorVerificationEmailTemplate";
import { io } from "../server";

// Logger setup
const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

// Rate limiter for OTP requests (limit to 5 requests per 15 minutes)
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 5 requests per windowMs
  message: "Too many OTP requests from this IP, please try again later.",
});

export const verifyPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.user as { id: string };
  const { password } = req.body;

  try {
    const userWithEmail = await prisma.user.findUnique({
      where: { id },
      select: { email: true, password: true },
    });

    if (!userWithEmail) {
      io.emit("statusUpdate", "User not found");
      res.status(404).json({ message: "User not found" });
      return;
    }

    const email = userWithEmail.email;

    const isPasswordValid = await bcrypt.compare(
      password,
      userWithEmail.password
    );

    if (!isPasswordValid) {
      io.emit("statusUpdate", `Invalid password for user: ${email}`);
      res.status(400).json({ message: "Invalid password" });
      return;
    }

    io.emit("statusUpdate", `Password verified for user: ${email}`);
    const newReq = { ...req, body: { email } } as Request;
    await sendOtp(newReq, res); // Assuming sendOtp sends an OTP to the user
  } catch (error: any) {
    io.emit("statusUpdate", `Error verifying password: ${error.message}`);
    res.status(500).json({ message: "Error verifying password" });
  }
};

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      logger.error(`User not found: ${email}`);
      res.status(404).json({ message: "User not found" });
      return;
    }

    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // OTP valid for 15 minutes

    // Hash OTP before storing
    const hashedOtp = await bcrypt.hash(otpCode, 10);

    await prisma.user.update({
      where: { email },
      data: { otpCode: hashedOtp, otpExpiry },
    });

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Vendor Verification OTP",
      html: verifyOtpTemplate(otpCode),
    };

    await transporter.sendMail(mailOptions);

    logger.info(`OTP sent to: ${email}`);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error: any) {
    logger.error(`Error sending OTP: ${error?.message}`);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { email, otpCode } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      logger.error(`User not found for OTP verification: ${email}`);
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Compare the provided OTP with the hashed OTP in the database
    const isOtpValid = await bcrypt.compare(otpCode, user.otpCode || "");

    if (!isOtpValid) {
      logger.warn(`Invalid OTP attempt for user: ${email}`);
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    if (new Date() > user.otpExpiry!) {
      logger.warn(`Expired OTP for user: ${email}`);
      res.status(400).json({ message: "OTP expired" });
      return;
    }

    // Update verification status
    await prisma.user.update({
      where: { email },
      data: {
        verificationStatus: "verified",
        otpCode: null,
        otpExpiry: null,
        role: "vendor",
      },
    });

    logger.info(`Vendor verified successfully: ${email}`);
    res.status(200).json({ message: "Vendor verified successfully" });
  } catch (error: any) {
    logger.error(`Error verifying OTP: ${error.message}`);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

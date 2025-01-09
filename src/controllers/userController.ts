import { Request, Response } from "express";
import { prisma } from "../app";

export const getUserDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req?.user?.id; // Assuming user ID is stored in req.user by the authentication middleware
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        profileImage: true,
        role: true,
        coverPhoto: true,
        verificationStatus: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const updateUserDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req?.user?.id; // Assuming user ID is stored in req.user by the authentication middleware
    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      profileImage,
      coverPhoto,
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email,
        firstName,
        lastName,
        phoneNumber,
        profileImage,
        coverPhoto,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id; // Assuming user ID is stored in req.user by the authentication middleware

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const addAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(404).json({ message: "User Not found" });
      return;
    }
    const {
      street,
      city,
      state,
      postalCode,
      country,
      addressType,
      firstName,
      lastName,
    } = req.body;

    const newAddress = await prisma.address.create({
      data: {
        userId,
        street,
        city,
        state,
        postalCode,
        country,
        addressType,
        firstName,
        lastName,
      },
    });

    res.json(newAddress);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const updateAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const addressId = req.params.addressId;
    const {
      street,
      city,
      state,
      postalCode,
      country,
      addressType,
      firstName,
      lastName,
    } = req.body;

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        street,
        city,
        state,
        postalCode,
        country,
        addressType,
        firstName,
        lastName,
      },
    });

    res.json(updatedAddress);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const deleteAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const addressId = req.params.addressId;

    await prisma.address.delete({
      where: { id: addressId },
    });

    res.json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const getAddressByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id; // Assuming user ID is stored in req.user by the authentication middleware
    if (!userId) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
    });

    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

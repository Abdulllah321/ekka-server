"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddressByUser = exports.deleteAddress = exports.updateAddress = exports.addAddress = exports.deleteUser = exports.updateUserDetails = exports.getUserDetails = void 0;
const app_1 = require("../app");
const getUserDetails = async (req, res) => {
    try {
        const userId = req?.user?.id; // Assuming user ID is stored in req.user by the authentication middleware
        const user = await app_1.prisma.user.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};
exports.getUserDetails = getUserDetails;
const updateUserDetails = async (req, res) => {
    try {
        const userId = req?.user?.id; // Assuming user ID is stored in req.user by the authentication middleware
        const { email, firstName, lastName, phoneNumber, profileImage, coverPhoto, } = req.body;
        const updatedUser = await app_1.prisma.user.update({
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
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};
exports.updateUserDetails = updateUserDetails;
const deleteUser = async (req, res) => {
    try {
        const userId = req.user?.id; // Assuming user ID is stored in req.user by the authentication middleware
        await app_1.prisma.user.delete({
            where: { id: userId },
        });
        res.json({ message: "User deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};
exports.deleteUser = deleteUser;
const addAddress = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(404).json({ message: "User Not found" });
            return;
        }
        const { street, city, state, postalCode, country, addressType, firstName, lastName, } = req.body;
        const newAddress = await app_1.prisma.address.create({
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
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};
exports.addAddress = addAddress;
const updateAddress = async (req, res) => {
    try {
        const addressId = req.params.addressId;
        const { street, city, state, postalCode, country, addressType, firstName, lastName, } = req.body;
        const updatedAddress = await app_1.prisma.address.update({
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
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};
exports.updateAddress = updateAddress;
const deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.addressId;
        await app_1.prisma.address.delete({
            where: { id: addressId },
        });
        res.json({ message: "Address deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};
exports.deleteAddress = deleteAddress;
const getAddressByUser = async (req, res) => {
    try {
        const userId = req.user?.id; // Assuming user ID is stored in req.user by the authentication middleware
        if (!userId) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const addresses = await app_1.prisma.address.findMany({
            where: { userId },
        });
        res.json(addresses);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};
exports.getAddressByUser = getAddressByUser;

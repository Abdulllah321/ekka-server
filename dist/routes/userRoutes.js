"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get("/all", userController_1.getAllUsers);
router.use(authMiddleware_1.authenticated);
router.get("/", userController_1.getUserDetails);
router.put("/", userController_1.updateUserDetails);
router.delete("/", userController_1.deleteUser);
router.get("/address", userController_1.getAddressByUser);
router.post("/address", userController_1.addAddress);
router.put("/address/:addressId", userController_1.updateAddress);
router.delete("/address/:addressId", userController_1.deleteAddress);
exports.default = router;

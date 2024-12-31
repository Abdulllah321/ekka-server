import { Router } from "express";
import {
  getUserDetails,
  updateUserDetails,
  deleteUser,
  addAddress,
  updateAddress,
  deleteAddress,
  getAddressByUser,
} from "../controllers/userController";
import { authenticated } from "../middlewares/authMiddleware";

const router = Router();
router.use(authenticated);
router.get("/", getUserDetails);
router.put("/", updateUserDetails);
router.delete("/", deleteUser);

router.get("/address", getAddressByUser);
router.post("/address", addAddress);
router.put("/address/:addressId", updateAddress);
router.delete("/address/:addressId", deleteAddress);

export default router;

import express from "express";
import { verifyJwt } from "../../middleware/auth.middleware.js";
import {
  createUserBookingHistory,
  getUserBookingHistory,
  updateUserHistory,
  updateNegotiationStatus,
  updatePaymentStatus,
} from "../../controller/user/userBookinghistory.controller.js";
import {
  getCartWithUserDetails,
  getCartItemCount,
} from "../../controller/user/cart.controller.js";

const router = express.Router();


router.post("/create", verifyJwt, createUserBookingHistory);

router.put("/update-history", verifyJwt, updateUserHistory);

// 📜 Fetch user's full booking history
router.get("/my-bookings", verifyJwt, getUserBookingHistory);

router.put("/update-negotiation-status", verifyJwt, updateNegotiationStatus);

router.put("/update-payment-status", verifyJwt, updatePaymentStatus);

// 🛒 Cart Routes
router.get("/cart/:userDetailsId", verifyJwt, getCartWithUserDetails);
router.get("/cart/count/:userId", verifyJwt, getCartItemCount);

export default router;

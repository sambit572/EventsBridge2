import { UserBookingHistory } from "../../model/user/userBookinghistory.model.js";
import { ApiError } from "../../utilities/ApiError.js";
import { ApiResponse } from "../../utilities/ApiResponse.js";

export const createUserBookingHistory = async (req, res) => {
  try {
    const {
      userId,
      userDetailsId,
      location,
      startDate,
      endDate,
      amount,
      reDirectTo,
    } = req.body;

    console.log("Received booking history data:", req.body);

    // ✅ Basic field validation
    if (
      !userId ||
      !userDetailsId ||
      !location ||
      !startDate ||
      !endDate ||
      amount === undefined ||
      amount === null
    ) {
      return res
        .status(400)
        .json(new ApiError(400, "Missing required fields."));
    }

    if (!reDirectTo) {
      return res
        .status(500)
        .json(
          new ApiError(
            500,
            "reDirectTo field is required. It must be sent from frontend"
          )
        );
    }

    // ✅ Create booking history entry
    const newHistory = await UserBookingHistory.create({
      userId,
      userDetailsId,
      location,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      amount,
      reDirectTo,
    });

    // ✅ Respond
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          newHistory,
          "Booking history created successfully."
        )
      );
  } catch (error) {
    console.error("Error creating booking history:", error);
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          "Internal Server Error while creating booking history.",
          error.message
        )
      );
  }
};

/**
 * Update booking status (and sync with user history)
 */
export const updateUserHistory = async (req, res) => {
  try {
    const { userDetailsId, reDirectTo, venueInput } = req.body;
    console.log("Update request body:", req.body);

    if (!userDetailsId || !reDirectTo || !venueInput) {
      return res.status(400).json({
        success: false,
        message: "userDetailsId, reDirectTo, and venueInput are required.",
      });
    }

    // Step 2: Update user booking history
    await UserBookingHistory.findOneAndUpdate(
      { userDetailsId },
      { reDirectTo, location: venueInput },
      { new: true }
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, null, "Booking history updated successfully.")
      );
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json(new ApiError(500, "Server error"));
  }
};

/**
 * Update negotiation status in user booking history
 */
export const updateNegotiationStatus = async (req, res) => {
  try {
    const { userDetailsId, userId, vendorDecision, finalPrice } = req.body;

    if (!vendorDecision) {
      return res.status(400).json({
        success: false,
        message: "vendorDecision is required.",
      });
    }

    // Map vendor decision to booking status
    let bookingStatus = "PENDING";
    if (vendorDecision === "accepted") {
      bookingStatus = "CONFIRMED";
    } else if (vendorDecision === "rejected") {
      bookingStatus = "CANCELLED";
    }

    // Build query - support both userDetailsId and userId
    let query = {};
    if (userDetailsId) {
      query.userDetailsId = userDetailsId;
    } else if (userId) {
      query.userId = userId;
    } else {
      return res.status(400).json({
        success: false,
        message: "Either userDetailsId or userId is required.",
      });
    }

    // Update the UserBookingHistory
    const updatedHistory = await UserBookingHistory.findOneAndUpdate(
      query,
      {
        bookingStatus,
        amount: finalPrice || undefined, // Update amount if finalPrice is provided
      },
      { new: true }
    );

    if (!updatedHistory) {
      return res.status(404).json({
        success: false,
        message: "Booking history not found.",
      });
    }

    return res.status(200).json(
      new ApiResponse(200, updatedHistory, "Negotiation status updated successfully.")
    );
  } catch (error) {
    console.error("Error updating negotiation status:", error);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
};

/**
 * Update payment status in user booking history
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    const { userDetailsId, paymentStatus, transactionId, amount } = req.body;

    if (!userDetailsId || !paymentStatus) {
      return res.status(400).json({
        success: false,
        message: "userDetailsId and paymentStatus are required.",
      });
    }

    // Map payment status string to enum
    const validStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];
    if (!validStatuses.includes(paymentStatus.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status. Use: PENDING, PAID, FAILED, REFUNDED",
      });
    }

    const updateData = {
      paymentStatus: paymentStatus.toUpperCase(),
    };

    if (transactionId) {
      updateData.transactionId = transactionId;
      updateData.paymentDate = new Date();
    }

    // ✅ Update amount if provided
    if (amount !== undefined && amount !== null) {
      updateData.amount = amount;
    }

    // Update the UserBookingHistory
    const updatedHistory = await UserBookingHistory.findOneAndUpdate(
      { userDetailsId },
      updateData,
      { new: true }
    );

    if (!updatedHistory) {
      return res.status(404).json({
        success: false,
        message: "Booking history not found.",
      });
    }

    console.log("✅ Updated booking history:", {
      id: updatedHistory._id,
      paymentStatus: updatedHistory.paymentStatus,
      amount: updatedHistory.amount,
      transactionId: updatedHistory.transactionId
    });

    return res.status(200).json(
      new ApiResponse(200, updatedHistory, "Payment status updated successfully.")
    );
  } catch (error) {
    console.error("Error updating payment status:", error);
    return res.status(500).json(new ApiError(500, "Server error"));
  }
};

/**
 * Get all bookings for a user (with optional status filter)
 */
export const getUserBookingHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    // Build match stage
    const matchStage = { userId };
    if (status) matchStage.bookingStatus = status;

    let bookings = await UserBookingHistory.aggregate([
      // Stage 1: Match bookings for the user
      {
        $match: matchStage,
      },

      // Stage 2: Lookup userDetails
      {
        $lookup: {
          from: "userdetails", // Collection name (lowercase + plural by default)
          localField: "userDetailsId",
          foreignField: "_id",
          as: "userDetailsData",
        },
      },

      // Stage 3: Unwind the userDetailsData array
      {
        $unwind: {
          path: "$userDetailsData",
          preserveNullAndEmptyArrays: true, // Keep bookings even if userDetails is missing
        },
      },

      // Stage 4: Add computed fields
      {
        $addFields: {
          // Calculate total services
          totalServices: {
            $cond: {
              if: { $isArray: "$userDetailsData.serviceId" },
              then: { $size: "$userDetailsData.serviceId" },
              else: 0,
            },
          },
          // Restructure userDetailsId with only needed fields
          userDetailsId: {
            _id: "$userDetailsData._id",
            startDate: "$userDetailsData.startDate",
            endDate: "$userDetailsData.endDate",
            address: "$userDetailsData.address",
            serviceId: "$userDetailsData.serviceId",
          },
        },
      },

      // Stage 5: Remove the temporary userDetailsData field
      {
        $project: {
          userDetailsData: 0,
        },
      },

      // Stage 6: Sort by creation date (newest first)
      {
        $sort: { createdAt: -1 },
      },
    ]);

    // Fallback: if aggregation returns empty, try direct query
    if (!bookings || bookings.length === 0) {
      const directBookings = await UserBookingHistory.find(matchStage).sort({ createdAt: -1 });
      bookings = directBookings.map(b => ({
        ...b.toObject(),
        totalServices: 0,
        userDetailsId: null,
      }));
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
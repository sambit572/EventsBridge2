import { NONAME } from "node:dns/promises";
import { BankDetails } from "../../model/vendor/bankDetails.model.js";
import Vendor from "../../model/vendor/vendor.model.js";
import { ApiError } from "../../utilities/ApiError.js";
import { ApiResponse } from "../../utilities/ApiResponse.js";
import { verifyPAN } from "../../utilities/cashFree.js"; // Use the unified utility

/**
 * Create Bank Details
 */
export const createBankDetails = async (req, res) => {
  try {
    const {
      accountHolderName,
      accountNumber,
      branchName,
      ifscCode,
      gst,
      upiId,
      panNumber,
    } = req.body;

    console.log("📥 [BankDetails] Incoming create request:", req.body);

    // Validate required fields
    if (
      !accountHolderName ||
      !accountNumber ||
      !branchName ||
      !ifscCode ||
      !panNumber||
      !upiId
    ) {
      console.warn("⚠ [BankDetails] Missing required fields");
      return res.status(400).json(new ApiError(400, "Missing required fields"));
    }
    const upiRegex = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/;

if (!upiRegex.test(upiId)) {
  return res
    .status(400)
    .json(new ApiError(400, "Invalid UPI ID format"));
}
    // PAN Verification
    /* let verifyResp;
    try {
      console.log(🔍 [BankDetails] Verifying PAN: ${panNumber});
      verifyResp = await verifyPAN(panNumber);
    } catch (error) {
      console.error("❌ [BankDetails] PAN verification failed:", error.message);
      return res.status(400).json(new ApiError(400, error.message));
    } */

    /*For Testing Purpose*/
    const verifiedName = accountHolderName;

    /*Real Code*/
    /* const verifiedName = verifyResp?.data?.full_name || accountHolderName; */

    // Save bank details
    // Create or Update bank details using upsert
    const bankData = {
      vendorId: req.vendor._id,
      accountHolderName: verifiedName,
      accountNumber,
      branchName,
      ifscCode,
      gst,
      upiId,
      panNumber,
    };

    const newDetails = await BankDetails.findOneAndUpdate(
      { vendorId: req.vendor._id }, // Condition to find the document
      bankData, // The data to update or insert
      { new: true, upsert: true } // Options: return new doc, create if it doesn't exist
    );

    // Update vendor registration progress
    await Vendor.findByIdAndUpdate(req.vendor._id, { registrationProgress: 3 });

    console.log("✅ [BankDetails] Saved successfully:", newDetails._id);
    return res
      .status(201)
      .json(
        new ApiResponse(201, newDetails, "Bank details saved successfully")
      );
  } catch (err) {
    console.error("❌ [BankDetails] Error saving bank details:", err);
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
};

/**
 * Delete Bank Details
 */
export const deleteBankDetails = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    
    if (!vendorId) {
      return res.status(400).json(new ApiError(400, "Vendor ID is required"));
    }
    
    console.log("🗑 [BankDetails] Delete request for vendor:", vendorId);
    const bankDetail = await BankDetails.findOneAndDelete({
      vendorId: vendorId,
    });

    if (!bankDetail) {
      console.warn("⚠ [BankDetails] No bank details found for deletion");
      return res.status(404).json(new ApiError(404, "Bank details not found"));
    }

    console.log("✅ [BankDetails] Deleted successfully:", bankDetail._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Bank details deleted successfully"));
  } catch (error) {
    console.error("❌ [BankDetails] Error deleting:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

/**
 * Get Bank Details by Vendor
 */
export const getBankDetailsByVendor = async (req, res) => {
  try {
    console.log(
      "📥 [BankDetails] Fetching details for vendor:",
      req.vendor._id
    );
    const bankDetails = await BankDetails.findOne({ vendorId: req.vendor._id });

    if (!bankDetails) {
      console.warn("⚠ [BankDetails] No bank details found");
      return res.status(404).json(new ApiError(404, "Bank details not found"));
    }

    console.log("✅ [BankDetails] Retrieved successfully");
    return res
      .status(200)
      .json(
        new ApiResponse(200, bankDetails, "Bank details retrieved successfully")
      );
  } catch (error) {
    console.error("❌ [BankDetails] Fetch error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

/**
 * Update Bank Details
 */
export const updateBankDetails = async (req, res) => {
  try {
    const currentBankDetails = await BankDetails.findOne({
      vendorId: req.params.vendorId,
    });

    console.log("✏ [BankDetails] Vendor found for update:", currentBankDetails);

    const {
      accountHolderName,
      accountNumber,
      branchName,
      ifscCode,
      gst,
      upiId,
      panNumber = currentBankDetails.panNumber,
    } = req.body;
    console.log("✏ [BankDetails] Update request:", req.body);

    if (!panNumber) {
      console.warn("⚠ [BankDetails] PAN number missing in update request");
      return res.status(400).json(new ApiError(400, "PAN number is required"));
    }
    if ( !upiId) {
    console.warn("UPI ID missing in update request");
  return res.status(400).json(
    new ApiError(400, " UPI ID is required")
  );
}

    // PAN Verification
    // let verifyResp;
    // try {
    //   console.log("🔍[BankDetails] Verifying PAN:"`${panNumber}`);
    //   verifyResp = await verifyPAN(panNumber);
    // } catch (error) {
    //   console.error("❌ [BankDetails] PAN verification failed:", error.message);
    //   return res.status(400).json(new ApiError(400, error.message));
    // }

    // const verifiedName = verifyResp.data?.full_name || accountHolderName;
    const verifiedName = accountHolderName; // For Testing Purpose

    const updatedDetails = await BankDetails.findOneAndUpdate(
      { vendorId: req.params.vendorId },
      {
        accountHolderName: verifiedName,
        accountNumber,
        branchName,
        ifscCode,
        gst,
        upiId,
        panNumber,
      },
      { new: true }
    );

    if (!updatedDetails) {
      console.warn("⚠ [BankDetails] No bank details found for update");
      return res.status(404).json(new ApiError(404, "Bank details not found"));
    }

    console.log("✅ [BankDetails] Updated successfully:", updatedDetails);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedDetails,
          "Bank details updated successfully"
        )
      );
  } catch (err) {
    console.error("❌ [BankDetails] Error updating bank details:", err);
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
};

export const beforeHandPanVerification = async (req, res) => {
  try {
    const { panNumber, name } = req.body;

    // Validate input
    if (
      !panNumber ||
      typeof panNumber !== "string" ||
      panNumber.trim() === "" ||
      typeof name !== "string" ||
      name.trim() === ""
    ) {
      console.warn(
        "⚠ [BankDetails] Missing or invalid PAN number in request:",
        req.body
      );
      return res
        .status(400)
        .json(new ApiError(400, "Valid PAN number and name are required"));
    }

    console.log("🔍 [BankDetails] Initiating PAN verification:", panNumber);

    // Check if Cashfree credentials are configured
    if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) {
      console.warn("⚠ [BankDetails] Cashfree credentials not configured");
      return res
        .status(200)
        .json(new ApiResponse(200, { full_name: name, pan: panNumber }, "PAN verification skipped - using test mode"));
    }

    // Call Cashfree verification
    const verifyResp = await verifyPAN(panNumber, name);

    // Log the full response safely
    console.log("📩 [BankDetails] Cashfree verification response:", verifyResp);

    // Ensure response contains expected data
    if (!verifyResp || !verifyResp.status) {
      console.error(
        "❌ [BankDetails] Unexpected Cashfree response format:",
        verifyResp
      );
      return res
        .status(502)
        .json(
          new ApiError(502, "Invalid response from PAN verification service")
        );
    }

    // Handle unsuccessful verification
    if (verifyResp.status !== "SUCCESS") {
      console.warn(
        "⚠ [BankDetails] PAN verification failed for:", panNumber, verifyResp.message
      );
      return res
        .status(400)
        .json(
          new ApiError(400, verifyResp.message || "PAN verification failed")
        );
    }

    // Return verified PAN data
    return res
      .status(200)
      .json(new ApiResponse(200, verifyResp.data, "PAN verified successfully"));
  } catch (error) {
    console.error(
      "💥 [BankDetails] PAN verification error:",
      error.stack || error.message
    );
    // Fallback to test mode - accept the PAN without verification
    console.warn("⚠ [BankDetails] Falling back to test mode for PAN verification");
    const { panNumber, name } = req.body;
    return res
      .status(200)
      .json(new ApiResponse(200, { full_name: name, pan: panNumber }, "PAN accepted in test mode"));
  }
};

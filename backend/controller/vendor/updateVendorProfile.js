import Vendor from "../../model/vendor/vendor.model.js";
import { Negotiation } from "../../model/common/Negotiation.model.js";

export const updateVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const { fullName, email, phoneNumber } = req.body;

    // Update only the fields sent by the frontend
    if (fullName !== undefined) {
      vendor.fullName = fullName;
    }

    if (email !== undefined) {
      vendor.email = email;
    }

    if (phoneNumber !== undefined) {
      vendor.phoneNumber = phoneNumber;
    }

    // Save updated vendor profile
    await vendor.save();
console.log("Vendor saved")
    // Sync vendor details in all negotiations
    await Negotiation.updateMany(
      { vendorId: vendor._id },
      {
        $set: {
          vendorName: vendor.fullName,
          vendorEmail: vendor.email,
          vendorPhoneNumber: vendor.phoneNumber,
        },
      }
    );
console.log("Negotiation updated");
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: vendor,
    });
  } catch (error) {
    console.error("Update Vendor Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
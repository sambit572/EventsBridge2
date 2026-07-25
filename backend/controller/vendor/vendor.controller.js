import Vendor from "../../model/vendor/vendor.model.js";
import { ApiError } from "../../utilities/ApiError.js";
import { ApiResponse } from "../../utilities/ApiResponse.js";
import fs from "fs/promises";
import { isValidIndianPhone } from "../../utilities/validatePhone.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../../utilities/cloudinary.js";
import { validateEmailDomain } from "../../utilities/verifyDNS.js";
import { sendEmail } from "../../utilities/sendEmail.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../../model/user/user.model.js";
import { Service } from "../../model/vendor/service.model.js";
import { resetWhyChooseUs } from "./whychooseus.controller.js";
import client from "../../db/redisClient.js";
import {VendorBooking} from "../../model/vendor/vendorBookingHistory.model.js";



import { isValidPhoneNumber } from "libphonenumber-js";

// ======================================================
// ENV
// ======================================================

const isProd = process.env.NODE_ENV === "production";

// ======================================================
// COOKIE CONFIG
// ======================================================

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "None" : "Lax",
  path: "/",
};

const accessTokenOption = {
  ...cookieOptions,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
};

const refreshTokenOption = {
  ...cookieOptions,
  expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
};

// ======================================================
// HELPERS
// ======================================================

const sendAuthResponse = (
  res,
  statusCode,
  vendor,
  accessToken,
  refreshToken,
  message
) => {
  return res
    .status(statusCode)
    .cookie(
      "vendorAccessToken",
      accessToken,
      accessTokenOption
    )
    .cookie(
      "vendorRefreshToken",
      refreshToken,
      refreshTokenOption
    )
    .json(
      new ApiResponse(
        statusCode,
        {
          vendor,
          accessToken,
          refreshToken,
        },
        message
      )
    );
};

const deleteCloudinaryImage = async (imageUrl) => {
    try {
        await deleteFromCloudinary(imageUrl);
    } catch (error) {
        console.error("Cloudinary delete failed:", error);
    }
};


// ======================================================
// REGISTER VENDOR
// ======================================================

const registerVendor = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      password,
    } = req.body;

    if (
      [
        fullName,
        email,
        phoneNumber,
        password,
      ].some((field) => !field)
    ) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            "All required fields must be provided."
          )
        );
    }

    // Validate Indian mobile number (exactly 10 digits, starting with 6-9)
    if (!isValidIndianPhone(phoneNumber)) {
      return res
        .status(400)
        .json(new ApiError(400, "Please enter a valid Indian mobile number."));
    }

    const isValidDns = await validateEmailDomain(email);
    if (!isValidDns) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            "Invalid email domain"
          )
        );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phoneNumber.trim();

    const existingVendor =
      await Vendor.findOne({
        $or: [
          { email: normalizedEmail },
          {
            phoneNumber:
              normalizedPhone,
          },
        ],
      });

    if (existingVendor) {
      return res
        .status(409)
        .json(
          new ApiError(
            409,
            "Vendor already exists"
          )
        );
    }

    let profilePictureUrl = "";

    if (req.file) {
      const cloudinaryResult =
        await uploadOnCloudinary(
          req.file.path
        );

      if (!cloudinaryResult?.url) {
        return res
          .status(500)
          .json(
            new ApiError(
              500,
              "Profile picture upload failed"
            )
          );
      }

      profilePictureUrl =
        cloudinaryResult.url;
    }

    const newVendor =
      await Vendor.create({
        fullName: fullName.trim(),
        email: normalizedEmail,
        phoneNumber:
          normalizedPhone,
        password,
        profilePicture:
          profilePictureUrl,
        registrationProgress: 1,
      });

    const {
      accessToken,
      refreshToken,
    } = await generateVendorTokens(
      newVendor._id
    );

    await sendEmail({
      to: normalizedEmail,
      subject:
        "🎉 Welcome to EventsBridge",
      html: `
      <h2>Hi ${fullName},</h2>
      <p>Thank you for registering on EventsBridge.</p>
      <p>We’re excited to onboard your services.</p>
      <br/>
      <p>Team EventsBridge</p>
      `,
    });

    // 5. Return success response
    return res
      .status(200)
      .cookie("vendorAccessToken", accessToken, accessTokenOption)
      .cookie("vendorRefreshToken", refreshToken, refreshTokenOption)
      .json(new ApiResponse(200, newVendor, "Vendor registered successfully."));
  } catch (error) {
    console.error("Vendor registration error:", error);

    // Mongoose schema validation
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json(new ApiError(400, `Validation failed: ${messages.join(", ")}`));
    }
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
};

const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const file = req.file;

    // Never allow password updates through this route
    delete updateData.password;
    delete updateData.confirmPassword;

    console.log("Update data received:", updateData);

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res
        .status(404)
        .json(new ApiError(404, "Vendor not found for update."));
    }

    // Handle profile picture removal
   if (updateData.removeProfilePicture === "true") {
  if (
    vendor.profilePicture &&
    vendor.profilePicture.includes("cloudinary")
  ) {
    await deleteFromCloudinary(vendor.profilePicture);
  }

  updateData.profilePicture = "";
}

    // Handle profile picture replacement
   if (file) {
  if (
    vendor.profilePicture &&
    vendor.profilePicture.includes("cloudinary")
  ) {
    await deleteFromCloudinary(vendor.profilePicture);
  }

  const cloudinaryResult = await uploadOnCloudinary(file.path);
      if (!cloudinaryResult?.url) {
        return res
          .status(500)
          .json(new ApiError(500, "Failed to upload new profile picture."));
      }

      updateData.profilePicture = cloudinaryResult.url;
    }

    // 🚫 No bank update logic here

    const updatedVendor = await Vendor.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedVendor, "Vendor updated successfully.")
      );

    return sendAuthResponse(
      res,
      201,
      vendorData,
      accessToken,
      refreshToken,
      "Vendor registered successfully"
    );
  } catch (error) {
    console.error(
      "Vendor registration error:",
      error
    );

    if (error.name === "ValidationError") {
      const messages =
        Object.values(error.errors).map(
          (err) => err.message
        );

      return res
        .status(400)
        .json(
          new ApiError(
            400,
            messages.join(", ")
          )
        );
    }

    if (error.code === 11000) {
      return res
        .status(409)
        .json(
          new ApiError(
            409,
            "Vendor already exists"
          )
        );
    }

    return res
      .status(500)
      .json(new ApiError(500, "Internal server error during vendor update."));
  }
};

const generateVendorTokens = async (vendorId) => {
  const vendor = await Vendor.findById(vendorId);
  const accessToken = vendor.generateAccessToken();
  const refreshToken = vendor.generateRefreshToken();
  vendor.refreshToken = refreshToken;
  await vendor.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

const loginVendor = async (req, res) => {
  const { email, password } = req.body;
  if (! email || !password)
    return res
      .status(400)
      .json(new ApiError(400, "Email and password required"));

  const vendor = await Vendor.findOne({
    $or: [{ email }],
  });

  if (!vendor)
    return res.status(404).json(new ApiError(404, "Vendor not found"));
  const valid = await vendor.comparePassword(password);
  if (!valid)
    return res.status(400).json(new ApiError(400, "Incorrect password"));

  const { accessToken, refreshToken } = await generateVendorTokens(vendor._id);
  const data = await Vendor.findById(vendor._id).select(
    "-password -refreshToken -accessToken"
  );
  return res
    .status(200)
    .cookie("vendorAccessToken", accessToken, accessTokenOption)
    .cookie("vendorRefreshToken", refreshToken, refreshTokenOption)
    .json(
      new ApiResponse(
        200,
        { vendor: data, accessToken, refreshToken },
        "Vendor logged in successfully"
      )
    );
};
// OTP send through Email for login
const vendorLoginOtp=async(req,res)=>{
  try{
  const otp=Math.floor(100000 + Math.random() * 900000).toString();
  const{emailOtp}=req.body;
  if(!emailOtp){
    return res.status(400).json(new ApiError("Email not Found"));
  }
  await client.set(
    `vendor-login-otp:${emailOtp}`,
    otp,
    {EX:300}// 5 minutes
  );
  await sendEmail({
    to:emailOtp,
    subject: "Otp for login",
    html:`
     The otp for login is ${otp } `,
  });
 return  res.status(200).json(new ApiResponse(200,null,"Otp send successfully"));
} catch(error){
  return res.status(500).json(new ApiResponse(500,error.message));
}
}

const verifyVendorLoginOtp=async(req,res)=>{
  try{
  const{emailOtp,otp}=req.body;
  if(!emailOtp || !otp){
    return res.status(400).json(new ApiResponse(400,"Email or otp not found"))
  }
  const savedotp=await client.get(`vendor-login-otp:${emailOtp}`);
  if(!savedotp){
    return res.status(400).json(new ApiResponse(400,"Otp is invalid"));
  }
  if(savedotp!=otp){
    return res.status(400).json(new ApiResponse(400,"Otp is wrong"));
  }
  await client.del(`vendor-login-otp:${emailOtp}`);
  const vendor=await Vendor.findOne({
    email:emailOtp,
  });
  if(!vendor){
    return res.status(400).json(new ApiResponse(400,"Vendor not found"));
  }
   const { accessToken, refreshToken } =
      await generateVendorTokens(vendor._id);

    const loggedInVendor = await Vendor.findById(vendor._id).select(
      "-password -refreshToken"
    );
    return res
      .status(200)
      .cookie(
        "vendorAccessToken",
        accessToken,
        accessTokenOption
      )
      .cookie(
        "vendorRefreshToken",
        refreshToken,
        refreshTokenOption
      )
      .json(
        new ApiResponse(
          200,
          {
            loggedInVendor,
            accessToken,
            refreshToken,
          },
          "Vendor login successful"
        )
      );
  }
   catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, error.message));
  }
};

// ✅ Logout Vendor
const vendorLogout = async (req, res) => {
  if (req.vendor && req.vendor._id) {
    await Vendor.findByIdAndUpdate(req.vendor._id, {
      $unset: { refreshToken: 1 },
    });
  }
  return res
    .status(200)
    .clearCookie("vendorAccessToken", accessTokenOption)
    .clearCookie("vendorRefreshToken", refreshTokenOption)
    .json(new ApiResponse(200, {}, "Vendor logged out"));
};

// ✅ Forgot Password
const sendVendorResetLink = async (req, res) => {
  const { email } = req.body;
  const vendor = await Vendor.findOne({ email });
  if (!vendor)
    return res.status(404).json(new ApiError(404, "Vendor not found"));

  const resetToken = crypto.randomBytes(32).toString("hex");
  vendor.resetPasswordToken = resetToken;
  vendor.resetPasswordTokenExpires = Date.now() + 3600000;
  await vendor.save();

  const resetUrl = `${process.env.FRONTEND_URL}/vendor/reset-password/${resetToken}`;

  // use your central mailer
  const result = await sendEmail({
    to: vendor.email,
    subject: "Vendor Password Reset",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
  });

  if (!result.success) {
    return res
      .status(500)
      .json(new ApiError(500, "Failed to send reset email", result.error));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Reset link sent to vendor email"));
};

// ✅ Reset Password
const resetVendorPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  const vendor = await Vendor.findOne({
    resetPasswordToken: resetToken,
    resetPasswordTokenExpires: { $gt: Date.now() },
  });

  if (!vendor)
    return res.status(400).json(new ApiError(400, "Token invalid or expired"));

  vendor.password = newPassword;
  vendor.resetPasswordToken = undefined;
  vendor.resetPasswordTokenExpires = undefined;
  await vendor.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Vendor password reset successfully"));
};

// ✅ Change Password (requires auth, uses req.vendor from middleware)
const changeVendorPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const vendor = await Vendor.findById(req.vendor._id);

  const valid = await bcrypt.compare(oldPassword, vendor.password);
  if (!valid)
    return res.status(400).json(new ApiError(400, "Incorrect old password"));
  if (oldPassword === newPassword)
    return res
      .status(400)
      .json(new ApiError(400, "New password cannot be same as old"));

  vendor.password = newPassword;
  await vendor.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
};

// ✅ Silent Login (with vendor refresh token)
const vendorSilentLogin = async (req, res) => {
  const token = req.cookies.vendorRefreshToken;
  if (!token)
    return res.status(401).json(new ApiResponse(401, null, "No token"));

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Invalid or expired token"));
  }

  const vendor = await Vendor.findById(decoded._id);
  if (!vendor)
    return res.status(404).json(new ApiError(404, "Vendor not found"));

  const { accessToken, refreshToken } = await generateVendorTokens(vendor._id);

  console.log("vendorSilentLogin working fine ");

  return res
    .status(200)
    .cookie("vendorAccessToken", accessToken, accessTokenOption)
    .cookie("vendorRefreshToken", refreshToken, refreshTokenOption)
    .json(
      new ApiResponse(
        200,
        { vendor, accessToken },
        "Vendor login via refresh successful"
      )
    );
};

const checkVendorEmailStatus = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const existsInVendor = await Vendor.exists({ email });
    const existsInUser = await User.exists({ email });

    return res.status(200).json({
      existsInVendor: Boolean(existsInVendor),
      existsInUser: Boolean(existsInUser),
    });
  } catch (error) {
    console.error("Error checking email status:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getVendorProfile = async (req, res) => {
  try {
    const vendor = req.vendor; // Set in middleware

    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const verifyConfirmPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const vendor = await Vendor.findById(req.vendor._id); // check this line!

    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (isMatch) {
      return res.json({ success: true });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }
  } catch (error) {
    console.error("❌ Backend error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateVendorProfilePicture = async (req, res, next) => {
  try {
    const id = req.vendor._id; // 👈 Comes from JWT middleware
    const file = req.file;

    if (!file) {
      return next(new ApiError(400, "No file uploaded."));
    }

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return next(new ApiError(404, "Vendor not found."));
    }

    // Delete old image from Cloudinary (if exists)
   if (
    vendor.profilePicture &&
    vendor.profilePicture.includes("cloudinary")
) {
    await deleteFromCloudinary(vendor.profilePicture);
}

    const cloudinaryResult = await uploadOnCloudinary(file.path);
    if (!cloudinaryResult?.url) {
      return next(new ApiError(500, "Failed to upload new profile picture."));
    }

    vendor.profilePicture = cloudinaryResult.url;
    await vendor.save();

     res
      .status(200)
      .json(
        new ApiResponse(200, vendor, "Profile picture updated successfully.")
      );
  } catch (error) {
    console.error("Error uploading profile:", error);

    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting uploaded file:", unlinkError);
      }
    }

    next(new ApiError(500, "Internal server error during profile update."));
  }
};



// ======================================================
// SEARCH SUGGESTIONS
// ======================================================

const getSearchSuggestions =
  async (req, res) => {
    try {
      const { query } =
        req.query;

      if (
        !query ||
        query.trim().length < 1
      ) {
        return res
          .status(400)
          .json(
            new ApiError(
              400,
              "Search query required"
            )
          );
      }

      const searchTerm = query
        .trim()
        .toLowerCase();

      const matches =
        await Service.aggregate([
          {
            $match: {
              $or: [
                {
                  serviceName: {
                    $regex:
                      searchTerm,
                    $options: "i",
                  },
                },
                {
                  serviceCategory:
                  {
                    $regex:
                      searchTerm,
                    $options: "i",
                  },
                },
                {
                  locationOffered:
                  {
                    $regex:
                      searchTerm,
                    $options: "i",
                  },
                },
              ],
            },
          },
          {
            $project: {
              _id: 0,
              serviceName: 1,
              serviceCategory: 1,
              locationOffered: 1,
            },
          },
          {
            $limit: 15,
          },
        ]);

      return res.status(200).json(
        new ApiResponse(
          200,
          matches,
          "Suggestions fetched"
        )
      );
    } catch (error) {
      return res
        .status(500)
        .json(
          new ApiError(
            500,
            "Suggestion fetch failed"
          )
        );
    }
  };

// ======================================================
// DASHBOARD
// ======================================================

const getVendorDashboard =
  async (req, res) => {
    try {
      const currentStep =
        req.vendor
          .registrationProgress;

      const redirectMap = {
        1: "/category/VendorService",
        2: "/vendor/payment-info",
        3: "/vendor/legal-consent",
      };

      if (
        !currentStep ||
        currentStep < 4
      ) {
        return res.status(200).json({
          incomplete: true,
          redirectTo:
            redirectMap[
            currentStep
            ] || "",
        });
      }

      return res.status(200).json({
        incomplete: false,
        message: `Welcome ${req.vendor.fullName}`,
        vendor: req.vendor,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          message:
            "Dashboard loading failed",
        });
    }
  };

// ======================================================
// VERIFY LOGIN
// ======================================================

// For Verify my service
const submitVerificationRequest = async (req, res) => {
  try {
    const { duration, amount,tier } = req.body;
    const vendor = await Vendor.findByIdAndUpdate(req.vendor._id);
    if(!vendor){
      return res.status(404).json(new ApiError(404,"vendor not found"));
    }
    if(vendor.verification?.status==="verified"){
      return res.status(400).json(new ApiError(400,"Vendor is already verified"));
    }
    if(vendor.verification?.status==="pending"){
      return res.status(400).json(new ApiError(400,"Vendor verification is pending"));
    }
    vendor.verification.status = "pending";
    vendor.verification.submittedAt = new Date();
    vendor.verification.plan.duration = duration;
    vendor.verification.plan.amount = amount;
    vendor.verification.plan.tier=tier;

  await vendor.save();
   console.log(vendor)
    return res.status(200).json(
      new ApiResponse(
        200,
        vendor,
        "Verification request submitted successfully"
      )
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, error.message));
  }
};
export {
  registerVendor,
  loginVendor,
  vendorLogout,
  updateVendor,
  sendVendorResetLink,
  resetVendorPassword,
  changeVendorPassword,
  vendorSilentLogin,
  checkVendorEmailStatus,
  getVendorProfile,
  updateVendorProfilePicture,
  verifyConfirmPassword,
  getVendorDashboard,
  getSearchSuggestions,
  submitVerificationRequest,
  vendorLoginOtp,
  verifyVendorLoginOtp,
};

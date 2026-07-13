import React, { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../utils/constant";
import "./OTPVerification.css";
import { useDispatch } from "react-redux";
import { setVendor } from "../../redux/VendorSlice";
import { setUser } from "../../redux/UserSlice";

const OTPVerificationEmail = ({
  emailOtp,
  setStep,
  onClose,
  type ,
}) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const verifyOtp = async (e) => {
    e.preventDefault();

    if (!otp) {
      return setError("Please enter OTP");
    }

    try {
      setLoading(true);
      setError("");

      const endpoint =
        type === "vendor"
          ? `${BACKEND_URL}/vendors/verify-login-otp`
          : `${BACKEND_URL}/user/verify-login-otp`;

      const res = await axios.post(
        endpoint,
        {
          emailOtp,
          otp,
        },
        {
          withCredentials: true,
        }
      );

      if (type === "vendor") {
        const vendor = res.data.data.loggedInVendor;

        dispatch(setVendor(vendor));

        const profilePic = vendor.profilePicture || "";

        if (profilePic) {
          localStorage.setItem("VendorProfilePic", profilePic);
        }

        localStorage.setItem("VendorCurrentlyLoggedIn", "true");
        localStorage.setItem("VendorFullName", vendor.fullName);

        const firstName = vendor.fullName.split(" ")[0];

        localStorage.setItem("VendorFirstName", firstName);
        localStorage.setItem(
          "VendorInitial",
          firstName.charAt(0).toUpperCase()
        );
        localStorage.setItem("vendorId", vendor._id);
      } else {
       const user = res.data.data.user;

        dispatch(setUser(user));

        localStorage.setItem("currentlyLoggedIn", "true");

        const firstName = user.fullName.split(" ")[0];
        const lastName = user.fullName.split(" ")[1] || "";

        localStorage.setItem("userFirstName", firstName);
        localStorage.setItem("userLastName", lastName);
      }

      window.dispatchEvent(new Event("userLoggedIn"));

      if (res.status === 200) {
        setStep("success");
      }
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-container">
      <h2>Email Verification</h2>

      <p>Enter the OTP sent to your email.</p>

      <form onSubmit={verifyOtp}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          maxLength={6}
          onChange={(e) => setOtp(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
};

export default OTPVerificationEmail;
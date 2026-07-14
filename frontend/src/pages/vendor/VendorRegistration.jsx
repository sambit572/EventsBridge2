import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setVendor } from "../../redux/VendorSlice";
import StepProgress from "./StepProgress";
import VendorAutoFillConfirmModal from "../../components/vendor/VendorAutoFillConfirmModal";
import Spinner from "./../../components/common/Spinner";
import axios from "axios";
import laptopBackground from "/vendorRegistration/laptop_background.webp";
import { Seo } from "../../seo/seo";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const VendorRegister = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const [isLoading, setIsLoading] = useState(false);
  const [showAutofillModal, setShowAutofillModal] = useState(false);
  const [hasAutofilled, setHasAutofilled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    profilePic: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Basic validation function
  const validateForm = () => {
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match!");
      return false;
    }
    const emailRegex = /^[a-z][a-z0-9._%+-]*@[a-z0-9.-]+\.[a-z]{2,}$/;

    if (!emailRegex.test(form.email)) {
      setError("Invalid email! First letter must be lowercase.");
      return false;
    }

    const domain = form.email.split("@")[1];

    // 2. common typo detection
    const typoDomains = [
      "mail.com",
      "gmal.co",
      "gmal.con",
      "gmal.cm",

      "gmal.com",
      "gmial.com",
      "gmai.com",
      "gamil.com",
      "gmil.com",
      "gmaill.com",
      "gmailc.om",
      "gmail.con",
      "gmail.cm",
      "gmail.coom",
      "gmail.comm",
      "gmail.cmo",
      "gmail.om",
      "gmail.ocm",
      "gmsil.com",
      "gmaul.com",
      "gmqil.com",
      "gmakl.com",
      "gmail.co",
    ];

    if (typoDomains.includes(domain)) {
      setError("Email domain looks misspelled.");
      return false;
    }

    // 4. disposable email block
    const bannedDomains = [
      "mailinator.com",
      "tempmail.com",
      "10minutemail.com",
      "guerrillamail.com",
      "throwawaymail.com",
    ];

    if (bannedDomains.includes(domain)) {
      setError("Disposable email addresses are not allowed.");

      return false;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters!");
      return false;
    }
    setError("");
    return true;
  };

  // Handle form submission with axios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    setLoading(true);

    try {
      if (form.confirmPassword !== form.password) {
        setError("Password not matching");
        setLoading(false);
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      formData.append("phoneNumber", form.phone);
      formData.append("password", form.password);

      if (form.profilePic) {
        formData.append("profilePicture", form.profilePic);
      }

      const response = await axios.post(
        `${BACKEND_URL}/vendors/register`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      console.log("Registration successful:", response.data);

      dispatch(setVendor(response.data.data));
      console.log("Vendor data set in Redux:", response.data.data);

      const vendor = response.data.data;

      const fullName = vendor.fullName || "";
      const firstName = fullName.split(" ")[0];
      const firstLetter = firstName?.charAt(0).toUpperCase() || "";
      const profilePic = vendor.profilePic || "";

      localStorage.setItem("VendorCurrentlyLoggedIn", "true");
      localStorage.setItem("VendorFullName", fullName);
      localStorage.setItem("VendorFirstName", firstName);
      localStorage.setItem("VendorInitial", firstLetter);
      if (profilePic) {
        localStorage.setItem("VendorProfilePic", profilePic);
      }

      window.dispatchEvent(new Event("userLoggedIn"));

      navigate("/category/VendorService", {
        state: {
          currentStep: 1,
          vendorData: form,
          apiResponse: response.data,
        },
      });
    } catch (error) {
      console.error("Registration failed:", error);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 400) {
        setError("Invalid data provided. Please check your inputs.");
      } else if (error.response?.status === 409) {
        setError("Email already exists. Please use a different email.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const handleAutofill = () => {
    setForm((prev) => ({
      ...prev,
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phoneNo || "",
    }));
    setHasAutofilled(true);
    setShowAutofillModal(false);
  };

  const handleDecline = () => {
    setShowAutofillModal(false);
    setHasAutofilled(true);
  };

  useEffect(() => {
    if (user && user.email && !hasAutofilled) {
      console.log("✅ Showing modal for autofill");
      setShowAutofillModal(true);
    } else {
      console.log("❌ Modal not shown. Either user null or already autofilled");
    }
  }, [user, hasAutofilled]);

  // Icon for password visibility toggle
  const EyeIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
  const EyeSlashIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L6.228 6.228"
      />
    </svg>
  );

  return (
    <>
      <Seo
        title={"Vendor Registration | Grow Your Event Business with EventsBridge | Get More Bookings"}
        description={
          "Join EventsBridge and connect with thousands of customers searching for photographers, decorators, caterers, DJs, makeup artists, banquet halls and event planners. Register your business today and receive high-quality leads with zero hidden charges."
        }
      />
      <div>
        {showAutofillModal && (
          <VendorAutoFillConfirmModal
            onAccept={handleAutofill}
            onDecline={handleDecline}
          />
        )}

        <StepProgress currentStep={0} />
        {isLoading && <Spinner />}

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          .vr-root, .vr-root * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
          .vr-card {
            animation: vr-rise 0.5s cubic-bezier(.22,1,.36,1) both;
            background-image:
              linear-gradient(145deg, #fff9d6, #ffe680, #ffd34d, #ffe680, #fff9d6),
              linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #3b82f6 100%);
            background-origin: border-box;
            background-clip: padding-box, border-box;
            border: 4px solid transparent !important;
            background-size: 300% 300%;
            animation: vr-rise 0.5s cubic-bezier(.22,1,.36,1) both, vr-gradient-shift 6s ease infinite;
          }
          @keyframes vr-rise { from { opacity:0; transform: translateY(18px) scale(.985); } to { opacity:1; transform: translateY(0) scale(1); } }
          @keyframes vr-gradient-shift {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .vr-field { animation: vr-fade 0.45s ease both; }
          @keyframes vr-fade { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }
          .vr-input {
            width:100%; padding: 10px 12px; background: rgba(255,255,255,0.92);
            border: 1.5px solid #d6d3d1; border-radius: 10px; outline:none;
            transition: border-color .2s ease, box-shadow .2s ease, transform .15s ease;
            font-size: 14px;
          }
          .vr-input:hover { border-color:#bbb6b1; }
          .vr-input:focus { border-color:#16a34a; box-shadow: 0 0 0 3px rgba(34,197,94,0.18); transform: translateY(-1px); }
          .vr-label { display:block; font-size:12.5px; font-weight:600; color:#4b5563; margin-bottom:4px; letter-spacing:.01em; }
          .vr-submit { position:relative; overflow:hidden; }
          .vr-submit::after {
            content:''; position:absolute; top:0; left:-60%; width:50%; height:100%;
            background: linear-gradient(120deg, transparent, rgba(255,255,255,.35), transparent);
            transform: skewX(-20deg); transition: left .6s ease;
          }
          .vr-submit:hover::after { left:120%; }
          .vr-submit:active { transform: scale(0.98); }
          .vr-eye-btn { transition: color .15s ease, transform .15s ease; }
          .vr-eye-btn:hover { transform: scale(1.1); }
          .vr-illustration { animation: vr-float 5s ease-in-out infinite; }
          @keyframes vr-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        `}</style>

        <div className="vr-root min-h-[calc(100vh-110px)] w-full bg-gray-100 flex items-center justify-center p-3 sm:p-4 lg:p-6">
          <div className="vr-card w-full max-w-5xl flex flex-col lg:flex-row shadow-2xl rounded-[18px]">
            {/* LEFT SIDE: Form area - Full width on mobile */}
            <div
              className="w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-5 lg:p-6 bg-cover bg-center relative rounded-l-[14px] rounded-r-none"
              style={{
                backgroundImage: `url(${laptopBackground})`,
              }}
            >
              <div className="absolute inset-0 bg-black/30 "></div>
              <div className="relative z-10 w-full max-w-md">
                <div className="bg-stone-100/70 backdrop-blur-md rounded-xl shadow-lg p-5 sm:p-6">
                  <div className="flex flex-col gap-2.5">
                    <div className="text-left vr-field" style={{ animationDelay: "0ms" }}>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Create Vendor Account
                      </h2>
                      <p className="text-gray-600 text-sm mt-0.5">
                        Welcome! Please fill in the details to register.
                      </p>
                    </div>

                    {/* Error message */}
                    {error && (
                      <div
                        className="bg-red-100/90 border-l-4 border-red-500 text-red-700 p-2.5 rounded-md backdrop-blur-sm text-sm"
                        role="alert"
                      >
                        <p>{error}</p>
                      </div>
                    )}

                    <div className="vr-field" style={{ animationDelay: "40ms" }}>
                      <label className="vr-label">
                        Full Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        placeholder="Enter your full name"
                        value={form.fullName}
                        onChange={handleChange}
                        className="vr-input"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="vr-field" style={{ animationDelay: "80ms" }}>
                        <label className="vr-label">
                          Email Address <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={handleChange}
                          className="vr-input"
                          required
                        />
                      </div>

                      <div className="vr-field" style={{ animationDelay: "100ms" }}>
                        <label className="vr-label">
                          Phone Number <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="10-digit number"
                          value={form.phone}
                          onChange={handleChange}
                          className="vr-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="relative vr-field" style={{ animationDelay: "140ms" }}>
                        <label className="vr-label">
                          Password <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Enter password"
                            value={form.password}
                            onChange={handleChange}
                            className="vr-input pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="vr-eye-btn absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 w-5 h-5 flex items-center justify-center"
                          >
                            {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                          </button>
                        </div>
                      </div>

                      <div className="relative vr-field" style={{ animationDelay: "160ms" }}>
                        <label className="vr-label">
                          Confirm Password <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            className="vr-input pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="vr-eye-btn absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 w-5 h-5 flex items-center justify-center"
                          >
                            {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="vr-field" style={{ animationDelay: "200ms" }}>
                      <label className="vr-label">
                        Profile Picture (Optional)
                      </label>
                      <input
                        type="file"
                        name="profilePic"
                        accept="image/*"
                        onChange={handleChange}
                        className="vr-input file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="vr-submit w-full mt-1.5 bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed vr-field"
                      style={{ animationDelay: "240ms" }}
                    >
                      {loading ? "Registering..." : "Next"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Branding area - Hidden on mobile */}
            <div className="hidden lg:flex w-full lg:w-1/2 flex-col items-center justify-center text-center p-6 relative rounded-r-[14px]" style={{ background: "linear-gradient(145deg, #fff9d6, #ffe680, #ffd34d)" }}>
              <div className="vr-illustration w-full max-w-xs mt-[-40px]">
                {/* <img
                  decoding="async"
                  loading="lazy"
                  src="../new-illustrator.png"
                  alt="Registration Illustration"
                  className="w-full h-auto object-contain"
                /> */}
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 mt-[-6px]">
                Register Here
              </h1>
              <p className="text-base text-gray-600 max-w-md mx-auto leading-relaxed">
                Join EventsBridge, your one-stop platform for discovering and
                booking trusted vendors, planning events, and creating
                unforgettable experiences.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Main App component to render the registration page
export default function App() {
  return <VendorRegister />;
}

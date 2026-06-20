// Login.jsx
import { GoogleLogin } from "@react-oauth/google";
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import OTPVerification from "./OTPVerification.jsx";
import SuccessBlock from "./SuccessBlock.jsx";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/UserSlice.js";
import ForgotPass from "./../customer/ForgotPass";
import { FiEyeOff, FiEye } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import Spinner from "./../../components/common/Spinner";
import { Seo } from "../../seo/seo.js";
let firebaseAuthCache = null;

async function loadFirebaseAuth() {
  if (!firebaseAuthCache) {
    const [{ getFirebaseAuth }, authModule] = await Promise.all([
      import("../../utils/firebase.js"), // your new firebaseAuth file
      import("firebase/auth"),
    ]);

    const auth = await getFirebaseAuth();

    firebaseAuthCache = {
      auth,
      RecaptchaVerifier: authModule.RecaptchaVerifier,
      signInWithPhoneNumber: authModule.signInWithPhoneNumber,
    };
  }

  return firebaseAuthCache;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Login = ({ onClose, onSwitchToRegister }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState("form");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleCredential, setGoogleCredential] = useState(null);
  const [formData, setFormData] = useState({
    phoneNo: "",
    email: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const recaptchaVerifierRef = useRef(null);

  // Initialize reCAPTCHA
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { auth, RecaptchaVerifier } = await loadFirebaseAuth();

        if (cancelled || recaptchaVerifierRef.current) return;

        const verifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: (response) => {
              console.log("Enterprise reCAPTCHA passed", response);
            },
            "expired-callback": () => {
              verifier.clear();
              recaptchaVerifierRef.current = null;
            },
          },
          { type: "recaptcha-enterprise" }
        );

        await verifier.render();
        recaptchaVerifierRef.current = verifier;
      } catch (err) {
        setErrorMsg("Enterprise reCAPTCHA failed to load.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  async function handleGetOTP(e) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const phone = formData.phoneNo.replace(/\D/g, "");
    const phoneNumber = "+91" + phone;

    if (!recaptchaVerifierRef.current) {
      setIsLoading(false);
      return setErrorMsg("ReCAPTCHA is not ready. Please wait...");
    }

    if (!/^\+91\d{10}$/.test(phoneNumber)) {
      setIsLoading(false);
      return setErrorMsg("Invalid Indian phone number.");
    }

    try {
      const { auth, signInWithPhoneNumber } = await loadFirebaseAuth();

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifierRef.current
      );

      window.confirmationResult = confirmationResult;
      setStep("otp");
    } catch (err) {
      console.error("OTP error:", err);
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
      setErrorMsg("OTP send failed. Check number or reCAPTCHA.");
    }

    setIsLoading(false);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.email && !formData.phoneNo) {
      return setErrorMsg("Enter email or phone to log in.");
    }

    try {
      const res = await axios.post(
        `${BACKEND_URL}/user/login`,
        {
          email: formData.email,
          phoneNo: formData.phoneNo,
          password: formData.password,
        },
        { withCredentials: true }
      );

      const { user } = res.data.data;
      dispatch(setUser(user));
      localStorage.setItem("currentlyLoggedIn", "true");
      localStorage.setItem("userFirstName", user.fullName.split(" ")[0]);
      localStorage.setItem("userLastName", user.fullName.split(" ")[1]);
      window.dispatchEvent(new Event("userLoggedIn"));
      setStep("success");
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setErrorMsg(
        msg === "User does not exist"
          ? "Please register before login."
          : `Login failed: ${msg}`
      );
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/user/auth/google`,
        { token: credentialResponse.credential },
        { withCredentials: true }
      );

      const { user } = data.data;
      dispatch(setUser(user));
      localStorage.setItem("currentlyLoggedIn", "true");
      localStorage.setItem("userFirstName", user.fullName.split(" ")[0]);
      window.dispatchEvent(new Event("userLoggedIn"));
      setStep("success");
    } catch (err) {
      if (
        err.response?.data?.message === "Phone number is required for new users"
      ) {
        setGoogleCredential(credentialResponse.credential);
        setStep("google-phone");
      } else {
        setErrorMsg("Google login failed. Try again.");
      }
    }
  };

  const handleGooglePhoneSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const phone = formData.phoneNo.replace(/\D/g, "");
    const phoneNumber = "+91" + phone;

    if (!formData.phoneNo || !/^\+91\d{10}$/.test(phoneNumber)) {
      return setErrorMsg("Invalid Indian phone number.");
    }

    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/user/auth/google`,
        { token: googleCredential, phoneNo: phoneNumber },
        { withCredentials: true }
      );
      const { user } = data.data;
      dispatch(setUser(user));
      localStorage.setItem("currentlyLoggedIn", "true");
      localStorage.setItem("userFirstName", user.fullName.split(" ")[0]);
      window.dispatchEvent(new Event("userLoggedIn"));
      setStep("success");
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Google signup failed. Try again."
      );
    }
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

    .ul-overlay {
      position: fixed; inset: 0; z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      background: rgba(15,10,40,0.55);
      backdrop-filter: blur(6px);
      padding: 16px;
    }
    .ul-modal {
      display: flex; width: 100%; max-width: 820px;
      min-height: 560px; border-radius: 20px; overflow: hidden;
      box-shadow: 0 24px 80px rgba(79,70,229,0.25);
      animation: ul-pop 0.45s cubic-bezier(0.22,1,0.36,1) both;
      font-family: 'Poppins', sans-serif;
    }
    @keyframes ul-pop {
      from { transform: scale(0.92) translateY(20px); opacity: 0; }
      to   { transform: scale(1) translateY(0); opacity: 1; }
    }

    /* LEFT PANEL */
    .ul-left {
      flex: 1; position: relative; overflow: hidden;
      background: #0f0a2e;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 36px 32px;
    }
    .ul-orb {
      position:absolute;border-radius:50%;pointer-events:none;filter:blur(40px);
    }
    .ul-orb1 {
      width:280px;height:280px;
      background:radial-gradient(circle,rgba(108,62,244,0.55) 0%,transparent 70%);
      top:-80px;right:-80px;
      animation:ul-orb-move1 9s ease-in-out infinite;
    }
    .ul-orb2 {
      width:220px;height:220px;
      background:radial-gradient(circle,rgba(79,70,229,0.45) 0%,transparent 70%);
      bottom:-60px;left:-60px;
      animation:ul-orb-move2 11s ease-in-out infinite;
    }
    .ul-orb3 {
      width:140px;height:140px;
      background:radial-gradient(circle,rgba(167,139,250,0.3) 0%,transparent 70%);
      top:45%;left:30%;
      animation:ul-orb-move3 7s ease-in-out infinite;
    }
    @keyframes ul-orb-move1{0%,100%{transform:translate(0,0)}50%{transform:translate(-30px,25px)}}
    @keyframes ul-orb-move2{0%,100%{transform:translate(0,0)}50%{transform:translate(25px,-20px)}}
    @keyframes ul-orb-move3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-15px,15px) scale(1.15)}}

    .ul-grid {
      position:absolute;inset:0;pointer-events:none;z-index:0;
      background-image:
        linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),
        linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px);
      background-size:36px 36px;
      mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%);
    }

    .ul-particle {
      position:absolute;border-radius:50%;pointer-events:none;
      background:rgba(255,255,255,0.6);
      animation:ul-float-up linear infinite;
    }
    .ul-p1{width:3px;height:3px;left:15%;animation-duration:6s;animation-delay:0s}
    .ul-p2{width:2px;height:2px;left:35%;animation-duration:8s;animation-delay:1.5s}
    .ul-p3{width:4px;height:4px;left:55%;animation-duration:7s;animation-delay:3s}
    .ul-p4{width:2px;height:2px;left:75%;animation-duration:9s;animation-delay:0.8s}
    .ul-p5{width:3px;height:3px;left:88%;animation-duration:6.5s;animation-delay:2.2s}
    .ul-p6{width:2px;height:2px;left:25%;animation-duration:10s;animation-delay:4s}
    @keyframes ul-float-up{
      0%{bottom:-10px;opacity:0}
      10%{opacity:0.7}
      90%{opacity:0.3}
      100%{bottom:105%;opacity:0}
    }

    .ul-monogram {
      width:58px;height:58px;border-radius:16px;
      background:linear-gradient(135deg,rgba(108,62,244,0.6),rgba(79,70,229,0.4));
      border:1px solid rgba(255,255,255,0.2);
      display:flex;align-items:center;justify-content:center;
      font-size:22px;font-weight:700;color:#fff;letter-spacing:-1px;
      position:relative;z-index:2;margin-bottom:20px;
      animation:ul-logo-glow 3s ease-in-out infinite;
    }
    .ul-monogram::after {
      content:'';position:absolute;inset:-1px;border-radius:16px;
      background:linear-gradient(135deg,rgba(167,139,250,0.5),transparent,rgba(79,70,229,0.4));
      z-index:-1;animation:ul-border-spin 4s linear infinite;
    }
    @keyframes ul-logo-glow{
      0%,100%{box-shadow:0 0 20px rgba(108,62,244,0.4),0 0 40px rgba(108,62,244,0.2)}
      50%{box-shadow:0 0 30px rgba(167,139,250,0.6),0 0 60px rgba(108,62,244,0.3)}
    }
    @keyframes ul-border-spin{
      0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}
    }

    .ul-left-headline {
      font-size:26px;font-weight:700;line-height:1.25;margin-bottom:12px;
      position:relative;z-index:2;
      background:linear-gradient(135deg,#fff 40%,rgba(167,139,250,0.9) 100%);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    }
    .ul-left-sub {
      font-size:12.5px;color:rgba(255,255,255,0.5);line-height:1.7;
      position:relative;z-index:2;max-width:260px;
    }

    .ul-stats {
      display:flex;flex-direction:column;gap:8px;
      position:relative;z-index:2;margin:20px 0;
    }
    .ul-stat {
      display:flex;align-items:center;gap:12px;
      padding:10px 14px;border-radius:12px;
      background:rgba(255,255,255,0.05);
      border:1px solid rgba(255,255,255,0.08);
      backdrop-filter:blur(8px);
      animation:ul-stat-in 0.5s both;
      transition:background 0.3s,border 0.3s;
    }
    .ul-stat:hover{background:rgba(255,255,255,0.09);border-color:rgba(255,255,255,0.16)}
    .ul-stat:nth-child(1){animation-delay:0.5s}
    .ul-stat:nth-child(2){animation-delay:0.65s}
    .ul-stat:nth-child(3){animation-delay:0.8s}
    @keyframes ul-stat-in{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
    .ul-stat-icon {
      width:34px;height:34px;border-radius:9px;flex-shrink:0;
      display:flex;align-items:center;justify-content:center;font-size:16px;
    }
    .ul-stat-icon.bk{background:rgba(99,102,241,0.3)}
    .ul-stat-icon.cu{background:rgba(16,185,129,0.25)}
    .ul-stat-icon.an{background:rgba(245,158,11,0.25)}
    .ul-stat-body { flex:1;min-width:0; }
    .ul-stat-label{font-size:10px;color:rgba(255,255,255,0.45);font-weight:500;letter-spacing:0.3px}
    .ul-stat-val{font-size:15px;font-weight:700;color:#fff;line-height:1.2}
    .ul-stat-dot {
      width:7px;height:7px;border-radius:50%;flex-shrink:0;
      animation:ul-blink 2s ease-in-out infinite;
    }
    .ul-stat-dot.green{background:#10b981}
    .ul-stat-dot.blue{background:#6366f1}
    .ul-stat-dot.amber{background:#f59e0b}
    @keyframes ul-blink{0%,100%{opacity:1}50%{opacity:0.3}}

    .ul-bottom-tag {
      display:flex;align-items:center;gap:8px;
      position:relative;z-index:2;
    }
    .ul-tag-line{flex:1;height:1px;background:rgba(255,255,255,0.1)}
    .ul-tag-text{
      font-size:10px;color:rgba(255,255,255,0.3);font-weight:500;
      letter-spacing:1.2px;text-transform:uppercase;white-space:nowrap;
    }

    /* RIGHT PANEL */
    .ul-right {
      flex: 1; background: #FAFAFA; padding: 32px 36px;
      display: flex; flex-direction: column; justify-content: center;
      position: relative; overflow-y: auto;
      animation: ul-slide-in 0.5s 0.1s cubic-bezier(0.22,1,0.36,1) both;
    }
    @keyframes ul-slide-in {
      from { transform: translateX(40px); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }
    .ul-close {
      position:absolute;top:14px;right:16px;
      background:none;border:none;cursor:pointer;
      color:#9ca3af;font-size:20px;
      transition:color 0.2s,transform 0.2s;
      display:flex;align-items:center;justify-content:center;
    }
    .ul-close:hover { color:#ef4444; transform:rotate(90deg) scale(1.1); }
    .ul-portal-badge {
      display:inline-flex;align-items:center;gap:5px;
      padding:4px 12px;border-radius:50px;
      background:#ede9fe;color:#5b21b6;
      font-size:11px;font-weight:600;margin-bottom:16px;width:fit-content;
      animation:ul-fade-up 0.4s 0.25s both;
    }
    .ul-title { font-size:24px;font-weight:700;color:#111827;margin-bottom:4px;animation:ul-fade-up 0.4s 0.3s both; }
    .ul-subtitle { font-size:12.5px;color:#6b7280;margin-bottom:22px;animation:ul-fade-up 0.4s 0.35s both; }
    @keyframes ul-fade-up {
      from{opacity:0;transform:translateY(10px)}
      to{opacity:1;transform:translateY(0)}
    }

    .ul-method-label {
      font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;
      color:#9ca3af;margin-bottom:10px;
    }

    .ul-phone-row { display:flex;flex-direction:column;gap:8px;animation:ul-fade-up 0.4s 0.4s both; }
    .ul-phone-top { display:flex;gap:8px;align-items:center; }
    .ul-flag-select {
      padding:11px 12px;border-radius:12px;border:1.5px solid #e5e7eb;
      background:#fff;font-size:13px;color:#374151;cursor:pointer;
      outline:none;transition:border 0.2s,box-shadow 0.2s;width:96px;flex-shrink:0;
      font-family:'Poppins',sans-serif;
    }
    .ul-flag-select:focus { border-color:#6C3EF4;box-shadow:0 0 0 3px rgba(108,62,244,0.1); }
    .ul-phone-input {
      flex:1;padding:11px 16px;border-radius:12px;border:1.5px solid #e5e7eb;
      background:#fff;font-size:13px;font-family:'Poppins',sans-serif;
      color:#111827;outline:none;transition:border 0.2s,box-shadow 0.2s;
    }
    .ul-phone-input:focus { border-color:#6C3EF4;box-shadow:0 0 0 3px rgba(108,62,244,0.1); }
    .ul-otp-btn {
      width:100%;padding:11px;border-radius:12px;border:none;
      background:linear-gradient(135deg,#4f46e5,#6C3EF4);color:#fff;
      font-size:13px;font-weight:600;font-family:'Poppins',sans-serif;
      cursor:pointer;letter-spacing:0.3px;
      transition:transform 0.2s,box-shadow 0.2s;position:relative;overflow:hidden;
    }
    .ul-otp-btn:hover { transform:translateY(-2px);box-shadow:0 6px 18px rgba(108,62,244,0.32); }
    .ul-otp-btn:active { transform:scale(0.97); }

    .ul-divider { display:flex;align-items:center;gap:10px;margin:14px 0;animation:ul-fade-up 0.4s 0.48s both; }
    .ul-divider-line { flex:1;height:1px;background:#e5e7eb; }
    .ul-divider-text {
      font-size:11px;color:#9ca3af;font-weight:500;
      padding:3px 10px;border-radius:50px;border:1px solid #e5e7eb;background:#fff;
    }

    .ul-field { position:relative;margin-bottom:12px;animation:ul-fade-up 0.4s 0.52s both; }
    .ul-field:nth-child(2) { animation-delay:0.56s; }
    .ul-field input {
      width:100%;padding:22px 16px 8px;border-radius:12px;
      border:1.5px solid #e5e7eb;background:#fff;
      font-size:14px;font-family:'Poppins',sans-serif;
      color:#111827;outline:none;
      transition:border 0.2s,box-shadow 0.2s;
      box-sizing:border-box;
    }
    .ul-field input:focus { border-color:#6C3EF4;box-shadow:0 0 0 3px rgba(108,62,244,0.1); }
    .ul-field label {
      position:absolute;left:16px;top:50%;transform:translateY(-50%);
      font-size:13px;color:#9ca3af;pointer-events:none;
      transition:all 0.18s ease;font-family:'Poppins',sans-serif;
    }
    .ul-field input:focus ~ label,
    .ul-field input:not(:placeholder-shown) ~ label {
      top:10px;transform:none;font-size:10px;color:#6C3EF4;font-weight:600;letter-spacing:0.3px;
    }
    .ul-field input::placeholder { color:transparent; }
    .ul-eye {
      position:absolute;right:14px;top:50%;transform:translateY(-50%);
      background:none;border:none;cursor:pointer;
      color:#9ca3af;font-size:17px;
      transition:color 0.2s;display:flex;align-items:center;
    }
    .ul-eye:hover { color:#6C3EF4; }

    .ul-forgot { text-align:right;margin:-4px 0 12px;animation:ul-fade-up 0.4s 0.58s both; }
    .ul-forgot span {
      font-size:12px;color:#6C3EF4;cursor:pointer;font-weight:500;
      transition:color 0.2s;
    }
    .ul-forgot span:hover { color:#4f46e5;text-decoration:underline; }

    .ul-login-btn {
      width:100%;padding:11px;border-radius:50px;border:none;
      background:linear-gradient(135deg,#4f46e5,#6C3EF4);color:#fff;
      font-size:14px;font-weight:600;font-family:'Poppins',sans-serif;
      cursor:pointer;position:relative;overflow:hidden;
      display:flex;align-items:center;justify-content:center;gap:8px;
      transition:transform 0.2s,box-shadow 0.2s;
      animation:ul-fade-up 0.4s 0.6s both;
    }
    .ul-login-btn:hover { transform:translateY(-2px);box-shadow:0 8px 22px rgba(108,62,244,0.35); }
    .ul-login-btn:active { transform:scale(0.98); }
    .ul-shimmer {
      position:absolute;top:0;left:-100%;width:55%;height:100%;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);
      transform:skewX(-15deg);
      animation:ul-shimmer 2.4s infinite;
    }
    @keyframes ul-shimmer { 0%{left:-100%} 60%,100%{left:150%} }

    .ul-signup { text-align:center;font-size:12.5px;color:#6b7280;margin-top:12px;animation:ul-fade-up 0.4s 0.65s both; }
    .ul-signup span {
      background:linear-gradient(135deg,#4f46e5,#6C3EF4);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      font-weight:600;cursor:pointer;
    }
    .ul-signup span:hover { text-decoration:underline;text-decoration-color:#6C3EF4; }

    .ul-google-row { animation:ul-fade-up 0.4s 0.4s both; margin-bottom: 2px; }

    .ul-error { color:#dc2626;font-size:12px;text-align:center;font-weight:500;margin-bottom:8px;animation:ul-fade-up 0.3s both; }

    @media(max-width:640px){
      .ul-modal { flex-direction:column;max-height:92vh;overflow-y:auto; }
      .ul-left { padding:20px 24px 16px;flex-direction:row;align-items:center;gap:14px;flex-wrap:wrap;min-height:unset; }
      .ul-monogram { width:42px;height:42px;font-size:15px;margin-bottom:0;flex-shrink:0; }
      .ul-left-headline { font-size:15px;margin-bottom:0; }
      .ul-left-sub,.ul-stats,.ul-bottom-tag { display:none; }
      .ul-right { padding:24px 20px; }
      .ul-title { font-size:20px; }
    }
  `;

  const renderStep = () => {
    if (step === "success")
      return <SuccessBlock autoCloseTime={3000} onClose={onClose} />;

    if (step === "otp")
      return (
        <OTPVerification
          phoneNum={formData.phoneNo}
          onClose={onClose}
          setStep={setStep}
          type="user"
        />
      );

    if (step === "google-phone") {
      return (
        <div style={{ width: "100%" }}>
          <div className="ul-title" style={{ fontSize: 20 }}>
            Almost There!
          </div>
          <div className="ul-subtitle">
            Please enter your phone number to complete your Google registration.
          </div>
          <form onSubmit={handleGooglePhoneSubmit}>
            <div className="ul-field">
              <input
                type="text"
                name="phoneNo"
                id="ul-google-phone"
                placeholder="Phone number"
                value={formData.phoneNo}
                onChange={handleChange}
                required
              />
              <label htmlFor="ul-google-phone">Phone number</label>
            </div>
            {errorMsg && <p className="ul-error">{errorMsg}</p>}
            <button type="submit" className="ul-login-btn">
              <div className="ul-shimmer" />
              <span>Complete Registration</span>
            </button>
            <p className="ul-signup">
              <span onClick={() => setStep("form")}>Back to Login</span>
            </p>
          </form>
        </div>
      );
    }

    return (
      <div style={{ width: "100%" }}>
        {/* Google */}
        <div className="ul-google-row">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErrorMsg("Google login failed.")}
            text="signup_with"
            shape="pill"
            logo_alignment="center"
            width="100%"
          />
        </div>

        <div className="ul-divider">
          <div className="ul-divider-line" />
          <div className="ul-divider-text">or</div>
          <div className="ul-divider-line" />
        </div>

        {/* Phone OTP section */}
        <div className="ul-method-label">via phone</div>
        <div className="ul-phone-row">
          <div className="ul-phone-top">
            <select className="ul-flag-select" aria-label="Country code">
              <option>🇮🇳 +91</option>
              <option>🇺🇸 +1</option>
              <option>🇬🇧 +44</option>
            </select>
            <input
              type="number"
              name="phoneNo"
              placeholder="Mobile number"
              value={formData.phoneNo}
              onChange={handleChange}
              className="ul-phone-input"
              aria-label="Mobile number"
            />
          </div>
          <button type="button" onClick={handleGetOTP} className="ul-otp-btn">
            <div className="ul-shimmer" />
            Send OTP
          </button>
        </div>

        <div className="ul-divider">
          <div className="ul-divider-line" />
          <div className="ul-divider-text">or</div>
          <div className="ul-divider-line" />
        </div>

        {/* Credentials section */}
        <div className="ul-method-label">via credentials</div>
        <form onSubmit={handleLogin}>
          <div className="ul-field">
            <input
              type="email"
              name="email"
              id="ul-email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
            />
            <label htmlFor="ul-email">Email Address</label>
          </div>
          <div className="ul-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="ul-password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ paddingRight: "42px" }}
            />
            <label htmlFor="ul-password">Password</label>
            <button
              type="button"
              className="ul-eye"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="ul-forgot">
            <span onClick={() => setShowForgotModal(true)}>Forgot password?</span>
          </div>

          {errorMsg && <p className="ul-error">{errorMsg}</p>}

          <button type="submit" className="ul-login-btn">
            <div className="ul-shimmer" />
            <span>Login</span>
          </button>
        </form>

        <p className="ul-signup">
          Don't have an account?{" "}
          <span
            onClick={() => {
              onClose?.();
              onSwitchToRegister?.();
            }}
          >
            Sign Up
          </span>
        </p>
      </div>
    );
  };

  return (
    <>
      <Seo
        title={"Login to EventsBridge"}
        description={
          "Log in to your Eventsbridge account to manage bookings, vendor services or event plans. Secure access for seamless event coordination."
        }
      />
      <style>{styles}</style>
      <div className="ul-overlay" onClick={onClose}>
        {isLoading && <Spinner />}
        <div className="ul-modal" onClick={(e) => e.stopPropagation()}>
          {/* LEFT PANEL */}
          <div className="ul-left">
            <div className="ul-orb ul-orb1" />
            <div className="ul-orb ul-orb2" />
            <div className="ul-orb ul-orb3" />
            <div className="ul-grid" />
            <div className="ul-particle ul-p1" />
            <div className="ul-particle ul-p2" />
            <div className="ul-particle ul-p3" />
            <div className="ul-particle ul-p4" />
            <div className="ul-particle ul-p5" />
            <div className="ul-particle ul-p6" />

            <div>
              <div className="ul-monogram">EB</div>
              <div className="ul-left-headline">Welcome Back,<br />Explorer</div>
              <div className="ul-left-sub">
                Discover, book, and manage your favorite event services — all from one place.
              </div>
            </div>

            <div className="ul-stats">
              <div className="ul-stat">
                <div className="ul-stat-icon bk">🎉</div>
                <div className="ul-stat-body">
                  <div className="ul-stat-label">Upcoming Events</div>
                  <div className="ul-stat-val">Stay on track</div>
                </div>
                <div className="ul-stat-dot green" />
              </div>
              <div className="ul-stat">
                <div className="ul-stat-icon cu">💜</div>
                <div className="ul-stat-body">
                  <div className="ul-stat-label">Saved Vendors</div>
                  <div className="ul-stat-val">Quick rebooking</div>
                </div>
                <div className="ul-stat-dot blue" />
              </div>
              <div className="ul-stat">
                <div className="ul-stat-icon an">⭐</div>
                <div className="ul-stat-body">
                  <div className="ul-stat-label">Trusted Platform</div>
                  <div className="ul-stat-val">Verified vendors only</div>
                </div>
                <div className="ul-stat-dot amber" />
              </div>
            </div>

            <div className="ul-bottom-tag">
              <div className="ul-tag-line" />
              <div className="ul-tag-text">EventsBridge</div>
              <div className="ul-tag-line" />
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="ul-right">
            <div id="recaptcha-container"></div>

            {onClose && (
              <button className="ul-close" onClick={onClose} aria-label="Close">
                <RxCross2 />
              </button>
            )}

            <div className="ul-portal-badge">🎈 Customer Portal</div>
            <div className="ul-title">Sign In</div>
            <div className="ul-subtitle">Choose how you'd like to continue</div>

            {renderStep()}
          </div>
        </div>

        {showForgotModal && (
          <div onClick={(e) => e.stopPropagation()}>
            <ForgotPass onClose={() => setShowForgotModal(false)} />
          </div>
        )}
      </div>
    </>
  );
};

Login.propTypes = {
  onClose: PropTypes.func,
  onSwitchToRegister: PropTypes.func,
};

export default Login;

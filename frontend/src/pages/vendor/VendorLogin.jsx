import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import OTPVerificationEmail from "../common/OtpVerificationEmail.jsx";
import SuccessBlock from "../common/SuccessBlock.jsx";
import axios from "axios";
import "../common/LoginRegister.css";
import { useDispatch, useSelector } from "react-redux";
import { setVendor } from "../../redux/VendorSlice.js";
import { FiEyeOff, FiEye } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import VendorForgotPass from "./VendorForgetPass.jsx";
import { BACKEND_URL } from "../../utils/constant.js";
import EventsBridgeLogo from "../../assets/EventsBridgeOnlyLogo.webp";

let firebaseAuthCache = null;
async function loadFirebaseAuth() {
  if (!firebaseAuthCache) {
    const [{ getFirebaseAuth }, authModule] = await Promise.all([
      import("../../utils/firebase.js"),
      import("firebase/auth"),
    ]);
    const auth = getFirebaseAuth();
    firebaseAuthCache = {
      auth,
      RecaptchaVerifier: authModule.RecaptchaVerifier,
      signInWithPhoneNumber: authModule.signInWithPhoneNumber,
    };
  }
  return firebaseAuthCache;
}

const VendorLogin = ({ onClose, onSwitchToLogin }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState("form");
  const [showSuccessIcon, setShowSuccessIcon] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [formData, setFormData] = useState({  email: "", password: "",emailOtp:"" });
  const [errorMsg, setErrorMsg] = useState("");
  const { user } = useSelector((state) => state.user);
  const [sendingOtp, setSendingOtp] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
      document.getElementById("footer")?.classList.add("hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
      document.getElementById("footer")?.classList.remove("hidden");
      if (window.location.pathname !== "/vendor/register") navigate("/");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
      document.getElementById("footer")?.classList.remove("hidden");
    };
  }, []);

  useEffect(() => {
    if (step === "success") {
      setShowSuccessIcon(false);
      const iconTimer = setTimeout(() => setShowSuccessIcon(true), 500);
      const closeTimer = setTimeout(() => onClose?.(), 3000);
      return () => { clearTimeout(iconTimer); clearTimeout(closeTimer); };
    }
  }, [step, onClose]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });


 async function handleGetOTP(e) {
  setErrorMsg("");
  e.preventDefault();
  if(!formData.emailOtp){
    return setErrorMsg("Invalid Email id");
  }
  try{
      setSendingOtp(true);
    const res= await axios.post (`${BACKEND_URL}/vendors/send-otp`,{
      emailOtp:formData.emailOtp.toLowerCase(),
    });
    toast.success(res.data.message || "OTP sent successfully");
setStep("otp");
  } catch(err){
    setErrorMsg(
       err.response?.data?.message || "Failed to send OTP."
    );
  }
  
 }
  async function handleLogin(e) {
    e.preventDefault();
    setErrorMsg("");
    if (!user) { toast("Please login as a user first.", { duration: 2000 }); return; }
    if (!formData.email ) return setErrorMsg("Enter email to log in ");
    try {
      setLoginLoading(true);
      const res = await axios.post(`${BACKEND_URL}/vendors/login`, {
        email: formData.email.toLowerCase(),
        password: formData.password,
      }, { withCredentials: true });
      const { vendor } = res.data.data;
      dispatch(setVendor(vendor));
      const fullName = vendor.fullName || "";
      const firstName = fullName.split(" ")[0];
      const firstLetter = firstName?.charAt(0).toUpperCase() || "";
      const profilePic = vendor.profilePicture || "";
      localStorage.setItem("VendorCurrentlyLoggedIn", "true");
      localStorage.setItem("VendorFullName", fullName);
      localStorage.setItem("VendorFirstName", firstName);
      localStorage.setItem("VendorInitial", firstLetter);
      if (profilePic) localStorage.setItem("VendorProfilePic", profilePic);
      localStorage.setItem("vendorId", vendor._id);
      window.dispatchEvent(new Event("userLoggedIn"));
      setStep("success");
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setErrorMsg(msg === "User does not exist" ? "Please register before login." : `Login failed: ${msg}`);
    } finally {
      setLoginLoading(false);
    }
  }

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

    .vl-overlay {
      position: fixed; inset: 0; z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      background: rgba(15,10,40,0.55);
      backdrop-filter: blur(6px);
      padding: 16px;
    }
    .vl-modal {
      display: flex; width: 100%; max-width: 820px;
      max-height: 90vh; border-radius: 20px; overflow: hidden;
      box-shadow: 0 24px 80px rgba(180,83,9,0.25);
      animation: vl-pop 0.45s cubic-bezier(0.22,1,0.36,1) both;
      font-family: 'Poppins', sans-serif;
    }
    @keyframes vl-pop {
      from { transform: scale(0.92) translateY(20px); opacity: 0; }
      to   { transform: scale(1) translateY(0); opacity: 1; }
    }

    /* LEFT PANEL */
    .vl-left {
      flex: 1; position: relative; overflow: hidden;
      background: linear-gradient(135deg, #fde68a 0%, #fbbf24 45%, #d97706 100%);
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 36px 32px;
    }
    /* animated gradient orbs */
    .vl-orb {
      position:absolute;border-radius:50%;pointer-events:none;filter:blur(40px);
    }
    .vl-orb1 {
      width:280px;height:280px;
      background:radial-gradient(circle,rgba(217,119,6,0.55) 0%,transparent 70%);
      top:-80px;right:-80px;
      animation:vl-orb-move1 9s ease-in-out infinite;
    }
    .vl-orb2 {
      width:220px;height:220px;
      background:radial-gradient(circle,rgba(180,83,9,0.45) 0%,transparent 70%);
      bottom:-60px;left:-60px;
      animation:vl-orb-move2 11s ease-in-out infinite;
    }
    .vl-orb3 {
      width:140px;height:140px;
      background:radial-gradient(circle,rgba(252,211,77,0.3) 0%,transparent 70%);
      top:45%;left:30%;
      animation:vl-orb-move3 7s ease-in-out infinite;
    }
    @keyframes vl-orb-move1{0%,100%{transform:translate(0,0)}50%{transform:translate(-30px,25px)}}
    @keyframes vl-orb-move2{0%,100%{transform:translate(0,0)}50%{transform:translate(25px,-20px)}}
    @keyframes vl-orb-move3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-15px,15px) scale(1.15)}}

    /* mesh grid overlay */
    .vl-grid {
      position:absolute;inset:0;pointer-events:none;z-index:0;
      background-image:
        linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),
        linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px);
      background-size:36px 36px;
      mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%);
    }

    /* floating particles */
    .vl-particle {
      position:absolute;border-radius:50%;pointer-events:none;
      background:rgba(69,26,3,0.35);
      animation:vl-float-up linear infinite;
    }
    .vl-p1{width:3px;height:3px;left:15%;animation-duration:6s;animation-delay:0s}
    .vl-p2{width:2px;height:2px;left:35%;animation-duration:8s;animation-delay:1.5s}
    .vl-p3{width:4px;height:4px;left:55%;animation-duration:7s;animation-delay:3s}
    .vl-p4{width:2px;height:2px;left:75%;animation-duration:9s;animation-delay:0.8s}
    .vl-p5{width:3px;height:3px;left:88%;animation-duration:6.5s;animation-delay:2.2s}
    .vl-p6{width:2px;height:2px;left:25%;animation-duration:10s;animation-delay:4s}
    @keyframes vl-float-up{
      0%{bottom:-10px;opacity:0}
      10%{opacity:0.7}
      90%{opacity:0.3}
      100%{bottom:105%;opacity:0}
    }

    /* monogram */
    .vl-monogram {
      width:58px;height:58px;border-radius:16px;
      background:rgba(255,255,255,0.85);
      border:1px solid rgba(255,255,255,0.4);
      display:flex;align-items:center;justify-content:center;
      position:relative;z-index:2;margin-bottom:20px;
      animation:vl-logo-glow 3s ease-in-out infinite;
      overflow:hidden;
    }
    .vl-monogram img {
      width:80%;height:80%;object-fit:contain;
    }
    .vl-monogram::after {
      content:'';position:absolute;inset:-1px;border-radius:16px;
      background:linear-gradient(135deg,rgba(252,211,77,0.5),transparent,rgba(180,83,9,0.4));
      z-index:-1;animation:vl-border-spin 4s linear infinite;
    }
    @keyframes vl-logo-glow{
      0%,100%{box-shadow:0 0 20px rgba(217,119,6,0.4),0 0 40px rgba(217,119,6,0.2)}
      50%{box-shadow:0 0 30px rgba(252,211,77,0.6),0 0 60px rgba(217,119,6,0.3)}
    }
    @keyframes vl-border-spin{
      0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}
    }

    /* headline with gradient */
    .vl-left-headline {
      font-size:26px;font-weight:700;line-height:1.25;margin-bottom:12px;
      position:relative;z-index:2;
      background:linear-gradient(135deg,#451a03 30%,#7c2d12 100%);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    }
    .vl-left-sub {
      font-size:12.5px;color:rgba(69,26,3,0.75);line-height:1.7;
      position:relative;z-index:2;max-width:260px;
    }

    /* stat cards */
    .vl-stats {
      display:flex;flex-direction:column;gap:8px;
      position:relative;z-index:2;margin:20px 0;
    }
    .vl-stat {
      display:flex;align-items:center;gap:12px;
      padding:10px 14px;border-radius:12px;
      background:rgba(255,255,255,0.4);
      border:1px solid rgba(120,53,15,0.15);
      backdrop-filter:blur(8px);
      animation:vl-stat-in 0.5s both;
      transition:background 0.3s,border 0.3s;
    }
    .vl-stat:hover{background:rgba(255,255,255,0.6);border-color:rgba(120,53,15,0.25)}
    .vl-stat:nth-child(1){animation-delay:0.5s}
    .vl-stat:nth-child(2){animation-delay:0.65s}
    .vl-stat:nth-child(3){animation-delay:0.8s}
    @keyframes vl-stat-in{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
    .vl-stat-icon {
      width:34px;height:34px;border-radius:9px;flex-shrink:0;
      display:flex;align-items:center;justify-content:center;font-size:16px;
    }
    .vl-stat-icon.bk{background:rgba(217,119,6,0.3)}
    .vl-stat-icon.cu{background:rgba(16,185,129,0.25)}
    .vl-stat-icon.an{background:rgba(245,158,11,0.25)}
    .vl-stat-body { flex:1;min-width:0; }
    .vl-stat-label{font-size:10px;color:rgba(69,26,3,0.65);font-weight:500;letter-spacing:0.3px}
    .vl-stat-val{font-size:15px;font-weight:700;color:#451a03;line-height:1.2}
    .vl-stat-dot {
      width:7px;height:7px;border-radius:50%;flex-shrink:0;
      animation:vl-blink 2s ease-in-out infinite;
    }
    .vl-stat-dot.green{background:#10b981}
    .vl-stat-dot.blue{background:#eab308}
    .vl-stat-dot.amber{background:#f59e0b}
    @keyframes vl-blink{0%,100%{opacity:1}50%{opacity:0.3}}

    /* bottom tag */
    .vl-bottom-tag {
      display:flex;align-items:center;gap:8px;
      position:relative;z-index:2;
    }
    .vl-tag-line{flex:1;height:1px;background:rgba(69,26,3,0.2)}
    .vl-tag-text{
      font-size:10px;color:rgba(69,26,3,0.55);font-weight:500;
      letter-spacing:1.2px;text-transform:uppercase;white-space:nowrap;
    }

    /* RIGHT PANEL */
    .vl-right {
      flex: 1; background: #FAFAFA; padding: 32px 36px;
      display: flex; flex-direction: column; justify-content: center;
      position: relative; overflow-y: auto;
      animation: vl-slide-in 0.5s 0.1s cubic-bezier(0.22,1,0.36,1) both;
    }
    @keyframes vl-slide-in {
      from { transform: translateX(40px); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }
    .vl-close {
      position:absolute;top:14px;right:16px;
      background:none;border:none;cursor:pointer;
      color:#9ca3af;font-size:20px;
      transition:color 0.2s,transform 0.2s;
      display:flex;align-items:center;justify-content:center;
    }
    .vl-close:hover { color:#ef4444; transform:rotate(90deg) scale(1.1); }
    .vl-portal-badge {
      display:inline-flex;align-items:center;gap:5px;
      padding:4px 12px;border-radius:50px;
      background:#fef3c7;color:#78350f;
      font-size:11px;font-weight:600;margin-bottom:16px;width:fit-content;
      animation:vl-fade-up 0.4s 0.25s both;
    }
    .vl-title { font-size:24px;font-weight:700;color:#111827;margin-bottom:4px;animation:vl-fade-up 0.4s 0.3s both; }
    .vl-subtitle { font-size:12.5px;color:#6b7280;margin-bottom:22px;animation:vl-fade-up 0.4s 0.35s both; }
    @keyframes vl-fade-up {
      from{opacity:0;transform:translateY(10px)}
      to{opacity:1;transform:translateY(0)}
    }

    /* METHOD LABEL */
    .vl-method-label {
      font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;
      color:#9ca3af;margin-bottom:10px;
    }

    /* PHONE ROW */
    .vl-phone-row { display:flex;flex-direction:column;gap:8px;animation:vl-fade-up 0.4s 0.4s both; }
    .vl-phone-top { display:flex;gap:8px;align-items:center; }
    .vl-flag-select {
      padding:11px 12px;border-radius:12px;border:1.5px solid #e5e7eb;
      background:#fff;font-size:13px;color:#374151;cursor:pointer;
      outline:none;transition:border 0.2s,box-shadow 0.2s;width:96px;flex-shrink:0;
      font-family:'Poppins',sans-serif;
    }
    .vl-flag-select:focus { border-color:#d97706;box-shadow:0 0 0 3px rgba(217,119,6,0.1); }
    .vl-phone-input {
      flex:1;padding:11px 16px;border-radius:12px;border:1.5px solid #e5e7eb;
      background:#fff;font-size:13px;font-family:'Poppins',sans-serif;
      color:#111827;outline:none;transition:border 0.2s,box-shadow 0.2s;
    }
    .vl-phone-input:focus { border-color:#d97706;box-shadow:0 0 0 3px rgba(217,119,6,0.1); }
    .vl-otp-btn {
      width:100%;padding:11px;border-radius:12px;border:none;
      background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;
      font-size:13px;font-weight:600;font-family:'Poppins',sans-serif;
      cursor:pointer;letter-spacing:0.3px;
      transition:transform 0.2s,box-shadow 0.2s;position:relative;overflow:hidden;
    }
    .vl-otp-btn:hover { transform:translateY(-2px);box-shadow:0 6px 18px rgba(217,119,6,0.32); }
    .vl-otp-btn:active { transform:scale(0.97); }

    /* OR DIVIDER */
    .vl-divider { display:flex;align-items:center;gap:10px;margin:14px 0;animation:vl-fade-up 0.4s 0.48s both; }
    .vl-divider-line { flex:1;height:1px;background:#e5e7eb; }
    .vl-divider-text {
      font-size:11px;color:#9ca3af;font-weight:500;
      padding:3px 10px;border-radius:50px;border:1px solid #e5e7eb;background:#fff;
    }

    /* FLOATING LABEL FIELDS */
    .vl-field { position:relative;margin-bottom:12px;animation:vl-fade-up 0.4s 0.52s both; }
    .vl-field:nth-child(2) { animation-delay:0.56s; }
    .vl-field input {
      width:100%;padding:22px 16px 8px;border-radius:12px;
      border:1.5px solid #e5e7eb;background:#fff;
      font-size:14px;font-family:'Poppins',sans-serif;
      color:#111827;outline:none;
      transition:border 0.2s,box-shadow 0.2s;
      box-sizing:border-box;
    }
    .vl-field input:focus { border-color:#d97706;box-shadow:0 0 0 3px rgba(217,119,6,0.1); }
    .vl-field label {
      position:absolute;left:16px;top:50%;transform:translateY(-50%);
      font-size:13px;color:#9ca3af;pointer-events:none;
      transition:all 0.18s ease;font-family:'Poppins',sans-serif;
    }
    .vl-field input:focus ~ label,
    .vl-field input:not(:placeholder-shown) ~ label {
      top:10px;transform:none;font-size:10px;color:#d97706;font-weight:600;letter-spacing:0.3px;
    }
    .vl-field input::placeholder { color:transparent; }
    .vl-eye {
      position:absolute;right:14px;top:50%;transform:translateY(-50%);
      background:none;border:none;cursor:pointer;
      color:#9ca3af;font-size:17px;
      transition:color 0.2s;display:flex;align-items:center;
    }
    .vl-eye:hover { color:#d97706; }

    /* FORGOT */
    .vl-forgot { text-align:right;margin:-4px 0 12px;animation:vl-fade-up 0.4s 0.58s both; }
    .vl-forgot span {
      font-size:12px;color:#d97706;cursor:pointer;font-weight:500;
      transition:color 0.2s;
    }
    .vl-forgot span:hover { color:#b45309;text-decoration:underline; }

    /* LOGIN BUTTON */
    .vl-login-btn {
      width:100%;padding:11px;border-radius:50px;border:none;
      background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;
      font-size:14px;font-weight:600;font-family:'Poppins',sans-serif;
      cursor:pointer;position:relative;overflow:hidden;
      display:flex;align-items:center;justify-content:center;gap:8px;
      transition:transform 0.2s,box-shadow 0.2s;
      animation:vl-fade-up 0.4s 0.6s both;
    }
    .vl-login-btn:hover { transform:translateY(-2px);box-shadow:0 8px 22px rgba(217,119,6,0.35); }
    .vl-login-btn:active { transform:scale(0.98); }
    .vl-shimmer {
      position:absolute;top:0;left:-100%;width:55%;height:100%;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);
      transform:skewX(-15deg);
      animation:vl-shimmer 2.4s infinite;
    }
    @keyframes vl-shimmer { 0%{left:-100%} 60%,100%{left:150%} }
    .vl-spinner {
      width:15px;height:15px;
      border:2px solid rgba(255,255,255,0.35);border-top-color:#fff;
      border-radius:50%;animation:vl-spin 0.7s linear infinite;
    }
    @keyframes vl-spin { to{transform:rotate(360deg)} }

    /* SIGNUP LINE */
    .vl-signup { text-align:center;font-size:12.5px;color:#6b7280;margin-top:12px;animation:vl-fade-up 0.4s 0.65s both; }
    .vl-signup span {
      background:linear-gradient(135deg,#b45309,#d97706);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      font-weight:600;cursor:pointer;
    }
    .vl-signup span:hover { text-decoration:underline;text-decoration-color:#d97706; }

    /* ERROR */
    .vl-error { color:#dc2626;font-size:12px;text-align:center;font-weight:500;margin-bottom:8px;animation:vl-fade-up 0.3s both; }

    /* MOBILE */
    @media(max-width:640px){
      .vl-overlay { padding:10px; }
      .vl-modal { flex-direction:column;max-height:94vh;overflow-y:auto; }
      .vl-left { padding:18px 20px 14px;flex-direction:row;align-items:center;gap:12px;flex-wrap:wrap;min-height:unset; }
      .vl-monogram { width:40px;height:40px;font-size:14px;margin-bottom:0;flex-shrink:0; }
      .vl-left-headline { font-size:14px;margin-bottom:0; }
      .vl-left-sub,.vl-stats,.vl-bottom-tag { display:none; }
      .vl-right { padding:22px 18px 18px; }
      .vl-title { font-size:19px; }
      .vl-subtitle { margin-bottom:16px; }
      .vl-field { margin-bottom:10px; }
      .vl-close { top:10px;right:12px;font-size:18px; }
    }
    @media(max-width:380px){
      .vl-right { padding:18px 14px 16px; }
      .vl-title { font-size:17px; }
      .vl-portal-badge { font-size:10px;padding:3px 10px; }
      .vl-field input { padding:20px 12px 7px;font-size:13px; }
      .vl-flag-select { width:82px;padding:10px; }
    }
  `;

  const renderStep = () => {
    if (step === "success")
      return ReactDOM.createPortal(
        <SuccessBlock showSuccessIcon={showSuccessIcon} />,
        document.body
      );
    if (step === "otp") return (
      <OTPVerificationEmail setStep={setStep} onClose={onClose} emailOtp={formData.emailOtp} type="vendor" />
    );
    if (step === "form") return (
      <div style={{ width: "100%" }}>
        {/* Email OTP section */}
        <div className="vl-method-label">via email otp </div>
        <div className="vl-phone-row">
          <div className="vl-phone-top">
            <div className="vl-flag-select">
              Email otp
            </div>
            <input
              type="email"
              name="emailOtp"
              placeholder="Email Address"
              value={formData.emailOtp}
              onChange={handleChange}
              className="vl-phone-input"
            />
          </div>
         <button
  type="button"
  onClick={handleGetOTP}
  className="vl-otp-btn"
  disabled={sendingOtp}
>
  {sendingOtp ? "Sending OTP..." : "Send OTP"}
</button>
        </div>

        {/* Divider */}
        <div className="vl-divider">
          <div className="vl-divider-line" />
          <div className="vl-divider-text">or</div>
          <div className="vl-divider-line" />
        </div>

        {/* Credentials section */}
        <div className="vl-method-label">via credentials</div>
        <form onSubmit={handleLogin}>
          <div className="vl-field">
            <input
              type="email"
              name="email"
              id="vl-email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
            />
            <label htmlFor="vl-email">Email Address</label>
          </div>
          <div className="vl-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="vl-password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              required
              style={{ paddingRight: "42px" }}
            />
            <label htmlFor="vl-password">Password</label>
            <button
              type="button"
              className="vl-eye"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="vl-forgot">
            <span onClick={() => setShowForgotModal(true)}>Forgot password?</span>
          </div>

          {errorMsg && <p className="vl-error">{errorMsg}</p>}

          <button type="submit" className="vl-login-btn" disabled={loginLoading}>
            <div className="vl-shimmer" />
            <span>{loginLoading ? "Signing in…" : "Login"}</span>
            {loginLoading && <div className="vl-spinner" />}
          </button>
        </form>

        <p className="vl-signup">
          Don't have an account?{" "}
          <span onClick={() => { onClose(); navigate("/vendor/register"); }}>Sign Up</span>
        </p>
      </div>
    );
    return null;
  };

  const modalContent = (
    <>
      <style>{styles}</style>
      <div className="vl-overlay" onClick={onClose}>
        <div className="vl-modal" onClick={(e) => e.stopPropagation()}>

          {/* LEFT PANEL */}
          <div className="vl-left">
            {/* background layers */}
            <div className="vl-orb vl-orb1" />
            <div className="vl-orb vl-orb2" />
            <div className="vl-orb vl-orb3" />
            <div className="vl-grid" />
            {/* floating particles */}
            <div className="vl-particle vl-p1" />
            <div className="vl-particle vl-p2" />
            <div className="vl-particle vl-p3" />
            <div className="vl-particle vl-p4" />
            <div className="vl-particle vl-p5" />
            <div className="vl-particle vl-p6" />

            {/* top content */}
            <div>
              <div className="vl-monogram">
                <img src={EventsBridgeLogo} alt="EventsBridge Logo" />
              </div>
              <div className="vl-left-headline">Welcome Back,<br />Partner</div>
              <div className="vl-left-sub">Manage your services, bookings, and customers — all from one place.</div>
            </div>

            {/* stat cards */}
            <div className="vl-stats">
              <div className="vl-stat">
                <div className="vl-stat-icon bk">📅</div>
                <div className="vl-stat-body">
                  <div className="vl-stat-label">Active Bookings</div>
                  <div className="vl-stat-val">24 today</div>
                </div>
                <div className="vl-stat-dot green" />
              </div>
              <div className="vl-stat">
                <div className="vl-stat-icon cu">👥</div>
                <div className="vl-stat-body">
                  <div className="vl-stat-label">New Customers</div>
                  <div className="vl-stat-val">+138 this week</div>
                </div>
                <div className="vl-stat-dot blue" />
              </div>
              <div className="vl-stat">
                <div className="vl-stat-icon an">📊</div>
                <div className="vl-stat-body">
                  <div className="vl-stat-label">Revenue Growth</div>
                  <div className="vl-stat-val">↑ 32% this month</div>
                </div>
                <div className="vl-stat-dot amber" />
              </div>
            </div>

            {/* bottom tag */}
            <div className="vl-bottom-tag">
              <div className="vl-tag-line" />
              <div className="vl-tag-text">EventsBridge Partner Platform</div>
              <div className="vl-tag-line" />
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="vl-right">
            <button className="vl-close" onClick={onClose} aria-label="Close"><RxCross2 /></button>
            <div className="vl-portal-badge">🏪 Partner Portal</div>
            <div className="vl-title">Sign In</div>
            <div className="vl-subtitle">Choose how you'd like to continue</div>
            {renderStep()}
          </div>
        </div>

        {showForgotModal && (
          <div onClick={(e) => e.stopPropagation()}>
            <VendorForgotPass onClose={() => setShowForgotModal(false)} />
          </div>
        )}
      </div>
    </>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

VendorLogin.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSwitchToLogin: PropTypes.func,
};

export default VendorLogin;

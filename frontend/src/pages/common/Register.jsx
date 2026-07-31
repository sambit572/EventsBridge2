// Register.jsx
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/UserSlice.js";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import SuccessBlock from "./SuccessBlock.jsx";
import EventsBridgeLogo from "../../assets/EventsBridgeOnlyLogo.webp";

const Register = ({ onClose, onSwitchToLogin }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNo: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [step, setStep] = useState("form"); // form or success
  const [showSuccessIcon, setShowSuccessIcon] = useState(false);

  // Show success icon and auto-close modal
  useEffect(() => {
    if (step === "success") {
      setShowSuccessIcon(false);
      const iconTimer = setTimeout(() => setShowSuccessIcon(true), 500);
      const closeTimer = setTimeout(() => onClose?.(), 5000);
      return () => {
        clearTimeout(iconTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [step, onClose]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Client-side validation
    if (!formData.fullName.trim()) return setErrorMsg("Full name is required.");
    if (!formData.email.trim()) return setErrorMsg("Email is required.");
    if (!formData.phoneNo.trim() || formData.phoneNo.length !== 10)
      return setErrorMsg("Enter a valid 10-digit phone number.");
    if (formData.password.length < 8)
      return setErrorMsg("Password must be at least 8 characters long.");
    if (formData.password !== confirmPassword)
      return setErrorMsg("Passwords do not match.");

    try {
      setLoading(true);
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.post(
        `${BACKEND_URL}/user/signup`,
        formData,
        { withCredentials: true }
      );

      if (response?.data?.statusCode === 400 || response?.data?.message === "User already exists") {
        setErrorMsg("User already exists. Please log in.");
        setLoading(false);
        return;
      }

      const { user } = response?.data?.data;

      // Save user to Redux & localStorage
      dispatch(setUser(user));
      localStorage.setItem(
        "userFirstName",
        user?.fullName?.split(" ")[0] || ""
      );
      localStorage.setItem("currentlyLoggedIn", "true");

      // Notify other components & show success
      window.dispatchEvent(new Event("userLoggedIn"));
      setStep("success");
    } catch (error) {
      console.error("Registration error:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong during registration.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

    .ur-overlay {
      position: fixed; inset: 0; z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      background: rgba(15,10,40,0.55);
      -webkit-backdrop-filter: blur(6px);
      backdrop-filter: blur(6px);
      padding: 16px;
    }
    .ur-modal {
      display: flex; width: 100%; max-width: 820px;
      max-height: 90vh; max-height: 90dvh; border-radius: 20px; overflow: hidden;
      box-shadow: 0 24px 80px rgba(180,83,9,0.25);
      animation: ur-pop 0.45s cubic-bezier(0.22,1,0.36,1) both;
      font-family: 'Poppins', sans-serif;
    }
    @keyframes ur-pop {
      from { transform: scale(0.92) translateY(20px); opacity: 0; }
      to   { transform: scale(1) translateY(0); opacity: 1; }
    }

    /* LEFT PANEL */
    .ur-left {
      flex: 1; position: relative; overflow: hidden;
      background: linear-gradient(135deg, #fde68a 0%, #fbbf24 45%, #d97706 100%);
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 36px 32px;
    }
    .ur-orb {
      position:absolute;border-radius:50%;pointer-events:none;filter:blur(40px);
    }
    .ur-orb1 {
      width:280px;height:280px;
      background:radial-gradient(circle,rgba(217,119,6,0.55) 0%,transparent 70%);
      top:-80px;right:-80px;
      animation:ur-orb-move1 9s ease-in-out infinite;
    }
    .ur-orb2 {
      width:220px;height:220px;
      background:radial-gradient(circle,rgba(180,83,9,0.45) 0%,transparent 70%);
      bottom:-60px;left:-60px;
      animation:ur-orb-move2 11s ease-in-out infinite;
    }
    .ur-orb3 {
      width:140px;height:140px;
      background:radial-gradient(circle,rgba(252,211,77,0.3) 0%,transparent 70%);
      top:45%;left:30%;
      animation:ur-orb-move3 7s ease-in-out infinite;
    }
    @keyframes ur-orb-move1{0%,100%{transform:translate(0,0)}50%{transform:translate(-30px,25px)}}
    @keyframes ur-orb-move2{0%,100%{transform:translate(0,0)}50%{transform:translate(25px,-20px)}}
    @keyframes ur-orb-move3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-15px,15px) scale(1.15)}}

    .ur-grid {
      position:absolute;inset:0;pointer-events:none;z-index:0;
      background-image:
        linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),
        linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px);
      background-size:36px 36px;
      mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%);
    }

    .ur-particle {
      position:absolute;border-radius:50%;pointer-events:none;
      background:rgba(69,26,3,0.35);
      animation:ur-float-up linear infinite;
    }
    .ur-p1{width:3px;height:3px;left:15%;animation-duration:6s;animation-delay:0s}
    .ur-p2{width:2px;height:2px;left:35%;animation-duration:8s;animation-delay:1.5s}
    .ur-p3{width:4px;height:4px;left:55%;animation-duration:7s;animation-delay:3s}
    .ur-p4{width:2px;height:2px;left:75%;animation-duration:9s;animation-delay:0.8s}
    .ur-p5{width:3px;height:3px;left:88%;animation-duration:6.5s;animation-delay:2.2s}
    .ur-p6{width:2px;height:2px;left:25%;animation-duration:10s;animation-delay:4s}
    @keyframes ur-float-up{
      0%{bottom:-10px;opacity:0}
      10%{opacity:0.7}
      90%{opacity:0.3}
      100%{bottom:105%;opacity:0}
    }

    .ur-monogram {
      width:58px;height:58px;border-radius:16px;
      background:rgba(255,255,255,0.85);
      border:1px solid rgba(255,255,255,0.4);
      display:flex;align-items:center;justify-content:center;
      position:relative;z-index:2;margin-bottom:20px;
      animation:ur-logo-glow 3s ease-in-out infinite;
      overflow:hidden;
    }
    .ur-monogram img {
      width:80%;height:80%;object-fit:contain;
    }
    .ur-monogram::after {
      content:'';position:absolute;inset:-1px;border-radius:16px;
      background:linear-gradient(135deg,rgba(252,211,77,0.5),transparent,rgba(180,83,9,0.4));
      z-index:-1;animation:ur-border-spin 4s linear infinite;
    }
    @keyframes ur-logo-glow{
      0%,100%{box-shadow:0 0 20px rgba(217,119,6,0.4),0 0 40px rgba(217,119,6,0.2)}
      50%{box-shadow:0 0 30px rgba(252,211,77,0.6),0 0 60px rgba(217,119,6,0.3)}
    }
    @keyframes ur-border-spin{
      0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}
    }

    .ur-left-headline {
      font-size:26px;font-weight:700;line-height:1.25;margin-bottom:12px;
      position:relative;z-index:2;
      background:linear-gradient(135deg,#451a03 30%,#7c2d12 100%);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    }
    .ur-left-sub {
      font-size:12.5px;color:rgba(69,26,3,0.75);line-height:1.7;
      position:relative;z-index:2;max-width:260px;
    }

    .ur-stats {
      display:flex;flex-direction:column;gap:8px;
      position:relative;z-index:2;margin:20px 0;
    }
    .ur-stat {
      display:flex;align-items:center;gap:12px;
      padding:10px 14px;border-radius:12px;
      background:rgba(255,255,255,0.4);
      border:1px solid rgba(120,53,15,0.15);
      backdrop-filter:blur(8px);
      animation:ur-stat-in 0.5s both;
      transition:background 0.3s,border 0.3s;
    }
    .ur-stat:hover{background:rgba(255,255,255,0.6);border-color:rgba(120,53,15,0.25)}
    .ur-stat:nth-child(1){animation-delay:0.5s}
    .ur-stat:nth-child(2){animation-delay:0.65s}
    .ur-stat:nth-child(3){animation-delay:0.8s}
    @keyframes ur-stat-in{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
    .ur-stat-icon {
      width:34px;height:34px;border-radius:9px;flex-shrink:0;
      display:flex;align-items:center;justify-content:center;font-size:16px;
    }
    .ur-stat-icon.bk{background:rgba(217,119,6,0.3)}
    .ur-stat-icon.cu{background:rgba(16,185,129,0.25)}
    .ur-stat-icon.an{background:rgba(245,158,11,0.25)}
    .ur-stat-body { flex:1;min-width:0; }
    .ur-stat-label{font-size:10px;color:rgba(69,26,3,0.65);font-weight:500;letter-spacing:0.3px}
    .ur-stat-val{font-size:15px;font-weight:700;color:#451a03;line-height:1.2}
    .ur-stat-dot {
      width:7px;height:7px;border-radius:50%;flex-shrink:0;
      animation:ur-blink 2s ease-in-out infinite;
    }
    .ur-stat-dot.green{background:#10b981}
    .ur-stat-dot.blue{background:#eab308}
    .ur-stat-dot.amber{background:#f59e0b}
    @keyframes ur-blink{0%,100%{opacity:1}50%{opacity:0.3}}

    .ur-bottom-tag {
      display:flex;align-items:center;gap:8px;
      position:relative;z-index:2;
    }
    .ur-tag-line{flex:1;height:1px;background:rgba(69,26,3,0.2)}
    .ur-tag-text{
      font-size:10px;color:rgba(69,26,3,0.55);font-weight:500;
      letter-spacing:1.2px;text-transform:uppercase;white-space:nowrap;
    }

    /* RIGHT PANEL */
    .ur-right {
      flex: 1; background: #FAFAFA; padding: 32px 36px;
      display: flex; flex-direction: column; justify-content: center;
      position: relative; overflow-y: auto;
      animation: ur-slide-in 0.5s 0.1s cubic-bezier(0.22,1,0.36,1) both;
    }
    @keyframes ur-slide-in {
      from { transform: translateX(40px); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }
    .ur-close {
      position:absolute;top:14px;right:16px;
      background:none;border:none;cursor:pointer;
      color:#9ca3af;font-size:20px;
      transition:color 0.2s,transform 0.2s;
      display:flex;align-items:center;justify-content:center;
    }
    .ur-close:hover { color:#ef4444; transform:rotate(90deg) scale(1.1); }
    .ur-portal-badge {
      display:inline-flex;align-items:center;gap:5px;
      padding:4px 12px;border-radius:50px;
      background:#fef3c7;color:#78350f;
      font-size:11px;font-weight:600;margin-bottom:16px;width:fit-content;
      animation:ur-fade-up 0.4s 0.25s both;
    }
    .ur-title { font-size:24px;font-weight:700;color:#111827;margin-bottom:4px;animation:ur-fade-up 0.4s 0.3s both; }
    .ur-subtitle { font-size:12.5px;color:#6b7280;margin-bottom:22px;animation:ur-fade-up 0.4s 0.35s both; }
    @keyframes ur-fade-up {
      from{opacity:0;transform:translateY(10px)}
      to{opacity:1;transform:translateY(0)}
    }

    .ur-field { position:relative;margin-bottom:12px;animation:ur-fade-up 0.4s 0.4s both; }
    .ur-field:nth-child(2) { animation-delay:0.44s; }
    .ur-field:nth-child(3) { animation-delay:0.48s; }
    .ur-field:nth-child(4) { animation-delay:0.52s; }
    .ur-field:nth-child(5) { animation-delay:0.56s; }
    .ur-field input {
      width:100%;padding:22px 16px 8px;border-radius:12px;
      border:1.5px solid #e5e7eb;background:#fff;
      font-size:14px;font-family:'Poppins',sans-serif;
      color:#111827;outline:none;
      transition:border 0.2s,box-shadow 0.2s;
      box-sizing:border-box;
    }
    .ur-field input:focus { border-color:#d97706;box-shadow:0 0 0 3px rgba(217,119,6,0.1); }
    .ur-field label {
      position:absolute;left:16px;top:50%;transform:translateY(-50%);
      font-size:13px;color:#9ca3af;pointer-events:none;
      transition:all 0.18s ease;font-family:'Poppins',sans-serif;
    }
    .ur-field input:focus ~ label,
    .ur-field input:not(:placeholder-shown) ~ label {
      top:10px;transform:none;font-size:10px;color:#d97706;font-weight:600;letter-spacing:0.3px;
    }
    .ur-field input::placeholder { color:transparent; }
    .ur-eye {
      position:absolute;right:14px;top:50%;transform:translateY(-50%);
      background:none;border:none;cursor:pointer;
      color:#9ca3af;font-size:17px;
      transition:color 0.2s;display:flex;align-items:center;
    }
    .ur-eye:hover { color:#d97706; }

    .ur-signup-btn {
      width:100%;padding:11px;border-radius:50px;border:none;
      background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;
      font-size:14px;font-weight:600;font-family:'Poppins',sans-serif;
      cursor:pointer;position:relative;overflow:hidden;
      display:flex;align-items:center;justify-content:center;gap:8px;
      transition:transform 0.2s,box-shadow 0.2s;
      animation:ur-fade-up 0.4s 0.62s both;
      margin-top: 4px;
    }
    .ur-signup-btn:disabled { opacity:0.7;cursor:not-allowed; }
    .ur-signup-btn:not(:disabled):hover { transform:translateY(-2px);box-shadow:0 8px 22px rgba(217,119,6,0.35); }
    .ur-signup-btn:not(:disabled):active { transform:scale(0.98); }
    .ur-shimmer {
      position:absolute;top:0;left:-100%;width:55%;height:100%;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);
      transform:skewX(-15deg);
      animation:ur-shimmer 2.4s infinite;
    }
    @keyframes ur-shimmer { 0%{left:-100%} 60%,100%{left:150%} }

    .ur-login-line { text-align:center;font-size:12.5px;color:#6b7280;margin-top:12px;animation:ur-fade-up 0.4s 0.66s both; }
    .ur-login-line span {
      background:linear-gradient(135deg,#b45309,#d97706);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      font-weight:600;cursor:pointer;
    }
    .ur-login-line span:hover { text-decoration:underline;text-decoration-color:#d97706; }

    .ur-error { color:#dc2626;font-size:12px;text-align:center;font-weight:500;margin-bottom:8px;animation:ur-fade-up 0.3s both; }

    @media(max-width:640px){
      .ur-overlay { padding:10px; }
      .ur-modal { flex-direction:column;max-height:94vh;max-height:94dvh;overflow-y:auto;-webkit-overflow-scrolling:touch; }
      .ur-left { padding:16px 20px 12px;flex-direction:row;align-items:center;gap:12px;flex-wrap:wrap;min-height:unset; }
      .ur-monogram { width:38px;height:38px;font-size:14px;margin-bottom:0;flex-shrink:0; }
      .ur-left-headline { font-size:14px;margin-bottom:0; }
      .ur-left-sub,.ur-stats,.ur-bottom-tag { display:none; }
      .ur-right { padding:20px 18px 16px; }
      .ur-title { font-size:19px; }
      .ur-subtitle { margin-bottom:14px; }
      .ur-field { margin-bottom:9px; }
      .ur-field input { padding:19px 14px 6px; }
      .ur-close { top:10px;right:12px;font-size:18px; }
    }
    @media(max-width:380px){
      .ur-right { padding:16px 14px 14px; }
      .ur-title { font-size:17px; }
      .ur-portal-badge { font-size:10px;padding:3px 10px;margin-bottom:12px; }
      .ur-field input { padding:18px 12px 5px;font-size:13px; }
    }
  `;

  const renderStep = () => {
    if (step === "success") {
      return createPortal(
        <SuccessBlock showIcon={showSuccessIcon} onClose={onClose} />,
        document.body
      );
    }
    return (
      <form onSubmit={handleRegister}>
        <div className="ur-field">
          <input
            type="text"
            name="fullName"
            id="ur-fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <label htmlFor="ur-fullName">Full Name</label>
        </div>

        <div className="ur-field">
          <input
            type="email"
            name="email"
            id="ur-email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <label htmlFor="ur-email">Email Address</label>
        </div>

        <div className="ur-field">
          <input
            type="number"
            name="phoneNo"
            id="ur-phoneNo"
            placeholder="Phone Number"
            value={formData.phoneNo}
            onChange={handleChange}
            required
          />
          <label htmlFor="ur-phoneNo">Phone Number</label>
        </div>

        <div className="ur-field">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="ur-password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            minLength={8}
            required
            style={{ paddingRight: "42px" }}
          />
          <label htmlFor="ur-password">Password</label>
          <button
            type="button"
            className="ur-eye"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        <div className="ur-field">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            id="ur-confirmPassword"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
            style={{ paddingRight: "42px" }}
          />
          <label htmlFor="ur-confirmPassword">Confirm Password</label>
          <button
            type="button"
            className="ur-eye"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label="Toggle confirm password visibility"
          >
            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        {errorMsg && <p className="ur-error">{errorMsg}</p>}

        <button type="submit" disabled={loading} className="ur-signup-btn">
          <div className="ur-shimmer" />
          <span>{loading ? "Creating Account…" : "Create Account"}</span>
        </button>

        <p className="ur-login-line">
          Already have an account?{" "}
          <span onClick={onSwitchToLogin}>Log in</span>
        </p>
      </form>
    );
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ur-overlay" onClick={onClose}>
        <div className="ur-modal" onClick={(e) => e.stopPropagation()}>
          {/* LEFT PANEL */}
          <div className="ur-left">
            <div className="ur-orb ur-orb1" />
            <div className="ur-orb ur-orb2" />
            <div className="ur-orb ur-orb3" />
            <div className="ur-grid" />
            <div className="ur-particle ur-p1" />
            <div className="ur-particle ur-p2" />
            <div className="ur-particle ur-p3" />
            <div className="ur-particle ur-p4" />
            <div className="ur-particle ur-p5" />
            <div className="ur-particle ur-p6" />

            <div>
              <div className="ur-monogram">
                <img src={EventsBridgeLogo} alt="EventsBridge Logo" />
              </div>
              <div className="ur-left-headline">Join<br />EventsBridge</div>
              <div className="ur-left-sub">
                Discover, book, and experience unforgettable event services — all in one place.
              </div>
            </div>

            <div className="ur-stats">
              <div className="ur-stat">
                <div className="ur-stat-icon bk">🎉</div>
                <div className="ur-stat-body">
                  <div className="ur-stat-label">Verified Vendors</div>
                  <div className="ur-stat-val">Handpicked for you</div>
                </div>
                <div className="ur-stat-dot green" />
              </div>
              <div className="ur-stat">
                <div className="ur-stat-icon cu">📋</div>
                <div className="ur-stat-body">
                  <div className="ur-stat-label">Easy Booking</div>
                  <div className="ur-stat-val">In just a few clicks</div>
                </div>
                <div className="ur-stat-dot blue" />
              </div>
              <div className="ur-stat">
                <div className="ur-stat-icon an">🔒</div>
                <div className="ur-stat-body">
                  <div className="ur-stat-label">Secure Payments</div>
                  <div className="ur-stat-val">100% protected</div>
                </div>
                <div className="ur-stat-dot amber" />
              </div>
            </div>

            <div className="ur-bottom-tag">
              <div className="ur-tag-line" />
              <div className="ur-tag-text">EventsBridge</div>
              <div className="ur-tag-line" />
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="ur-right">
            {onClose && (
              <button className="ur-close" onClick={onClose} aria-label="Close">
                <RxCross2 />
              </button>
            )}

            <div className="ur-portal-badge">🎈 Customer Portal</div>
            <div className="ur-title">Create Account</div>
            <div className="ur-subtitle">Sign up to start exploring events</div>

            {renderStep()}
          </div>
        </div>
      </div>
    </>
  );
};

Register.propTypes = {
  onClose: PropTypes.func,
  onSwitchToLogin: PropTypes.func,
};

export default Register;

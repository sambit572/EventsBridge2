import React, { useEffect } from "react";
import "./ThankYouModal.css";
import { IoClose } from "react-icons/io5";
import { FaPhoneAlt } from "react-icons/fa";

function ThankYouModal({ onClose }) {
  // Allow closing with the Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="ty-overlay" onClick={onClose}>
      <div className="ty-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ty-close" onClick={onClose} aria-label="Close">
          <IoClose size={20} />
        </button>

        {/* Floating confetti pieces */}
        <div className="ty-confetti" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className={`ty-confetti-piece ty-piece-${i % 7}`} />
          ))}
        </div>

        {/* Success check badge */}
        <div className="ty-check-wrap">
          <div className="ty-check-ring ty-ring-1" />
          <div className="ty-check-ring ty-ring-2" />
          <div className="ty-check-badge">
            <svg viewBox="0 0 52 52" className="ty-check-svg">
              <circle className="ty-check-circle" cx="26" cy="26" r="23" fill="none" />
              <path className="ty-check-mark" fill="none" d="M14 27l7.5 7.5L38 17.5" />
            </svg>
          </div>
        </div>

        <p className="ty-eyebrow">Request received</p>
        <h2 className="ty-title">Thank You for Your Interest!</h2>

        <p className="ty-message">
          Your verification request has been submitted successfully.
          <br />
          Our team will get in touch with you with a call
          <span className="ty-highlight"> within the next 1 hour.</span>
        </p>

        <div className="ty-call-strip">
          <span className="ty-call-icon">
            <FaPhoneAlt size={13} />
          </span>
          <span>Keep your phone handy — we're excited to get you verified!</span>
        </div>

        <button className="ty-ok-btn" onClick={onClose}>
          <span className="ty-ok-shine" />
          Got it, thanks!
        </button>
      </div>
    </div>
  );
}

export default ThankYouModal;

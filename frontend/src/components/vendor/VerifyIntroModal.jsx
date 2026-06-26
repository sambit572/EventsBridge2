import React, { useState } from "react";
import "./VerifyIntroModal.css";
import { IoClose } from "react-icons/io5";

const REASONS = [
  <>A <strong>verified badge</strong> sits right next to your name, so customers spot you first in search and category lists.</>,
  <><strong>Verified vendors convert more</strong> views into bookings — trust is the biggest reason customers hesitate.</>,
  <>Your profile gets <strong>priority placement</strong> over unverified vendors offering the same service.</>,
  <>It signals that your <strong>business identity, address, and bank details</strong> have been checked and confirmed.</>,
  <>Verified listings get a <strong>noticeable lift in click-through rate</strong> from the customer home page.</>,
];

function VerifyIntroModal({ onClose, onAgree }) {
  const [lit, setLit] = useState(false);
  const [pulled, setPulled] = useState(false);

  const handleAgree = () => {
    if (lit) return;
    setPulled(true);
    setLit(true);
    // let the glow animation play out before handing off to the pricing step
    setTimeout(() => {
      onAgree();
    }, 950);
  };

  return (
    <div className="vi-overlay" onClick={onClose}>
      <div className="vi-modal" onClick={(e) => e.stopPropagation()}>
        <button className="vi-close" onClick={onClose} aria-label="Close">
          <IoClose size={20} />
        </button>

        {/* Ambient glow that blooms once the lamp is lit */}
        <div className={`vi-ambient ${lit ? "vi-ambient-on" : ""}`} aria-hidden="true" />

        <div className="vi-lamp-zone">
          <div className="vi-ceiling-plate" aria-hidden="true" />

          <div className={`vi-cord ${pulled ? "vi-cord-pulled" : ""}`}>
            <div
              className={`vi-cord-pull ${pulled ? "vi-cord-pull-down" : ""}`}
              role="button"
              tabIndex={lit ? -1 : 0}
              aria-label="Pull the cord to agree"
              onClick={handleAgree}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleAgree();
              }}
            />
          </div>

          <div className={`vi-bulb ${lit ? "vi-bulb-on" : ""}`}>
            <div className="vi-bulb-collar" />
            <div className="vi-bulb-glass">
              <span className="vi-bulb-facet" />
              <span className="vi-bulb-filament" aria-hidden="true">
                <svg viewBox="0 0 18 22" fill="none">
                  <path
                    d="M9 2 V6 M5 8 C5 5.5 13 5.5 13 8 C13 10.5 5 10.5 5 13 C5 15.5 13 15.5 13 18"
                    stroke="#ffd9a0"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="vi-bulb-core" />
            </div>
          </div>

          <div className={`vi-rays ${lit ? "vi-rays-on" : ""}`} aria-hidden="true">
            <span /><span /><span /><span /><span /><span />
          </div>
        </div>

        <p className="vi-eyebrow">Vendor verification</p>
        <h2 className="vi-title">Why verify?</h2>

        <ul className="vi-reasons">
          {REASONS.map((line, i) => (
            <li key={i} className="vi-reason-row">
              <span className="vi-reason-seal" aria-hidden="true">
                <svg viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="10" fill="none" stroke="#f0a85a" strokeWidth="1.2" strokeDasharray="2.2 2.4" />
                  <circle cx="11" cy="11" r="7.5" fill="#f0a85a" fillOpacity="0.14" />
                  <path d="M7 11.2L9.8 14L15 8.3" stroke="#f6c98a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="vi-reason-text">{line}</span>
            </li>
          ))}
        </ul>

        <button
          className={`vi-agree-btn ${lit ? "vi-agree-btn-lit" : ""}`}
          onClick={handleAgree}
          disabled={lit}
        >
          <span className="vi-agree-shine" />
          <span className="vi-agree-icon" aria-hidden="true">
            {lit ? (
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M2 8.5L6 12.5L14 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" fill="none">
                <rect x="2" y="6" width="12" height="8" rx="2" stroke="white" strokeWidth="1.4" />
                <path d="M5 6V4.5A3 3 0 0 1 11 4.5V6" stroke="white" strokeWidth="1.4" />
              </svg>
            )}
          </span>
          {lit ? "Lighting things up…" : "I Agree, Get Verified"}
        </button>

        <p className="vi-subnote">
          Tap the bulb or the button — either way, the lamp goes on first.
        </p>
      </div>
    </div>
  );
}

export default VerifyIntroModal;

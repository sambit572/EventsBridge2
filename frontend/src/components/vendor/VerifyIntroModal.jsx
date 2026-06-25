import React, { useState } from "react";
import "./VerifyIntroModal.css";
import { IoClose } from "react-icons/io5";

const REASONS = [
  "A verified badge sits right next to your name, so customers spot you first in search and category lists.",
  "Verified vendors convert more views into bookings — trust is the biggest reason customers hesitate.",
  "Your profile gets priority placement over unverified vendors offering the same service.",
  "It signals that your business identity, address, and bank details have been checked and confirmed.",
  "Verified listings get a noticeable lift in click-through rate from the customer home page.",
  // "It's a one-time check that keeps paying off — every future customer sees the badge instantly.",
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
              <span className="vi-bulb-core" />
            </div>
          </div>

          <div className={`vi-rays ${lit ? "vi-rays-on" : ""}`} aria-hidden="true">
            <span /><span /><span /><span /><span /><span />
          </div>
        </div>

        <h2 className="vi-title">Why verify?</h2>

        <ul className="vi-reasons">
          {REASONS.map((line, i) => (
            <li key={i} className="vi-reason-row">
              <span className="vi-reason-check" aria-hidden="true">
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path d="M1 4.5L4 7.5L10 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <button
          className={`vi-agree-btn ${lit ? "vi-agree-btn-lit" : ""}`}
          onClick={handleAgree}
          disabled={lit}
        >
          <span className="vi-agree-shine" />
          {lit ? "Lighting things up…" : "I Agree"}
        </button>

        <p className="vi-subnote">
          Tap the bulb or the button — either way, the lamp goes on first.
        </p>
      </div>
    </div>
  );
}

export default VerifyIntroModal;

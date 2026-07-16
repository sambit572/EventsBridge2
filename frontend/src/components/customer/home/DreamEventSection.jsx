import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "./DreamEventSection.css";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// ── Trust signals for the static showcase card ──
const trustPoints = [
  { emoji: "✨", label: "Verified & Trusted Vendors" },
  { emoji: "💰", label: "Best Deals for Every Budget" },
  { emoji: "🤝", label: "Direct Price Negotiation" },
  { label: "Connect with Top Local Event Vendors" },
  { emoji: "💳", label: "Flexible EMI Payments" },
  { emoji: "⭐", label: "Genuine Customer Reviews" },
  { emoji: "🔒", label: "Safe & Secure Bookings" },
  { emoji: "📅", label: "One Platform for Every Event" },
];

// ── Event Types for Artisan Catering Card ──
const eventTypes = [
  { emoji: "💍", label: "Weddings & Receptions" },
  { emoji: "🎂", label: "Birthday Celebrations" },
  { emoji: "🏢", label: "Corporate Events" },
  { emoji: "💑", label: "Engagement Ceremonies" },
  { emoji: "❤️", label: "Anniversary Parties" },
  { emoji: "👶", label: "Baby Shower Events" },
  { emoji: "🎵", label: "Concerts & Live Shows" },
];

// ── Artisan Catering Card with animated event scroller ──
function ArtisanCateringCard({ className, style, isMobile }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!isHovered) {
        setActiveIndex((prev) => (prev + 1) % eventTypes.length);
      }
    }, 1400);
    return () => clearInterval(intervalRef.current);
  }, [isHovered]);

  return (
    <div
      className={`artisan-catering-card ${className || ""}`}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate("/category/catering")}
    >
      {/* Animated background glow blobs */}
      <div className="catering-blob catering-blob-1" />
      <div className="catering-blob catering-blob-2" />
      <div className="catering-blob catering-blob-3" />

      {/* Header */}
      <div className="catering-header">
        <div className="catering-icon-wrap">
          <span className="catering-icon-emoji">🍽️</span>
        </div>
        <div className="catering-arrow">→</div>
      </div>

      {/* Title */}
      <div className="catering-title-block">
        <h3 className="catering-title">Artisan Catering</h3>
        <p className="catering-subtitle">Flavours that speak love</p>
      </div>

      {/* Event Types Scroll List */}
      <div className="catering-events-list">
        {eventTypes.map((evt, i) => (
          <div
            key={i}
            className={`catering-event-item ${i === activeIndex ? "active" : ""} ${
              i === (activeIndex - 1 + eventTypes.length) % eventTypes.length ? "prev" : ""
            }`}
            onMouseEnter={() => setActiveIndex(i)}
          >
            <span className="catering-event-emoji">{evt.emoji}</span>
            <span className="catering-event-label">{evt.label}</span>
            <span className="catering-event-dot" />
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        className="catering-cta"
        onClick={(e) => { e.stopPropagation(); navigate("/category/catering"); }}
      >
        View Caterers →
      </button>
    </div>
  );
}

// ── Single-slot cycling reveal for the 8 trust points ──
// Shows ONE item at a time, big. The outgoing item rises up and out the top
// while the incoming item rises up from behind a mask to take its place.
function TrustPointsReveal() {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      setPrevIndex(index);
      setIndex((i) => (i + 1) % trustPoints.length);
      // Remove the outgoing item from the DOM once its leave animation finishes
      clearTimeout(cleanupRef.current);
      cleanupRef.current = setTimeout(() => setPrevIndex(null), 700);
    }, 2200);
    return () => {
      clearInterval(id);
      clearTimeout(cleanupRef.current);
    };
  }, [index]);

  const current = trustPoints[index];
  const outgoing = prevIndex !== null ? trustPoints[prevIndex] : null;

  return (
    <div className="trust-reveal-stage">
      {outgoing && (
        <div key={`out-${prevIndex}`} className="trust-reveal-item is-leaving">
          {outgoing.emoji && <span className="trust-reveal-emoji">{outgoing.emoji}</span>}
          <span className="trust-reveal-label">{outgoing.label}</span>
        </div>
      )}
      <div key={`in-${index}`} className="trust-reveal-item is-entering">
        {current.emoji && <span className="trust-reveal-emoji">{current.emoji}</span>}
        <span className="trust-reveal-label">{current.label}</span>
      </div>
    </div>
  );
}

// ── Trust Showcase Card (static, no images — animated background only) ──
function TrustShowcaseCard({ className, style, minHeight }) {
  const navigate = useNavigate();

  const scrollToCategories = () => {
    const el = document.getElementById("categories");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/", { state: { scrollTo: "categories" } });
    }
  };

  return (
    <div
      className={`trust-showcase-card ${className || ""}`}
      style={{ ...style, minHeight }}
      onClick={scrollToCategories}
    >
      {/* Animated background glow blobs */}
      <div className="trust-blob trust-blob-1" />
      <div className="trust-blob trust-blob-2" />
      <div className="trust-blob trust-blob-3" />
      {/* Slow-rotating aurora sweep for extra motion/depth */}
      <div className="trust-aurora-sweep" />
      <div className="trust-grid-overlay" />
      {/* Floating sparkle particles */}
      <div className="trust-particle trust-particle-1" />
      <div className="trust-particle trust-particle-2" />
      <div className="trust-particle trust-particle-3" />
      <div className="trust-particle trust-particle-4" />
      <div className="trust-particle trust-particle-5" />

      {/* Header */}
      <div className="trust-header">
        <span className="trust-badge">WHY EVENTSBRIDGE</span>
        <h3 className="trust-title">
          Everything You Need for your Perfect Event
        </h3>
      </div>

      {/* Trust points: single big slot, one item at a time, sliding text reveal */}
      <TrustPointsReveal />

      {/* CTA */}
      <button
        className="trust-cta"
        onClick={(e) => { e.stopPropagation(); scrollToCategories(); }}
      >
        Explore Vendors →
      </button>
    </div>
  );
}

// ── Main Section ──
export default function DreamEventSection() {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-white py-12 px-4">
      <div className="w-full max-w-[1680px] mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p
              className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              THE DIFFERENCE
            </p>
            <h2
              className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Everything for your{" "}
              <span className="italic" style={{ color: "#E6A800" }}>
                Dream Event.
              </span>
            </h2>
          </motion.div>
        </div>

        {/* ── MOBILE LAYOUT (< 768px) ── */}
        <div className="dream-mobile-layout md:hidden">

          {/* Grand Venues cycling flip */}
          <TrustShowcaseCard className="dream-mobile-grand" minHeight="240px" />

          {/* Artisan Catering */}
          <ArtisanCateringCard className="dream-mobile-catering" style={{ minHeight: "220px" }} isMobile={true} />

          {/* EMI Card */}
          <motion.div
            variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="dream-mobile-emi dream-emi-gradient relative overflow-hidden rounded-2xl p-5 flex flex-col justify-center"
            style={{ minHeight: "130px" }}
          >
            <p className="font-semibold mb-1" style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Up to</p>
            <p className="font-black leading-none mb-1" style={{ fontSize: "clamp(3rem, 14vw, 4.5rem)", color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>80%</p>
            <p className="font-bold" style={{ fontSize: "15px", color: "#F5C518", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pay with Emi</p>
          </motion.div>

          {/* Join As a Vendor */}
          <motion.div
            variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="dream-mobile-vendor relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between"
            style={{ minHeight: "130px", background: "#F5C518" }}
          >
            <div>
              <h3 className="text-gray-900 font-black mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.35rem", lineHeight: 1.1 }}>Join As a Partner</h3>
              <div className="flex flex-col gap-1.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full font-black text-xs flex-shrink-0" style={{ background: "#111", color: "#F5C518" }}>✓</span>
                  <span className="font-black text-gray-900 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Zero Joining Fee</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full font-black text-xs flex-shrink-0" style={{ background: "#111", color: "#F5C518" }}>✓</span>
                  <span className="font-black text-gray-900 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Zero Commission</span>
                </div>
              </div>
            </div>
            <button
              className="self-start text-white font-bold text-xs px-4 py-2 rounded-full hover:opacity-80 transition-all duration-200"
              style={{ background: "#111" }}
            >
              Join Now
            </button>
          </motion.div>

        </div>

        {/* ── DESKTOP LAYOUT (≥ 768px): bento grid ── */}
        <motion.div
          className="hidden md:grid gap-4"
          style={{ gridTemplateColumns: "55% 1fr 1fr", gridTemplateRows: "300px 300px" }}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >

          {/* Grand Venues — cycling flip (spans 2 rows) */}
          <motion.div variants={cardVariants} style={{ gridColumn: "1", gridRow: "1 / span 2" }}>
            <TrustShowcaseCard style={{ height: "100%" }} />
          </motion.div>

          {/* Artisan Catering */}
          <motion.div variants={cardVariants} style={{ gridColumn: "2", gridRow: "1" }}>
            <ArtisanCateringCard style={{ height: "100%" }} />
          </motion.div>

          {/* EMI Card */}
          <motion.div
            variants={cardVariants}
            className="dream-emi-gradient relative overflow-hidden rounded-3xl p-7 flex flex-col justify-center"
            style={{ gridColumn: "3", gridRow: "1" }}
          >
            <p className="font-semibold mb-1" style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Up to</p>
            <p className="font-black leading-none mb-2" style={{ fontSize: "clamp(4rem, 7vw, 6rem)", color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>80%</p>
            <p className="font-bold" style={{ fontSize: "20px", color: "#F5C518", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pay with Emi</p>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-20" style={{ background: "#a78bfa", filter: "blur(10px)" }} />
          </motion.div>

          {/* Join As a Vendor (spans 2 cols) */}
          <motion.div
            variants={cardVariants}
            className="relative overflow-hidden rounded-3xl p-7 flex flex-col justify-between"
            style={{ gridColumn: "2 / span 2", gridRow: "2", background: "#F5C518" }}
            whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}
          >
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20" style={{ background: "#111" }} />
            <div className="absolute bottom-4 right-20 w-24 h-24 rounded-full opacity-10" style={{ background: "#111" }} />
            <div className="relative z-10">
              <h3 className="text-gray-900 font-black mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.1 }}>Join As a Partner</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full font-black text-sm flex-shrink-0" style={{ background: "#111", color: "#F5C518" }}>✓</span>
                  <span className="font-black text-gray-900" style={{ fontSize: "clamp(1rem, 1.8vw, 1.3rem)", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.01em" }}>
                    Zero Joining Fee
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full font-black text-sm flex-shrink-0" style={{ background: "#111", color: "#F5C518" }}>✓</span>
                  <span className="font-black text-gray-900" style={{ fontSize: "clamp(1rem, 1.8vw, 1.3rem)", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.01em" }}>
                    Zero Commission
                  </span>
                </div>
              </div>
            </div>
            <button
              className="relative z-10 self-start text-white font-bold text-sm px-7 py-3 rounded-full hover:opacity-80 transition-all duration-200 mt-4"
              style={{ background: "#111" }}
            >
              Join Now
            </button>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

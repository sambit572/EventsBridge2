import { useState, useRef, useEffect, useCallback } from "react";
import clsx from "clsx";
import "./TopVerifiedVendors.css";
import {useNavigate} from "react-router-dom"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; 

const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="tvv-stars">
      {Array.from({ length: full }).map((_, i) => (
        <span key={`f${i}`} className={clsx('tvv-star', 'filled')}>★</span>
      ))}
      {half && <span className={clsx('tvv-star', 'half')}>★</span>}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e${i}`} className={clsx('tvv-star', 'empty')}>☆</span>
      ))}
      <span className="tvv-rating-num">{rating.toFixed(1)}</span>
    </span>
  );
};

const VendorCard = ({ vendor }) => {
  const navigate=useNavigate();
  const handleverifiedcard=()=>{
    navigate(`/service/${encodeURIComponent(vendor.category)}/${vendor.id}`);
  };
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const total = vendor.images?.length || 0;

  const prev = (e) => { e.stopPropagation(); setCurrent((i) => (i === 0 ? total - 1 : i - 1)); };
  const next = (e) => { e.stopPropagation(); setCurrent((i) => (i + 1) % total); };

  return (
    <div
      className="tvv-card"
      onClick={handleverifiedcard}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="tvv-img-wrap">
        <div className="tvv-img-strip" style={{ transform: `translateX(-${current * 100}%)` }}>
          {vendor.images?.map((src, i) => (
            <img key={i} src={src} alt={`${vendor.serviceName} ${i + 1}`} className="tvv-slide-img" loading="lazy" decoding="async" />
          ))}
        </div>
        <span className="tvv-brand-label">EVENTSBRIDGE</span>
        <div className="tvv-verified-badge">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 2.5l2.2 1.27 2.53-.2 1.05 2.32 2.32 1.05-.2 2.53L21.17 12l-1.27 2.2.2 2.53-2.32 1.05-1.05 2.32-2.53-.2L12 21.17l-2.2-1.27-2.53.2-1.05-2.32-2.32-1.05.2-2.53L2.83 12l1.27-2.2-.2-2.53 2.32-1.05 1.05-2.32 2.53.2L12 2.5z" fill="#fff" />
            <path d="M8.5 12.3l2.3 2.3 4.7-4.9" stroke="#f7b500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          Premium
        </div>
        {hovered && total > 1 && <button className={clsx('tvv-arrow', 'tvv-arrow-left')} onClick={prev}>‹</button>}
        {hovered && total > 1 && <button className={clsx('tvv-arrow', 'tvv-arrow-right')} onClick={next}>›</button>}
        {total > 1 && (
          <div className="tvv-dots">
            {vendor.images.map((_, i) => (
              <button key={i} className={`tvv-dot ${i === current ? "tvv-dot-active" : ""}`}
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }} />
            ))}
          </div>
        )}
      </div>
     <div className="tvv-card-info">
  <p className="tvv-service-name">{vendor.serviceName}</p>
  <p className="tvv-category">{vendor.category}</p>
  <p className="tvv-vendor-name">{vendor.vendorName}</p>
 {vendor.rating && (
  <StarRating rating={vendor.rating} />
)}
</div>
    </div>
  );
};


export default function TopVerifiedVendors() {
   const [vendors, setVendors] = useState([]);
   const [loading, setLoading] = useState(true);
   useEffect(() => {
   const fetchVerifiedVendors = async () => {
     try {
       const response = await fetch(`${BACKEND_URL}/vendors/top-verified-vendors`);

       const data = await response.json();

       if (data.success) {
         const formattedVendors = data.vendors
           .filter((vendor) => vendor.tier?.toLowerCase() === "premium")
           .map((vendor, index) => ({
             ...vendor,
             rank: index + 1,
           }));

         setVendors(formattedVendors);
       }
     } catch (error) {
       console.error("Error fetching vendors:", error);
     } finally {
       setLoading(false);
     }
   };

   fetchVerifiedVendors();
}, []);
const N = vendors.length;
const LOOPED_VENDORS = N > 1 ? [...vendors, ...vendors, ...vendors] : vendors;
  const trackRef = useRef(null);
  const isPausedRef = useRef(false);
  const isAnimatingRef = useRef(false);
  // Start at index N so we have cards on both sides
  const indexRef = useRef(N);

  // Apply transform instantly (no animation)
  const jumpTo = useCallback((index) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(".tvv-card");
    if (!card) return;
    const gap = 18;
    const cardW = card.offsetWidth + gap;
    track.style.transition = "none";
    track.style.transform = `translateX(-${index * cardW}px)`;
    indexRef.current = index;
  }, []);

  // Animate to index
  const animateTo = useCallback((index, onDone) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(".tvv-card");
    if (!card) return;
    const gap = 18;
    const cardW = card.offsetWidth + gap;
    track.style.transition = "transform 0.55s cubic-bezier(0.4,0,0.2,1)";
    track.style.transform = `translateX(-${index * cardW}px)`;
    indexRef.current = index;
    setTimeout(() => { onDone && onDone(); }, 560);
  }, []);

  // Set initial position (start at second set so going back also works)
  useEffect(() => {
    // Wait for layout
    const t = setTimeout(() => jumpTo(N), 50);
    return () => clearTimeout(t);
  }, [jumpTo]);

  const goNext = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    const next = indexRef.current + 1;
    animateTo(next, () => {
      // If we've gone past the second set into the third, silently jump back to second set
      if (indexRef.current >= N * 2) {
        jumpTo(N);
      }
      isAnimatingRef.current = false;
    });
  }, [animateTo, jumpTo]);

  const goPrev = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    const prev = indexRef.current - 1;
    animateTo(prev, () => {
      // If we've gone before the second set into the first, silently jump forward to second set
      if (indexRef.current < N) {
        jumpTo(N * 2 - (N - indexRef.current));
      }
      isAnimatingRef.current = false;
    });
  }, [animateTo, jumpTo]);

  // Auto-scroll: every 2.5s advance by 1 card
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPausedRef.current) goNext();
    }, 2500);
    return () => clearInterval(timer);
  }, [goNext]);
if (loading) {
  return (
    <section className="tvv-section">
      <div className="tvv-header">
        <p className="tvv-eyebrow">HANDPICKED FOR YOU</p>
        <h2 className="tvv-title">
          Top Verified <span className="tvv-title-accent">Services</span>
        </h2>
        <p className="tvv-loading-text">
          <span className="tvv-loading-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          Loading top verified services
          <span className="tvv-loading-ellipsis" aria-hidden="true">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
      </div>
    </section>
  );
}

if (!vendors.length) {
  return <div className="text-center">No top verified services available at the moment.</div>;
}
  return (
    <section className="tvv-section">
      <div className="tvv-header">
        <p className="tvv-eyebrow">HANDPICKED FOR YOU</p>
        <h2 className="tvv-title">
          Top Verified <span className="tvv-title-accent">Services</span>
        </h2>
        <p className="tvv-subtitle">Premium partners ranked by performance & trust</p>
      </div>

      <div
        className="tvv-carousel-wrapper"
        onMouseEnter={() => { isPausedRef.current = true; }}
        onMouseLeave={() => { isPausedRef.current = false; }}
      >
        {N > 1 && (
          <button className={clsx('tvv-carousel-arrow', 'tvv-carousel-arrow-left')} onClick={goPrev} aria-label="Previous">&lsaquo;</button>
        )}

        {/* overflow:hidden on the wrapper, not the track */}
        <div className="tvv-track-outer">
          <div className="tvv-track" ref={trackRef}>
            {LOOPED_VENDORS.map((vendor, idx) => (
              <VendorCard key={`${vendor.id}-${idx}`} vendor={vendor} />
            ))}
          </div>
        </div>

        {N > 1 && (
          <button className={clsx('tvv-carousel-arrow', 'tvv-carousel-arrow-right')} onClick={goNext} aria-label="Next">&rsaquo;</button>
        )}
      </div>
    </section>
  );
}

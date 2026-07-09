// src/components/common/AnalyticsTracker.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GA_MEASUREMENT_ID = "G-HH9DLKZK1C";

/**
 * Sends a Google Analytics (GA4) page_view event every time the route
 * changes. This is required because gtag's default page_view only fires
 * once on the initial full page load — it does NOT know about client-side
 * navigation in a single-page app like this one.
 *
 * Rendered once near the top of the app (see App.jsx), same pattern as
 * ScrollToTop.jsx.
 */
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") {
      return;
    }

    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: location.pathname + location.search,
      send_to: GA_MEASUREMENT_ID,
    });
  }, [location]);

  return null; // no UI to render
};

export default AnalyticsTracker;

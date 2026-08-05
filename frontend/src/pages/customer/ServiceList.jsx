import React, { useEffect, useRef, useState, Suspense } from "react";
import { Seo } from "../../seo/seo";
import categoryMeta from "../../seo/categoryMeta.js";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import "./ServiceList.css";
import Filter from "../../components/customer/serviceList/Filter.jsx";
import ServiceCard from "./../../components/customer/serviceList/ServiceCard";
import { BACKEND_URL } from "../../utils/constant.js";
import { setCategoryServices } from "../../redux/categorySlice";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import djBanner from "../../assets/serviceListBanner/dj (1).webp";
import musicBanner from "../../assets/serviceListBanner/music-ban.webp";
import decorBanner from "../../assets/serviceListBanner/tent-ban.webp";
import photoBanner from "../../assets/serviceListBanner/photo-ban.webp";
import foodBanner from "../../assets/serviceListBanner/catering-banner.webp";
import banquetBanner from "../../assets/serviceListBanner/banquet-banner.webp";
import danceBanner from "../../assets/serviceListBanner/classical-ban.webp";
import bouncersBanner from "../../assets/serviceListBanner/bouncers-security-ban.webp";
import starsBanner from "../../assets/serviceListBanner/stars-influencers-ban.webp";
import panditBanner from "/categories/mehendi-henna-artist.webp";
import makeupBanner from "../../assets/serviceListBanner/beauty-ban.webp";
import floralBanner from "../../assets/serviceListBanner/flower-ban.webp";
import carBanner from "../../assets/serviceListBanner/car-ban.webp";
import fireworksBanner from "/categories/fireworks.webp";
import cardBanner from "/categories/mascot-artists.webp";
import magicBanner from "/categories/magician.webp";
import resortBanner from "/categories/resortBanner.webp";
// import stageBanner from "../../assets/home/categoriesImages/stage_decor.webp";
import eventBanner from "/categories/event_company.webp";
import balloonBanner from "../../assets/serviceListBanner/balloon banner.webp";
import CategoryData from "../../utils/CatogoryData.jsx";

const ServiceCardSkeleton = () => (
  <div className="serviceCardSkeleton">
    <div className="imgSkeleton"></div>
    <div className="textSkeleton"></div>
    <div className="textSkeleton short"></div>
  </div>
);
 const shuffle = (array) => {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
};

const arrangeServices = (services) => {
  const premium = services.filter(
    (s) =>
      s.vendorVerificationStatus === "verified" &&
      s.vendorTier === "premium"
  );

  const basic = services.filter(
    (s) =>
      s.vendorVerificationStatus === "verified" &&
      s.vendorTier === "basic"
  );

  const others = services.filter(
    (s) =>
      !(
        s.vendorVerificationStatus === "verified" &&
        (s.vendorTier === "premium" || s.vendorTier === "basic")
      )
  );

  return [
    ...shuffle(premium), // Premium shuffled internally
    ...shuffle(basic),   // Basic shuffled internally
    ...shuffle(others),  // Others shuffled internally
  ];
};

const ServiceList = ({ onSwitchToLogin }) => {
  const dispatch = useDispatch();
  // const [services, setServices] = useState([]);
  const location = useLocation();
  const scrollRef = useRef(null);
  // ✅ Get category object from navigation
 const { categoryId } = useParams();
 const categoryName = decodeURIComponent(categoryId);
 const categoryData =
  location.state?.category ||
  CategoryData.find(
    (cat) => cat.title === decodeURIComponent(categoryId)
  );

 // This is the category name passed in URL
  console.log("################################");
  console.log(categoryId);
  console.log("################################");

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [showSticky, setShowSticky] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [showArrows, setShowArrows] = useState(false);

  const bannerMap = {
    "DJ & Musical Band": djBanner,
    "Music Concert & Orchestra": musicBanner,
    "Decor & Tenthouse": decorBanner,
    "Photo & Videography": photoBanner,
    "Food & Catering": foodBanner,
    "Banquet Hall & Mandap": banquetBanner,
    "Classical Music & Dance": danceBanner,
    "Bouncers & Security": bouncersBanner,
    "Stars & Influencers": starsBanner,
    "Mehendi & Henna Artist": panditBanner,
    "Beauty Makeover": makeupBanner,
    "Floral Decor": floralBanner,
    "Ceremonial Ride": carBanner,
    "Luxury Ride": carBanner,
    "Fireworks & Special Effects": fireworksBanner,
    "Mascot Artists": cardBanner,
    "Magic Shows": magicBanner,
    // "Stage Decor": stageBanner,
    "Event Management Company": eventBanner,
    "Balloon Decor": balloonBanner,
    "Hotel & Resorts": resortBanner,
  };

  // ✅ Define subcategories for each main category
  const subcategoryMap = {
    "DJ & Musical Band": [
      "All",
      "Wedding DJ",
      "Corporate Event DJ",
      "Private Party DJ",
    ],
    "Music Concert & Orchestra": [
      "All",
      "Live Band Performance",
      "Qawwali Night",
      "Celebrity Concert",
    ],
    "Decor & Tenthouse": [
      "All",
      "Wedding Decor & Tent",
      "Birthday Party Decor",
      "Reception Decor",
      "Engagement Decor ",
    ],
    "Photo & Videography": [
      "All",
      "Wedding Photography & Videography",
      "Pre-Wedding Shoot",
      "Birthday",
      "Event Coverage",
    ],
    "Food & Catering": [
      "All",
      "Wedding Catering",
      "Birthday Party Catering",
      "Corporate Catering",
    ],
    "Banquet Hall & Mandap": [
      "All",
      "Wedding Banquet Hall",
      "Ring Ceremony ",
      "Birthday",
      "Anniversary",
    ],
    "Classical Music & Dance": [
      "All",
      "Classical Vocal Performance",
      "Instrumental Performance",
      "Bharatanatyam Dance",
    ],
    "Bouncers & Security": [
      "All",
      "Event Security",
      "VIP Protection",
      "Crowd Management",
      "Corporate Security",
      "Special Event",
    ],
    "Stars & Influencers": [
      "All",
      "Celebrity Appearance",
      "Brand Ambassador",
      "Social Media Influencer",
      "Live Performance",
      "Special Event",
    ],
    "Mehendi & Henna Artist": [
      "All",
      "Bridal Mehendi",
      "Arabic Mehendi",
      "Traditional Mehendi",
      "Indo-Arabic Mehendi",
      "Special Event",
    ],
    "Beauty Makeover": ["All", "Bridal Makeup", "Unisex", "Mehendi Artist"],
    "Floral Decor": [
      "All",
      "Wedding Decor",
      "Stage & Backdrop Floral Decor",
      "Birthday Party Decor",
    ],
    "Ceremonial Ride": ["All", "Bridal Ride", "Luxury Ride", "Classic Ride"],
    "Luxury Ride": ["All", "Bridal Ride", "Luxury Ride", "Classic Ride"],
    "Fireworks & Special Effects": [
      "All",
      "Wedding Fireworks",
      "Indoor Fireworks",
      "Outdoor Fireworks",
    ],
    "Mascot Artists": [
      "All",
      "Birthday Mascots",
      "Corporate Mascots",
      "Theme Party Mascots",
      "Walkabout Characters",
    ],
    "Magic Shows": [
      "All",
      "Children’s Magic Shows",
      "Stage Magic Shows",
      "Close-Up Magic",
    ],
    "Event Management Company": [
      "All",
      "Wedding Full-Service Planner",
      "Corporate Event Management",
      "Birthday Party Planner",
    ],
    "Balloon Decor": [
      "All",
      "Birthday Balloon Decoration",
      "Theme-Based Balloon Decoration",
      "Baby Shower Balloon Decoration",
    ],
    "Hotel & Resorts": [
      "All",
      "Luxury Hotels",
      "Wedding Hotels & Resorts",
      "Resorts",
      "Beach Resorts",
    ],
  };

  // ✅ Show sticky header only after scrolling past banner
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = 250; // same as .categoryHero height
      if (window.scrollY > heroHeight - 60) {
        setShowSticky(true);
      } else {
        setShowSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${BACKEND_URL}/common/category/${categoryName}`,
          {
            params: {
              subCategory:
                selectedSubcategory !== "All" ? selectedSubcategory : undefined,
            },
          }
        );

        let servicesData = response.data.data;
        console.log("Fetched services:", servicesData);
        // Attach ratings for each service
        servicesData = await Promise.all(
          servicesData.map(async (service) => {
            try {
              const ratingRes = await axios.get(
                `${BACKEND_URL}/reviews/rating/${service._id}`
              );
              return {
                ...service,
                ratingData: ratingRes.data.data, // ✅ attach averageRating, totalReviews, etc.
              };
            } catch (err) {
              console.error(`Failed to fetch rating for ${service._id}`, err);
              return {
                ...service,
                ratingData: {
                  averageRating: 0,
                  totalRatings: 0,
                  totalReviews: 0,
                },
              };
            }
          })
        );
       
       const arrangedServices = arrangeServices(servicesData);

   dispatch(setCategoryServices(arrangedServices));
   setServices(arrangedServices);
   setFilteredServices(arrangedServices);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [categoryId, selectedSubcategory, dispatch]);

  const handleApplyFilters = (filters) => {
    console.log("Applying filters:", filters);
    const min = Number(filters.minPrice);
    const max = Number(filters.maxPrice);

    // ❌ Negative price validation
    if ((filters.minPrice && min < 0) || (filters.maxPrice && max < 0)) {
      alert("Price cannot be negative");
      return;
    }

    // ❌ Min > Max validation
    if (filters.minPrice && filters.maxPrice && min > max) {
      alert("Minimum price cannot be greater than Maximum price");
      return;
    }
    // Initialize results by filtering services
    const results = services.filter((service) => {
      console.log("Inspecting service:", service); // Debugging log

      const serviceMin = Number(service.minPrice) || 0;
      const serviceMax = Number(service.maxPrice) || 0;

      const priceMatch =
        (!filters.minPrice && !filters.maxPrice) ||
        (filters.minPrice && !filters.maxPrice && serviceMin >= min) ||
        (!filters.minPrice && filters.maxPrice && serviceMax <= max) ||
        (filters.minPrice &&
          filters.maxPrice &&
          serviceMin >= min &&
          serviceMax <= max);

      // ✅ Rating check
      const ratingValue =
        Number(service.avgRating) ||
        Number(service?.ratingData?.averageRating) ||
        0; // Default to 0 if no rating is available
      const ratingMatch = filters.rating
        ? ratingValue >= Number(filters.rating) // Ensure rating is equal to or above the selected rating
        : true;

      const prepTimeDays = Math.ceil((service.duration || 0) / (24 * 60));
      const durationMatch =
        !filters.duration || prepTimeDays <= filters.duration;

      // ✅ State match
      let stateMatch = true;
      if (filters.state) {
        if (Array.isArray(service.stateLocationOffered)) {
          stateMatch = service.stateLocationOffered.some(
            (state) =>
              state?.toLowerCase().trim() === filters.state.toLowerCase().trim()
          );
        } else {
          stateMatch =
            service.stateLocationOffered?.toLowerCase().trim() ===
            filters.state.toLowerCase().trim();
        }
      }

      // ✅ City/District match
      let cityMatch = true;
      if (filters.subdistrict && stateMatch) {
        if (Array.isArray(service.locationOffered)) {
          cityMatch = service.locationOffered.some(
            (city) =>
              city?.toLowerCase().trim() ===
              filters.subdistrict.toLowerCase().trim()
          );
        } else {
          cityMatch =
            service.locationOffered?.toLowerCase().trim() ===
            filters.subdistrict.toLowerCase().trim();
        }
      }

      return (
        priceMatch && ratingMatch && durationMatch && stateMatch && cityMatch
      );
    });

    console.log("Filtered services:", results);

    // ✅ Sorting logic
    if (filters.sortBy) {
      results.sort((a, b) => {
        switch (filters.sortBy) {
          case "price":
            return (a.minPrice || 0) - (b.minPrice || 0);
          case "name":
            return a.serviceName.localeCompare(b.serviceName);
          case "duration":
            return (a.duration || 0) - (b.duration || 0);
          case "rating": {
            const ratingA = parseFloat(
              a?.ratingData?.averageRating ?? a.rating ?? 0
            );
            const ratingB = parseFloat(
              b?.ratingData?.averageRating ?? b.rating ?? 0
            );
            console.log("Sorting Ratings:", ratingA, ratingB);
            return ratingB - ratingA; // higher rating first
          }

          default:
            return 0;
        }
      });
    }
   const arrangedResults = arrangeServices(results);
   setFilteredServices(arrangedResults);
    console.log("Filtered and sorted count:", results.length);
  };

  // Runs when Cancel is clicked in Filter
 const handleCancelFilters = () => {
  setFilteredServices(arrangeServices(services));
};

  console.log("categoryId:", categoryId);

  // Scroll subcategories
  const scrollSubcategories = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const scrollAmount = 150;
      scrollRef.current.scrollTo({
        left:
          direction === "next"
            ? scrollLeft + scrollAmount
            : scrollLeft - scrollAmount,
        behavior: "smooth",
      });
    }
  };
  const currentCategory = categoryData?.title?.trim().replace(/\u00A0/g, " ");
  useEffect(() => {
    const checkOverflow = () => {
      if (scrollRef.current) {
        const hasOverflow =
          scrollRef.current.scrollWidth > scrollRef.current.clientWidth;

        setShowArrows(hasOverflow);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => window.removeEventListener("resize", checkOverflow);
  }, [currentCategory, subcategoryMap]);

  const currentMeta = categoryMeta[categoryData?.title] || {
    title:
      "Book Event Services in Odisha | Wedding Vendors, Catering, Decoration, Photography | EventsBridge",
    description:
      "Browse verified event services including photography, catering, decoration, DJs, banquet halls, makeup artists, event planners, bands, luxury cars and entertainment. Compare prices, negotiate live and book with confidence.",
  };

  return (
    <>
      <Seo title={currentMeta.title} description={currentMeta.description} />
      {categoryData && (
        <>
          {/* Banner Header */}
          <div className="categoryHero">
            <img
              decoding="async"
              loading="lazy" // src={bannerMap[categoryData.title] || carBanner}
              src={bannerMap[categoryData.title] || djBanner}
              alt={categoryData.title}
            />

            <FaArrowLeft
              className="backArrow"
              onClick={() => window.history.back()}
            />
            <h2 className="categoryHeroTitle">{categoryData.title}</h2>
          </div>

          {/* Sticky Header → only shows after scroll */}
          {showSticky && (
            <div className={`stickyHeader ${showSticky ? "show" : ""}`}>
              <FaArrowLeft
                className="backArrowSticky"
                onClick={() => window.history.back()}
              />
              <h2>{categoryData.title}</h2>
            </div>
          )}
        </>
      )}

      {currentCategory && subcategoryMap[currentCategory] && (
        <div className="subcategory-wrapper">
          {showArrows && (
            <button
              className="scroll-btn prev"
              onClick={() => scrollSubcategories("prev")}
            >
              <FaChevronLeft />
            </button>
          )}

          <div className="subcategory-tabs" ref={scrollRef}>
            {subcategoryMap[currentCategory].map((sub) => (
              <button
                key={sub}
                className={`subcategory-tab ${
                  selectedSubcategory === sub ? "active" : ""
                }`}
                onClick={() => setSelectedSubcategory(sub)}
              >
                {sub}
              </button>
            ))}
          </div>

          {showArrows && (
            <button
              className="scroll-btn next"
              onClick={() => scrollSubcategories("next")}
            >
              <FaChevronRight />
            </button>
          )}
        </div>
      )}
      <div className="serviceList">
        <Filter onApply={handleApplyFilters} onCancel={handleCancelFilters} />
        <div className={`serviceCardDetails ${showSticky ? "scrollable" : ""}`}>
          {loading ? (
            // Show skeletons while loading
            Array.from({ length: 6 }).map((_, idx) => (
              <ServiceCardSkeleton key={idx} />
            ))
          ) : filteredServices?.length > 0 ? (
            filteredServices.map((service) => (
              <div className="singleServiceCard" key={service._id}>
                <Link
                  to={`/service/${categoryId}/${service._id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                ></Link>

                <Suspense fallback={<ServiceCardSkeleton />}>
                  <ServiceCard
                    service={service}
                    onSwitchToLogin={onSwitchToLogin}
                  />
                </Suspense>
              </div>
            ))
          ) : (
            <div className="noResultsState">
              <div className="noResultsIconWrap">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <circle cx="10.5" cy="10.5" r="6.5" stroke="url(#nrs-grad)" strokeWidth="1.8"/>
                  <line x1="15.3" y1="15.3" x2="20.5" y2="20.5" stroke="url(#nrs-grad)" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="7.5" y1="10.5" x2="13.5" y2="10.5" stroke="url(#nrs-grad)" strokeWidth="1.6" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="nrs-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#7b2ff7"/>
                      <stop offset="1" stopColor="#f5c518"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h3 className="noResultsTitle">No services found</h3>
              <p className="noResultsSubtitle">
                We couldn't find anything matching your filters. Try
                adjusting or clearing them to see more options.
              </p>
              <button
                className="noResultsClearBtn"
                onClick={handleCancelFilters}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default ServiceList;

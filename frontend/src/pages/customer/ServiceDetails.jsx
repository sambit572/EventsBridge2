import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

import "./ServiceDetails.css";
import RatingDetails from "../../components/customer/ServiceDetails/RatingDetails.jsx";
import SimilarProductCard from "../../components/customer/ServiceDetails/PeopleAlsoBooked.jsx";
import DJServiceCard from "../../components/customer/ServiceDetails/ServiceDetailCard.jsx";
import ReviewList from "../../components/customer/ServiceDetails/ReviewList.jsx";
import ReviewForm from "../../components/customer/ServiceDetails/ReviewForm.jsx";
import { FaBell } from "react-icons/fa6";
import { BACKEND_URL } from "../../utils/constant.js";
import clsx from "clsx";
import { useSelector, useDispatch } from "react-redux";
import { setCategoryServices } from "../../redux/categorySlice";
import { incrementCartCount } from "../../redux/UserSlice.js";
// ✅ NEW: Import FaYoutube
import { FaChevronLeft, FaChevronRight, FaYoutube } from "react-icons/fa";
import WhyChooseUs from "../../components/customer/ServiceDetails/WhyChooseUs.jsx";

// ✅ NEW: Helper function to identify YouTube links
const getYouTubeID = (url) => {
  if (typeof url !== "string") return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};
import CateringPackagesDisplay from "../../components/customer/ServiceDetails/CateringPackagesDisplay.jsx";

const Service = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const { serviceId, categoryId } = useParams();
  const categoryServices = useSelector(
    (state) => state.category.categoryServices
  );
  const dispatch = useDispatch();
  const vendor = useSelector((state) => state.vendor.vendor);

  useEffect(() => {
    if (!categoryServices || categoryServices.length === 0) {
      axios
        .get(`${BACKEND_URL}/common/category/${categoryId}`)
        .then((res) => {
          dispatch(setCategoryServices(res.data.data));
        })
        .catch((err) => console.error(err));
    }
  }, [categoryId]);
  const [service, setService] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  // ❌ REMOVED: selectMedia is no longer needed, we use currentIndex
  // const [selectMedia, setSelectMedia] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [latestReview, setLatestReview] = useState(null);
  const [notified, setNotified] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  // swipe states
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const minSwipeDistance = 50;
  const [whyChooseUsPoints, setWhyChooseUsPoints] = useState([]);
  const [mouseY, setMouseY] = useState(0);

  const prevSlide = () =>
    setCurrentIndex((i) =>
      i === 0 ? Math.max(mediaList.length - 1, 0) : i - 1
    );

  const nextSlide = () =>
    setCurrentIndex((i) => (mediaList.length ? (i + 1) % mediaList.length : 0));

  useEffect(() => {
    if (!categoryServices || categoryServices.length === 0) {
      axios
        .get(`${BACKEND_URL}/common/category/${categoryId}`)
        .then((res) => {
          dispatch(setCategoryServices(res.data.data));
        })
        .catch((err) => console.error(err));
    }
  }, [categoryId, dispatch, categoryServices]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [serviceId, mediaList.length]);

  const handleUserReview = () => {
    const isLoggedIn = localStorage.getItem("currentlyLoggedIn") === "true";
    if (isLoggedIn) {
      setIsReviewModalOpen(true);
    } else {
      onSwitchToLogin(true);
    }
  };

  const handleNotifyClick = () => {
    setNotified(true);
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
  };

  const handleClick = () => {
    setIsWishlisted(!isWishlisted);
  };

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);

        // This route do not exist in backend please check once
        const res = await axios.get(
          `${BACKEND_URL}/common/service/${serviceId}`
        );

        console.log("Service Fetching", res.data);

        const data = res.data.service;
        setService(data);
        setWhyChooseUsPoints(data.whyChooseUs || []);
        // ✅ MODIFIED: Process media to differentiate between images and videos
        const serviceMediaUrls = data?.serviceImage || [];
        const formattedMedia = serviceMediaUrls.map((url) => {
          const videoId = getYouTubeID(url);
          if (videoId) {
            return { type: "video", src: url, videoId: videoId };
          } else {
            return { type: "image", src: url };
          }
        });
        console.log("Formatted Media List:", formattedMedia);
        setMediaList(formattedMedia);
        // We now rely on currentIndex, so setting selectMedia is not needed
        setLoading(false);
      } catch (err) {
        console.error("Error fetching service:", err);
        setError("Service not found.");
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId]);

  const isCateringService = service?.pricingType === "perPlate";

  // CHECK IF CURRENT VENDOR IS THE SERVICE OWNER
  const isServiceOwner = () => {
    // Check if vendor is logged in
    const isVendorLoggedIn =
      localStorage.getItem("VendorCurrentlyLoggedIn") === "true";

    if (!isVendorLoggedIn || !vendor || !service) {
      console.log("Vendor auth check failed:", {
        isVendorLoggedIn,
        hasVendor: !!vendor,
        hasService: !!service,
      });
      return false;
    }

    // Get the vendor ID from service
    const serviceVendorId =
      service?.vendor || service?.vendorId?._id || service?.vendorId;

    if (!serviceVendorId) {
      console.log("No vendor ID found in service");
      return false;
    }

    // Get current vendor ID from Redux state
    const currentVendorId = vendor?._id;

    if (!currentVendorId) {
      console.log("No vendor ID in Redux state");
      return false;
    }

    // Convert both to strings and compare
    const isOwner = String(currentVendorId) === String(serviceVendorId);

    console.log("Owner Check:", {
      currentVendorId,
      serviceVendorId,
      isOwner,
      vendorFromRedux: vendor?.fullName,
    });

    return isOwner;
  };

  // HANDLE WHY CHOOSE US UPDATE
  const handleWhyChooseUsUpdate = (newPoints) => {
    setWhyChooseUsPoints(newPoints);
  };

  const isVendorAvailable = service?.available !== false;
  const location = useLocation();

  const handleBookNow = () => {
    const isLoggedIn = localStorage.getItem("currentlyLoggedIn") === "true";
    if (isLoggedIn) {
      navigate(`/userdetails/${serviceId}`, {
        state: { from: location.pathname },
      });
    } else {
      if (onSwitchToLogin) {
        onSwitchToLogin(true);
      } else {
        toast.error("Please log in to book this service.", { duration: 1500 });
        navigate("/login");
      }
    }
    // Navigate to user details (catering services won't show this button anyway)
    navigate(`/userdetails/${serviceId}`, {
      state: { from: location.pathname },
    });
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const isLoggedIn = localStorage.getItem("currentlyLoggedIn") === "true";
    if (!isLoggedIn) {
      toast.error("Please log in to add items to your cart.", {
        duration: 1500,
      });
      if (onSwitchToLogin) onSwitchToLogin(true);
      return;
    }
    try {
      await axios.post(
        `${BACKEND_URL}/cart/add`,
        { serviceId },
        { withCredentials: true }
      );
      dispatch(incrementCartCount());
      toast.success("Service added to your cart!", { duration: 1500 });
    } catch (err) {
      if (err.response && err.response.status === 409) {
        toast.error("This service is already in your cart.", {
          duration: 1500,
        });
      } else {
        toast.error("Failed to add service.", { duration: 1500 });
      }
      console.error("Add to cart error:", err);
    }
  };

  const handleNotifyMe = async (e) => {
    e.stopPropagation();
    const isLoggedIn = localStorage.getItem("currentlyLoggedIn") === "true";
    if (!isLoggedIn) {
      toast.error("Please log in to get notifications.", { duration: 1500 });
      if (onSwitchToLogin) onSwitchToLogin(true);
      return;
    }
    try {
      await axios.post(`${BACKEND_URL}/notifications/notify-when-available`, {
        serviceId,
      });
      toast.success("You'll be notified when this service becomes available!", {
        duration: 1500,
      });
    } catch (err) {
      toast.error("Failed to set up notification.", { duration: 1500 });
      console.error("Notify me error:", err);
    }
  };

  // swipe handlers
  const onTouchStart = (e) => {
    setTouchEndX(0);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance) {
      nextSlide();
    }
    if (distance < -minSwipeDistance) {
      prevSlide();
    }
  };

  if (loading) return <p>Loading service details...</p>;
  if (error || !service) return <p>{error || "Service not found."}</p>;

  return (
    <div className="dj">
      <div className="section_one">
        <div className="left-fixed">
          <div
            onMouseLeave={() => {
              setHovered(false);
            }}
            className={clsx('relative', 'w-full', 'h-[260px]', 'mb-5', 'sm:h-[400px]', 'lg:h-[430px]', 'overflow-hidden', 'rounded-lg', 'mt-3', 'sm:mt-0')}
            onMouseEnter={() => setHovered(true)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <span className={clsx('absolute', 'top-[10px]', 'left-[10px]', 'z-[20]', 'bg-black/50', 'px-2', 'py-1', 'rounded-md', 'text-[11px]', 'text-white', 'font-bold')}>
              EventsBridge
            </span>

            {mediaList.length > 0 ? (
              <>
                {mediaList.map((media, idx) =>
                  media.type === "video" ? (
                    <iframe
                      key={idx}
                      src={`https://www.youtube.com/embed/${media.videoId}?autoplay=1&mute=1&loop=1&playlist=${media.videoId}&rel=0`}
                      className={`absolute top-0 left-0 w-full h-full rounded-lg object-contain transition-opacity duration-700 ${
                        idx === currentIndex ? "opacity-100 z-10" : "opacity-0"
                      } ${!isVendorAvailable ? "grayscale brightness-50" : ""}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div
                      key={idx}
                      className={`absolute inset-0 transition-opacity duration-700 ${
                        idx === currentIndex ? "opacity-100 z-10" : "opacity-0"
                      }`}
                    >
                      {/* Main image covering full width */}
                      <img
                        decoding="async"
                        loading="lazy"
                        src={media.src}
                        alt={`slide-${idx}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />

                      {/* Poster Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-20 flex items-center">
                        <div className="w-full max-w-2xl px-6 sm:px-10 py-6">
                          {/* Badge */}
                          <div className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                            {service?.category?.name || "FESTIVAL SPECIAL"}
                          </div>

                          {/* Main Heading */}
                          <h2 className="text-3xl sm:text-5xl font-black text-white mb-2 leading-tight">
                            {service?.title || "GRAND LAUNCH"}
                          </h2>

                          {/* Discount */}
                          <div className="text-4xl sm:text-6xl font-black text-orange-400 mb-3">
                            30% OFF
                          </div>

                          {/* Subtitle */}
                          <p className="text-base sm:text-lg text-gray-200 mb-4">
                            {service?.description?.substring(0, 50) || "Unlock Divine Luxury Experiences"}
                          </p>

                          {/* Features Row */}
                          <div className="flex flex-wrap gap-3 mb-4">
                            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                              <p className="text-xs text-gray-300">SALE CAPACITY</p>
                              <p className="text-sm font-bold text-white">75% Filled</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                              <p className="text-xs text-gray-300">SECURE PAYMENTS</p>
                              <p className="text-sm font-bold text-white">100% Safe</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                              <p className="text-xs text-gray-300">EMI AVAILABLE</p>
                              <p className="text-sm font-bold text-white">Yes</p>
                            </div>
                          </div>

                          {/* Timer Box */}
                          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 max-w-[200px] border border-white/20">
                            <p className="text-xs text-gray-300 text-center mb-2">ENDS IN</p>
                            <div className="text-3xl font-bold text-white text-center">
                              08:14
                            </div>
                            <p className="text-xs text-gray-300 text-center">HRS : MINS</p>
                          </div>
                        </div>

                        {/* Right Side CTA */}
                        <div className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2">
                          <button className="bg-orange-400 hover:bg-orange-500 text-black font-bold px-6 py-3 rounded-lg shadow-lg transition-all">
                            CLAIM OFFER
                          </button>
                        </div>
                      </div>

                      {/* Unavailable Overlay */}
                      {!isVendorAvailable && (
                        <div className="unavailable-overlay">
                          <div className="unavailable-text">OUT OF SERVICE</div>
                        </div>
                      )}
                    </div>
                  )
                )}

                {/* Arrows */}
                {mediaList.length > 1 && (
                  <>
                    {/* Mobile: always visible */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevSlide();
                      }}
                      className={clsx('absolute', 'left-3', 'top-1/2', '-translate-y-1/2', 'rounded-full', 'bg-black/50', 'p-3', 'text-white', 'sm:hidden', 'z-30')}
                    >
                      <FaChevronLeft className="text-lg" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextSlide();
                      }}
                      className={clsx('absolute', 'right-3', 'top-1/2', '-translate-y-1/2', 'rounded-full', 'bg-black/50', 'p-3', 'text-white', 'sm:hidden', 'z-30')}
                    >
                      <FaChevronRight className="text-lg" />
                    </button>

                    {/* Desktop: only on hover */}
                    {hovered && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevSlide();
                          }}
                          className={clsx('absolute', 'left-3', 'top-1/2', '-translate-y-1/2', 'rounded-full', 'bg-black/50', 'p-2', 'text-white', 'hover:bg-black/70', 'hidden', 'sm:block', 'z-30')}
                        >
                          <FaChevronLeft />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextSlide();
                          }}
                          className={clsx('absolute', 'right-3', 'top-1/2', '-translate-y-1/2', 'rounded-full', 'bg-black/50', 'p-2', 'text-white', 'hover:bg-black/70', 'hidden', 'sm:block', 'z-30')}
                        >
                          <FaChevronRight />
                        </button>
                      </>
                    )}
                  </>
                )}

                {/* Dots */}
                {mediaList.length > 1 && (
                  <div className={clsx('absolute', 'bottom-3', 'left-1/2', '-translate-x-1/2', 'flex', 'gap-2', 'z-30')}>
                    {mediaList.map((media, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIndex(idx);
                        }}
                        className={`h-2 w-2 p-0 rounded-full cursor-pointer flex items-center justify-center ${
                          idx === currentIndex ? "bg-white" : "bg-gray-400"
                        }`}
                      >
                        {media.type === "video" && (
                          <FaYoutube className={clsx('text-red-500', 'text-xs')} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={clsx('flex', 'h-full', 'w-full', 'items-center', 'justify-center', 'bg-gray-300', 'text-gray-500')}>
                {!isVendorAvailable ? (
                  <div className="text-center">
                    <p className={clsx('text-sm', 'font-bold', 'text-red-600')}>
                      OUT OF SERVICE
                    </p>
                    <p className={clsx('text-xs', 'text-gray-600')}>No Image Available</p>
                  </div>
                ) : (
                  "No Image Available"
                )}
              </div>
            )}
          </div>

          <div className={clsx('flex', 'flex-row', 'items-center', 'justify-center', 'gap-4', 'sm:flex-row', 'sm:gap-4')}>
            {isCateringService ? (
              // For catering: Show informational message, buttons handled by CateringPackagesDisplay
              <div className={clsx('w-full', 'text-center', 'py-3', 'bg-blue-50', 'border', 'border-blue-200', 'rounded-full')}>
                <p className={clsx('text-sm', 'text-blue-800', 'font-medium')}>
                  📋 Select a package below to add to cart
                </p>
              </div>
            ) : (
              // For non-catering: Show regular Book Now and Add to Cart buttons
              <>
                {isVendorAvailable ? (
                  <>
                    <button
                      className={clsx('w-full', 'lg:w-auto', 'lg:min-w-[220px]', 'px-4', 'py-3', 'rounded-full', 'text-sm', 'font-bold', 'text-white', 'bg-gradient-to-r', 'from-[#fb923c]', 'to-[#ef4444]', 'hover:shadow-lg', 'hover:from-[#fca5a5]', 'hover:to-[#dc2626]', 'focus:outline-none', 'focus:ring-2', 'focus:ring-orange-300', 'shadow-md', 'transition-all', 'duration-300')}
                      onClick={handleAddToCart}
                    >
                      ADD TO CART
                    </button>

                    <button
                      className={clsx('flex', 'w-full', 'cursor-pointer', 'items-center', 'justify-center', 'rounded-full', 'bg-gradient-to-r', 'from-[#001f3f]', 'to-[#004f9f]', 'sm:px-[1rem]', 'lg:px-12', 'py-3', 'text-sm', 'font-bold', 'text-white', 'transition-colors', 'duration-300', 'ease-in-out', 'hover:from-[#002366]', 'hover:to-[#0066cc]', 'active:from-[#000d1a]', 'active:to-[#003366]', 'lg:w-auto', 'lg:min-w-[220px]')}
                      onClick={handleBookNow}
                    >
                      BOOK NOW
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleNotifyClick}
                    className={`w-full sm:w-44 flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-blue-900 bg-transparent border border-blue-900 hover:bg-blue-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-md transition-all duration-300`}
                  >
                    {!notified ? (
                      "Notify"
                    ) : (
                      <FaBell
                        className={`text-base ${
                          isAnimating ? "animate-bounce" : ""
                        }`}
                      />
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="right-scrollable">
          <DJServiceCard service={service} />
          {/* === 👇 UPDATED: Conditionally render the CateringPackagesDisplay component 👇 === */}
          {isCateringService && (
            <CateringPackagesDisplay
              service={service}
              onSwitchToLogin={onSwitchToLogin}
            />
          )}

          <WhyChooseUs
            serviceId={serviceId}
            vendorId={service?.vendor || service?.vendorId?._id}
            whyChooseUsPoints={whyChooseUsPoints}
            isOwner={isServiceOwner()}
            onUpdate={handleWhyChooseUsUpdate}
          />

          <div className="reviews">
            <h3>Ratings & Reviews</h3>
            <RatingDetails serviceId={serviceId} />
            <hr />

            <div className={clsx('flex', 'justify-center')}>
              <button
                onClick={handleUserReview}
                className={clsx('flex', 'items-center', 'gap-2', 'mt-5', 'bg-[#001F3F]', 'hover:bg-[#002366]', 'text-white', 'font-semibold', 'px-5', 'py-2.5', 'rounded-full', 'shadow-md', 'hover:shadow-lg', 'transition-all', 'duration-300', 'hover:-translate-y-1', 'active:scale-95', 'text-sm', 'sm:text-base', 'md:text-lg')}
              >
                <span className={clsx('text-lg', 'sm:text-xl')}>💬</span>
                Add Feedback
              </button>
            </div>

            <ReviewList newReview={latestReview} serviceId={serviceId} />
          </div>
        </div>
      </div>
      <div className="view-dj-section">
        <h2 className="people-also-book">People Also Booked</h2>
        <div className={clsx('grid', 'grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-5', 'gap-6', 'mt-5', 'mb-5')}>
          {categoryServices.map((product) => (
            <SimilarProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {isReviewModalOpen && (
        <div className={clsx('fixed', 'inset-0', 'bg-black', 'bg-opacity-50', 'flex', 'items-center', 'justify-center', 'p-4', 'z-50')}>
          <div className={clsx('bg-white', 'rounded-lg', 'shadow-lg', 'w-full', 'max-w-md', 'p-6', 'relative')}>
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className={clsx('absolute', 'top-3', 'right-3', 'text-gray-500', 'hover:text-gray-800', 'text-xl', 'font-bold')}
            >
              ×
            </button>

            <ReviewForm
              serviceId={service._id}
              userName={currentUser?.fullName || "Guest"}
              userId={currentUser?.id}
              onNewReview={(newReview) => {
                setLatestReview(newReview);
                setReviews((prev) => [newReview, ...prev]);
                setIsReviewModalOpen(false);
              }}
              closePopup={() => setIsReviewModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Service;

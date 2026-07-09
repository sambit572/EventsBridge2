import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaInfo } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import clsx from 'clsx'
import "slick-carousel/slick/slick-theme.css";

const AddsBanner = () => {
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8001/api";

  useEffect(() => {
    fetchActivePosters();
  }, []);

  useEffect(() => {
    if (posters.length > 0) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const newTimeLeft = {};

        posters.forEach((poster) => {
          const end = new Date(poster.offerEndDate).getTime();
          const distance = end - now;
          if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            newTimeLeft[poster._id] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
          } else {
            newTimeLeft[poster._id] = "Expired";
          }
        });

        setTimeLeft(newTimeLeft);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [posters]);

  const fetchActivePosters = async () => {
    try {
      setLoading(true);
      console.log("Fetching posters from:", `${API_URL}/posters/public/active`);
      
      const response = await axios.get(`${API_URL}/posters/public/active`, {
        timeout: 5000,
      });
      
      console.log("Posters response:", response.data);
      
      if (response.data && response.data.success && response.data.data && response.data.data.length > 0) {
        setPosters(response.data.data);
      } else {
        console.log("No posters found");
        setPosters([]);
      }
    } catch (err) {
      console.error("Error fetching posters:", err);
      console.error("Error details:", err.response?.status, err.response?.data);
      setPosters([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={clsx('w-full', 'mt-4', 'md:mt-8', 'h-48', 'md:h-64', 'bg-gray-200', 'animate-pulse', 'rounded-lg')}></div>
    );
  }

  if (posters.length === 0) {
    return (
      <div className={clsx('w-full', 'mt-4', 'md:mt-8', 'h-48', 'md:h-64', 'bg-gradient-to-r', 'from-blue-600', 'to-purple-600', 'rounded-lg', 'flex', 'items-center', 'justify-center')}>
        <div className={clsx('text-center', 'text-white', 'p-6')}>
          <p className={clsx('text-xl', 'md:text-2xl', 'font-bold', 'mb-2')}>No Active Offers</p>
          <p className={clsx('text-sm', 'md:text-base', 'opacity-90')}>Check back soon for exciting deals!</p>
        </div>
      </div>
    );
  }

  const sliderSettings = {
    dots: posters.length > 1,
    infinite: posters.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: posters.length > 1,
    autoplaySpeed: 5000,
    arrows: posters.length > 1,
  };

  return (
    <>
      <div className={clsx('relative', 'w-full', 'mt-4', 'md:mt-8', 'overflow-hidden', 'rounded-lg')} style={{ padding: 0 }}>
        <Slider {...sliderSettings}>
          {posters.map((banner) => (
            <div key={banner._id} className={clsx('relative', 'w-full', 'h-[220px]', 'sm:h-[280px]', 'md:h-[320px]', 'lg:h-[380px]', 'overflow-hidden', 'rounded-lg')}>
              {/* Main Image covering full width */}
              <img
                decoding="async"
                loading="lazy"
                src={banner.posterImageUrl}
                alt={banner.offerTitle}
                className={clsx('absolute', 'inset-0', 'w-full', 'h-full', 'object-cover')}
              />

              {/* Poster Overlay */}
              <div className={clsx('absolute', 'inset-0', 'bg-gradient-to-r', 'from-black/70', 'via-black/50', 'to-transparent', 'z-20', 'flex', 'items-center')}>
                <div className={clsx('w-full', 'max-w-2xl', 'px-4', 'sm:px-6', 'md:px-10', 'py-4', 'sm:py-6')}>
                  {/* Badge */}
                  {banner.offerType && (
                    <div className={clsx('inline-block', 'bg-orange-500', 'text-white', 'text-xs', 'font-bold', 'px-3', 'py-1', 'rounded-full', 'mb-3')}>
                      {banner.offerType} Special
                    </div>
                  )}

                  {/* Main Heading */}
                  <h2 className={clsx('text-2xl', 'sm:text-4xl', 'md:text-5xl', 'font-black', 'text-white', 'mb-2', 'leading-tight')}>
                    {banner.offerTitle}
                  </h2>

                  {/* Discount */}
                  {banner.discountPercentage > 0 && (
                    <div className={clsx('text-3xl', 'sm:text-5xl', 'md:text-6xl', 'font-black', 'text-orange-400', 'mb-3')}>
                      {banner.discountPercentage}% OFF
                    </div>
                  )}

                  {/* Subtitle */}
                  {banner.offerDescription && (
                    <p className={clsx('text-sm', 'sm:text-base', 'md:text-lg', 'text-gray-200', 'mb-4', 'line-clamp-2')}>
                      {banner.offerDescription}
                    </p>
                  )}
                </div>

                {/* Right Side Timer */}
                <div className={clsx('absolute', 'right-4', 'sm:right-6', 'md:right-10', 'top-1/2', '-translate-y-1/2', 'hidden', 'sm:block')}>
                  {/* Timer Box */}
                  <div className={clsx('bg-white/10', 'backdrop-blur-md', 'rounded-xl', 'p-2', 'sm:p-3', 'max-w-[280px]', 'sm:max-w-[320px]', 'border', 'border-white/20')}>
                    <p className={clsx('text-[10px]', 'sm:text-xs', 'text-gray-800', 'text-center', 'mb-1', 'font-semibold')}>ENDS IN</p>
                    <div className={clsx('text-2xl', 'sm:text-4xl', 'md:text-5xl', 'font-bold', 'text-black', 'text-center', 'tabular-nums', 'leading-tight')}>
                      {timeLeft[banner._id] || "Loading..."}
                    </div>
                  </div>
                </div>

                {/* Info Icon - Top Right */}
                <button
                  onClick={() => setSelectedPoster(banner)}
                  className={clsx('absolute', 'top-3', 'right-3', 'w-8', 'h-8', 'bg-black/50', 'hover:bg-black/70', 'text-white', 'rounded-full', 'flex', 'items-center', 'justify-center', 'backdrop-blur-sm', 'transition-all', 'z-30')}
                  title="View Details"
                >
                  <FaInfo className="text-sm" />
                </button>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Popup Modal */}
      {selectedPoster && (
        <div
          className={clsx('fixed', 'inset-0', 'bg-black/70', 'flex', 'items-center', 'justify-center', 'z-[9999]', 'p-4')}
          onClick={() => setSelectedPoster(null)}
        >
          <div
            className={clsx('bg-white', 'rounded-2xl', 'max-w-2xl', 'w-full', 'max-h-[90vh]', 'overflow-y-auto', 'shadow-2xl', 'relative', 'z-[10000]')}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={clsx('p-6', 'md:p-8')}>
              <button
                onClick={() => setSelectedPoster(null)}
                className={clsx('absolute', 'top-4', 'right-4', 'w-10', 'h-10', 'bg-gray-100', 'hover:bg-gray-200', 'text-gray-600', 'rounded-full', 'flex', 'items-center', 'justify-center', 'text-2xl', 'transition-all')}
              >
                x
              </button>

              <h2 className={clsx('text-3xl', 'font-bold', 'text-gray-900', 'mb-4')}>
                {selectedPoster.offerTitle}
              </h2>

              {selectedPoster.discountPercentage && (
                <div className={clsx('text-4xl', 'font-bold', 'text-orange-500', 'mb-4')}>
                  {selectedPoster.discountPercentage}% OFF
                </div>
              )}

              {selectedPoster.offerDescription && (
                <p className={clsx('text-gray-600', 'text-base', 'leading-relaxed', 'mb-6')}>
                  {selectedPoster.offerDescription}
                </p>
              )}

              <div className={clsx('bg-blue-50', 'border', 'border-blue-200', 'rounded-lg', 'p-4', 'mb-4')}>
                <p className={clsx('text-sm', 'font-semibold', 'text-blue-900', 'mb-2')}>Offer Valid:</p>
                <div className={clsx('text-sm', 'text-blue-700', 'space-y-1')}>
                  <p>
                    <span className="font-semibold">From:</span>{" "}
                    {new Date(selectedPoster.offerStartDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p>
                    <span className="font-semibold">To:</span>{" "}
                    {new Date(selectedPoster.offerEndDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className={clsx('flex', 'items-center', 'justify-between')}>
                <div className={clsx('bg-green-50', 'border', 'border-green-200', 'rounded-lg', 'px-4', 'py-2')}>
                  <span className={clsx('inline-block', 'w-2', 'h-2', 'bg-green-500', 'rounded-full', 'mr-2', 'animate-pulse')}></span>
                  <span className={clsx('text-sm', 'font-semibold', 'text-green-700')}>Active Now</span>
                </div>

                {selectedPoster.uploadedBy && (
                  <p className={clsx('text-xs', 'text-gray-500')}>
                    By: {selectedPoster.uploadedBy.fullName}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddsBanner;

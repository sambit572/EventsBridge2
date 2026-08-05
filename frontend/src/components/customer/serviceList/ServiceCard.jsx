import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaYoutube } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import ServiceDescription from "./ServiceDescription";
import { getYouTubeID } from "../../../utils/helpers";
import clsx from "clsx";

const ServiceCard = ({ service, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const minSwipeDistance = 50;

  if (!service) return null;

  const media = service.serviceImage || [];
  const serviceId = service._id || service.id;
  const isVendorAvailable = service.available !== false;
const verificationTier = service.vendorTier?.trim().toLowerCase();

let verificationLabel = "";

if (service.vendorVerificationStatus === "verified") {
  if (verificationTier === "premium") {
    verificationLabel = "Premium";
  } else {
    verificationLabel = "Verified";
  }
}

  const handleCardClick = () => {
    navigate(`/service/${categoryId}/${serviceId}`);
  };

  const currentMediaUrl = media[currentIndex];
  const isVideo = getYouTubeID(currentMediaUrl);

  const prevSlide = () =>
    setCurrentIndex((i) => (i === 0 ? Math.max(media.length - 1, 0) : i - 1));

  const nextSlide = () =>
    setCurrentIndex((i) => (media.length ? (i + 1) % media.length : 0));

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

  return (
    <div
      className={clsx('flex', 'cursor-pointer', 'flex-col', 'overflow-hidden', 'rounded-lg', 'bg-white', 'transition-shadow', 'duration-300', 'ease-in-out')}
      onClick={handleCardClick}
    >
      <div
        className={clsx('relative', 'overflow-hidden', 'rounded-t-lg', 'w-full', 'h-[220px]', 'bg-gray-100', 'flex-shrink-0')}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <span className={clsx('absolute', 'top-[10px]', 'left-[10px]', 'z-[20]', 'bg-black/50', 'px-2', 'py-1', 'rounded-md', 'text-[11px]', 'text-white', 'font-bold')}>
          EventsBridge
        </span>

        {service.vendorVerificationStatus === "verified" && (
          <span className={clsx('absolute', 'top-[10px]', 'right-[10px]', 'z-[20]', 'flex', 'items-center', 'gap-1', 'rounded-full', 'bg-gradient-to-r', 'from-[#f5c518]', 'via-[#f7b500]', 'to-[#d99a00]', 'px-2.5', 'py-1', 'text-[12px]', 'font-bold', 'text-[#3a2a00]', 'shadow-[0_2px_10px_rgba(217,154,0,0.55)]', 'ring-1', 'ring-white/50', 'backdrop-blur-sm')}>
            <MdVerified className={clsx('text-[15px]', 'text-white', 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]')} />
           <span className={clsx("tracking-wide")}>{verificationLabel} </span>
          </span>
        )}

        <div className={clsx('relative', 'w-full', 'h-full')}>
          {Array.isArray(media) && media.length > 0 ? (
            <>
              {isVideo ? (
                <iframe
                  key={currentIndex}
                  src={`https://www.youtube.com/embed/${isVideo}?autoplay=1&mute=1&loop=1&playlist=${isVideo}&rel=0`}
                  className={`absolute top-0 left-0 w-full h-full object-contain object-center ${
                    !isVendorAvailable ? "grayscale brightness-75" : ""
                  }`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className={clsx('absolute', 'inset-0')}>
                  <img
                    decoding="async"
                    loading="lazy"
                    src={currentMediaUrl}
                    className={clsx('absolute', 'inset-0', 'w-full', 'h-full', 'object-cover', 'blur-xl', 'scale-110', 'opacity-40')}
                  />
                  <img
                    decoding="async"
                    loading="lazy"
                    key={currentIndex}
                    src={currentMediaUrl}
                    alt={`slide-${currentIndex}`}
                    className={`absolute inset-0 m-auto max-h-full max-w-full object-contain z-10 transition-opacity duration-500 ${
                      !isVendorAvailable ? "grayscale brightness-75" : ""
                    }`}
                  />
                </div>
              )}

              {media.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevSlide();
                    }}
                    className={clsx('absolute', 'z-30', 'left-3', 'top-1/2', '-translate-y-1/2', 'rounded-full', 'bg-black/50', 'p-3', 'text-white', 'sm:hidden')}
                  >
                    <FaChevronLeft className="text-lg" />
                  </button>
                  {hovered && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevSlide();
                      }}
                      className={clsx('absolute', 'z-30', 'left-3', 'top-1/2', '-translate-y-1/2', 'rounded-full', 'bg-black/50', 'p-2', 'text-white', 'hover:bg-black/70', 'hidden', 'sm:flex')}
                    >
                      <FaChevronLeft />
                    </button>
                  )}
                </>
              )}

              {media.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextSlide();
                    }}
                    className={clsx('absolute', 'z-30', 'right-3', 'top-1/2', '-translate-y-1/2', 'rounded-full', 'bg-black/50', 'p-3', 'text-white', 'sm:hidden')}
                  >
                    <FaChevronRight className="text-lg" />
                  </button>
                  {hovered && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextSlide();
                      }}
                      className={clsx('absolute', 'z-30', 'right-3', 'top-1/2', '-translate-y-1/2', 'rounded-full', 'bg-black/50', 'p-2', 'text-white', 'hover:bg-black/70', 'hidden', 'sm:flex')}
                    >
                      <FaChevronRight />
                    </button>
                  )}
                </>
              )}

              {media.length > 1 && (
                <div className={clsx('absolute', 'z-30', 'bottom-2', 'left-1/2', '-translate-x-1/2', 'flex', 'gap-2')}>
                  {media.map((mediaUrl, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(idx);
                      }}
                      className={`h-2 w-2 rounded-full p-0 cursor-pointer flex items-center justify-center ${
                        idx === currentIndex ? "bg-white" : "bg-gray-400"
                      }`}
                    >
                      {getYouTubeID(mediaUrl) && (
                        <FaYoutube className={clsx('text-red-500', 'text-xs')} />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {!isVendorAvailable && (
                <div className={clsx('absolute', 'inset-0', 'flex', 'items-center', 'justify-center', 'bg-black', 'bg-opacity-40')}>
                  <div className={clsx('rounded-lg', 'bg-red-600', 'px-4', 'py-5', 'text-center', 'shadow-lg')}>
                    <p className={clsx('text-sm', 'font-bold', 'text-white')}>
                      OUT OF SERVICE
                    </p>
                    <p className={clsx('text-xs', 'text-red-100')}>
                      Oops! We're on a quick break, back soon.
                    </p>
                  </div>
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
      </div>

      <div className={clsx('flex-grow', 'min-w-0')}>
        <ServiceDescription
          service={{ ...service, categoryId: categoryId }}
          onSwitchToLogin={onSwitchToLogin}
        />
      </div>
    </div>
  );
};

export default ServiceCard;

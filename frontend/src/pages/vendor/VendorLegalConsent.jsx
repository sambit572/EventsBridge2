import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";

import StepProgress from "./StepProgress";
import LegalButton from "./LegalButton";
import "./LegalButton.css";
import axios from "axios";
import Spinner from "./../../components/common/Spinner";
import { useSelector } from "react-redux";

export default function VendorLegalConsent() {
  const [signatureFile, setSignatureFile] = React.useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const vendor = useSelector((state) => state.vendor.vendor);

  console.log("Vendor Legal Consent Page Rendered");

  const fileInputRef = React.useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const [consents, setConsents] = useState({
    iAgreeTC: false,
    iAgreeCP: false,
    iAgreeKYCVerifyUsingPanAndAdhar: false,
  });

  const currentStepIndex = location.state?.currentStep || 3;

  // Enhanced signature validation function
  const validateSignatureImage = (file) => {
    return new Promise((resolve, reject) => {
      // Basic file validations
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      const maxSize = 2 * 1024 * 1024; // 2MB
      const minSize = 1 * 1024; // 1KB

      // File type validation
      if (!validTypes.includes(file.type)) {
        reject("Please upload only PNG or JPEG images for signature.");
        return;
      }

      // File size validation
      if (file.size > maxSize) {
        reject(
          "Signature file is too large. Please upload an image under 2MB."
        );
        return;
      }

      if (file.size < minSize) {
        reject(
          "Signature file is too small. Please upload a valid signature image."
        );
        return;
      }

      // Image dimension and content validation
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // More flexible dimension validation
        const aspectRatio = img.width / img.height;

        // Allow more flexible aspect ratios for signatures and names
        // Signatures can be written names (closer to square) or traditional signatures (wider)
        if (aspectRatio < 0.5 || aspectRatio > 10) {
          reject("Please upload a properly oriented signature image.");
          return;
        }

        // More reasonable minimum dimensions
        if (img.width < 50 || img.height < 20) {
          reject("Signature image is too small. Minimum size: 50x20 pixels.");
          return;
        }

        // Increased maximum dimensions for better flexibility
        if (img.width > 3000 || img.height > 1500) {
          reject(
            "Signature image is too large. Maximum size: 3000x1500 pixels."
          );
          return;
        }

        // Enhanced content validation using pixel analysis
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;

          let transparentPixels = 0;
          let whitePixels = 0;
          let darkPixels = 0;
          let coloredPixels = 0;
          let totalPixels = pixels.length / 4;

          for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];

            // Count transparent pixels
            if (a < 128) {
              transparentPixels++;
            }
            // Count white/very light pixels
            else if (r > 235 && g > 235 && b > 235) {
              whitePixels++;
            }
            // Count dark pixels (potential signature content)
            else if (r < 120 && g < 120 && b < 120) {
              darkPixels++;
            }
            // Count colored pixels (blue, black, etc.)
            else {
              coloredPixels++;
            }
          }

          const contentPixelRatio = (darkPixels + coloredPixels) / totalPixels;
          const backgroundPixelRatio =
            (whitePixels + transparentPixels) / totalPixels;

          // More lenient content validation
          // Signature should have some visible content but mostly background
          if (contentPixelRatio < 0.005) {
            reject(
              "Image appears to be empty or too faint. Please upload a clearer signature."
            );
            return;
          }

          if (contentPixelRatio > 0.8) {
            reject(
              "Image appears too dense. Please upload a signature with clear background."
            );
            return;
          }

          // Ensure there's enough background/contrast
          if (backgroundPixelRatio < 0.2) {
            reject(
              "Signature needs better contrast with background. Please use a clearer image."
            );
            return;
          }

          resolve("Signature validation passed");
        } catch (error) {
          // If pixel analysis fails, just do basic validation
          console.warn(
            "Advanced validation failed, using basic validation:",
            error
          );
          resolve("Basic signature validation passed");
        }
      };

      img.onerror = () => {
        reject("Unable to load image. Please upload a valid image file.");
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Enhanced file change handler with validation
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsValidating(true);
    setValidationError("");

    try {
      await validateSignatureImage(file);
      setSignatureFile(file);
      setValidationError("");
    } catch (error) {
      setValidationError(error);
      setSignatureFile(null);
      // Clear the file input
      e.target.value = "";
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!signatureFile) {
      setIsLoading(false);
      alert("Please upload your signature before submitting.");
      return;
    }

    // Check if all consents are agreed
    if (
      !consents.iAgreeTC ||
      !consents.iAgreeCP ||
      !consents.iAgreeKYCVerifyUsingPanAndAdhar
    ) {
      setIsLoading(false);
      alert("Please agree to all terms and conditions before submitting.");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("iAgreeTC", consents.iAgreeTC);
      formData.append("iAgreeCP", consents.iAgreeCP);
      formData.append(
        "iAgreeKYCVerifyUsingPanAndAdhar",
        consents.iAgreeKYCVerifyUsingPanAndAdhar
      );

      formData.append("signature", signatureFile);
      formData.append("vendorId", vendor?._id || "");

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/vendors/legal-consent`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      console.log("Consent submitted:", res.data);
      navigate("/vendor/thank-you");
    } catch (error) {
      console.error(
        "Consent submission failed:",
        error?.response?.data || error.message
      );

      alert("Failed to submit consent. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <div className="legal-consent-page">
      <StepProgress currentStep={currentStepIndex} />

      {isLoading && <Spinner />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .lc-card, .lc-card * { font-family: 'Plus Jakarta Sans', sans-serif; }
        .lc-card {
          animation: lc-rise 0.5s cubic-bezier(.22,1,.36,1) both;
          background-image:
            linear-gradient(145deg, #fff9d6, #ffe680, #ffd34d, #ffe680, #fff9d6),
            linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #3b82f6 100%);
          background-origin: border-box;
          background-clip: padding-box, border-box;
          border: 4px solid transparent;
          background-size: 300% 300%;
          box-shadow: 0 20px 60px rgba(76, 29, 149, 0.22) !important;
          animation: lc-rise 0.5s cubic-bezier(.22,1,.36,1) both, lc-gradient-shift 6s ease infinite;
        }
        @keyframes lc-rise { from { opacity:0; transform: translateY(16px) scale(.985); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes lc-gradient-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .lc-row { animation: lc-fade 0.4s ease both; }
        @keyframes lc-fade { from { opacity:0; transform: translateX(-6px); } to { opacity:1; transform: translateX(0); } }
        .lc-row input[type="checkbox"] {
          width: 16px; height: 16px; cursor: pointer; accent-color: #16a34a;
          transition: transform .15s ease;
        }
        .lc-row input[type="checkbox"]:hover { transform: scale(1.12); }
        .lc-upload-box { transition: border-color .2s ease, box-shadow .2s ease, transform .15s ease; }
        .lc-upload-box:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }
      `}</style>

      <div className="lc-card rounded-[18px] max-w-[600px] my-[40px] mx-auto p-[24px] max-lg:max-w-[95%] max-lg:p-[22px] max-lg:my-[30px] max-md:max-w-[95%] max-md:p-5 max-md:my-[24px] max-[480px]:max-w-[94%] max-[480px]:p-4 max-[480px]:my-5 max-[480px]:overflow-x-hidden">
        <p className="text-[14px] mb-3.5 leading-[1.6] text-black max-md:text-[13.5px] max-[480px]:text-[13px] max-[480px]:leading-[1.5]">
          Before submitting your registration, please review and agree to the
          following terms and authorizations.
        </p>

        <form className="flex flex-col gap-[18px]" onSubmit={handleSubmit}>
          <label className="lc-row flex items-center gap-[6px] whitespace-nowrap text-[15px] leading-[1.3] max-md:text-xs max-md:gap-[14px] max-md:flex-row max-md:items-start max-[480px]:text-[13.5px] max-[480px]:gap-2.5 max-[480px]:flex-row max-[480px]:items-start max-[480px]:flex-wrap" style={{ animationDelay: "0ms" }}>
            <input
              type="checkbox"
              checked={consents.iAgreeTC}
              onChange={(e) =>
                setConsents((prev) => ({ ...prev, iAgreeTC: e.target.checked }))
              }
              required
              className="mr-1"
            />
            <a
              href="/terms-and-conditions"
              className="hover:underline hover:text-blue-600 focus:underline focus:text-blue-600 active:underline active:text-blue-600"
            >
              I agree to the Terms and Conditions
            </a>
            <FiAlertCircle className="text-xs -ml-0.5" />
          </label>

          <label className="lc-row flex items-center gap-[6px] whitespace-nowrap text-[15px] leading-[1.3] max-md:text-xs max-md:gap-[14px] max-md:flex-row max-md:items-start max-[480px]:text-[13.5px] max-[480px]:gap-2.5 max-[480px]:flex-row max-[480px]:items-start max-[480px]:flex-wrap" style={{ animationDelay: "60ms" }}>
            <input
              type="checkbox"
              checked={consents.iAgreeCP}
              onChange={(e) =>
                setConsents((prev) => ({ ...prev, iAgreeCP: e.target.checked }))
              }
              required
              className="mr-1"
            />
            <a
              href="/refund-policy"
              className="hover:underline hover:text-blue-600 focus:underline focus:text-blue-600 active:underline active:text-blue-600"
            >
              I agree to the Commission and Payment Terms
            </a>
            <FiAlertCircle className="text-xs -ml-0.5" />
          </label>

          <label className="lc-row flex items-center gap-[6px] whitespace-nowrap text-[15px] leading-[1.3] max-md:text-xs max-md:gap-[14px] max-md:flex-row max-md:items-start max-[480px]:text-[13.5px] max-[480px]:gap-2.5 max-[480px]:flex-row max-[480px]:items-start max-[480px]:flex-wrap" style={{ animationDelay: "120ms" }}>
            <input
              type="checkbox"
              checked={consents.iAgreeKYCVerifyUsingPanAndAdhar}
              onChange={(e) =>
                setConsents((prev) => ({
                  ...prev,
                  iAgreeKYCVerifyUsingPanAndAdhar: e.target.checked,
                }))
              }
              required
              className="mr-1"
            />
            <a
              href="/privacy-policy"
              className="hover:underline hover:text-blue-600 focus:underline focus:text-blue-600 active:underline active:text-blue-600"
            >
              I authorize KYC Verification using PAN/Aadhaar
            </a>
            <FiAlertCircle className="text-xs -ml-0.5" />
          </label>

          <div className="lc-row mt-2 text-center" style={{ animationDelay: "180ms" }}>
            <label className="block text-[15px] font-medium mb-1.5">
              Signature (digital) or Name as e-sign
            </label>

            {/* Updated Validation Guidelines */}
            <div className="text-xs text-gray-600 mb-2 text-center leading-relaxed">
              Upload your signature or written name (PNG/JPEG only, max 2MB)
              <br />
              Ensure good contrast with white/transparent background
            </div>

            <div
              className={`
                lc-upload-box cursor-pointer bg-white border-[1.5px] rounded-[10px] p-4 w-[260px] mx-auto 
                flex items-center justify-between text-base shadow-sm
                ${
                  validationError
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }
                max-lg:w-[240px] max-lg:p-[16px] max-lg:text-[15px]
                max-md:w-[220px] max-md:p-3.5 max-md:text-sm
                max-[480px]:w-full max-[480px]:p-[12px] max-[480px]:text-[13px]
              `}
              onClick={() => fileInputRef.current.click()}
            >
              {isValidating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Validating...</span>
                </div>
              ) : signatureFile ? (
                <div className="flex flex-col items-center gap-1 w-full">
                  <img
                    decoding="async"
                    loading="lazy"
                    src={URL.createObjectURL(signatureFile)}
                    alt="Uploaded Signature"
                    className="max-h-[50px] max-w-[200px] object-contain"
                  />
                  <span className="text-xs text-emerald-500 font-medium">
                    ✓ Signature accepted
                  </span>
                </div>
              ) : (
                <>
                  <span>Upload Signature</span>
                  <img
                    decoding="async"
                    loading="lazy"
                    src="/Upload.webp"
                    alt="Upload Icon"
                    className="h-5 w-5 max-lg:h-[20px] max-lg:w-[20px] max-md:h-[18px] max-md:w-[18px] max-[480px]:h-4 max-[480px]:w-4"
                  />
                </>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
              />
            </div>

            {/* Enhanced Validation Error Display */}
            {validationError && (
              <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs text-center max-w-[260px] mx-auto">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <FiAlertCircle className="text-sm" />
                  <span className="font-medium">Upload Error</span>
                </div>
                <div className="text-xs">{validationError}</div>
              </div>
            )}
          </div>

          <LegalButton />
        </form>
      </div>
    </div>
  );
}

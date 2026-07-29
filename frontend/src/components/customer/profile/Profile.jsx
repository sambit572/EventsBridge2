import React, { useState, useEffect } from "react";
import UserSideBar from "./UserSideBar.jsx";
import PasswordInput from "../../../utils/PasswordInput.jsx";
import axios from "axios";
import { BACKEND_URL } from "../../../utils/constant.js";
import { MdReportGmailerrorred } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import socket from "../../../socket/socketClient.js";
import clsx from "clsx";

function Profile() {
  const navigate = useNavigate();
  const location = useLocation();

  /* -------------------- STATE HOOKS -------------------- */

  // Sidebar state for mobile view
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Password modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Booking states
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingError, setBookingError] = useState(null);

  // Filter & sorting states
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPayment, setFilterPayment] = useState("All");
  const [filterDate, setFilterDate] = useState("All");
  const [sortOption, setSortOption] = useState("Newest First");
 const [showReviewModal, setShowReviewModal] = useState(false);
const [selectedBooking, setSelectedBooking] = useState(null);
const [rating, setRating] = useState(0);
const [reviewMessage, setReviewMessage] = useState("");


  /* -------------------- RESPONSIVE SIDEBAR -------------------- */
  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* -------------------- REFRESH BOOKINGS ON MOUNT & NAVIGATION -------------------- */
  useEffect(() => {
    // Refresh bookings when component mounts OR when navigating back to profile
    fetchBookings();
  }, [location.key]); // Re-run when location changes (navigation events)

  // ✅ Additional: Refresh when window regains focus (user returns from another tab)
  useEffect(() => {
    const handleFocus = () => {
      const lastUpdate = localStorage.getItem("lastPaymentUpdate");
      const currentTime = Date.now();
      
      // If there was a recent payment update (within last 60 seconds), force refresh
      if (lastUpdate && currentTime - parseInt(lastUpdate) < 60000) {
        console.log("🔄 Refreshing bookings due to recent payment update");
        fetchBookings();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  /* -------------------- FETCH BOOKINGS -------------------- */
  const fetchBookings = async () => {
    console.log("🔄 Fetching bookings from:", `${BACKEND_URL}/user-bookings/my-bookings`);
    setLoadingBookings(true);
    setBookingError(null);
    
    try {
      // Add cache-busting parameter to ensure fresh data
      const timestamp = Date.now();
      
      const res = await axios.get(
        `${BACKEND_URL}/user-bookings/my-bookings`,
        {
          withCredentials: true,
          timeout: 10000,
          params: {
            _t: timestamp // Cache buster
          }
        }
      );
      console.log("📦 Full bookings response:", JSON.stringify(res.data, null, 2));
      if (res.data && res.data.success) {
        console.log("✅ Setting booking history:", res.data.data.length, "items");
        console.log("📊 Payment statuses:", res.data.data.map(b => ({ 
          id: b._id, 
          payment: b.paymentStatus,
          booking: b.bookingStatus 
        })));
        setBookingHistory(res.data.data);
      } else {
        const msg = "API returned unsuccessful response: " + JSON.stringify(res.data);
        console.log("⚠️", msg);
        setBookingError(msg);
      }
    } catch (err) {
      console.error("❌ Booking fetch failed:", err);
      const errorMsg = err.response?.data?.message || err.message || "Unknown error";
      const fullError = `Status: ${err.response?.status || 'N/A'} - ${errorMsg}`;
      setBookingError(fullError);
    } finally {
      setLoadingBookings(false);
    }
  };

  /* -------------------- SOCKET: REAL-TIME UPDATES -------------------- */
  useEffect(() => {
    if (!socket.connected) return;

    // Refresh when vendor accepts/rejects
    const handleStatusUpdate = (data) => {
      console.log("📡 Negotiation status update:", data);
      fetchBookings();
    };

    socket.on("negotiation-status-update", handleStatusUpdate);

    return () => {
      socket.off("negotiation-status-update", handleStatusUpdate);
    };
  }, []);

  /* -------------------- PASSWORD UPDATE -------------------- */
  const handlePasswordChangeSubmit = async () => {
    if (newPassword !== confirmPassword)
      return setErrorMsg("Passwords do not match");
     setErrorMsg("");
    try {
      const response = await axios.post(
        `${BACKEND_URL}/user/change-password`,
        { oldPassword, newPassword },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 3000);
        setShowPasswordModal(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrorMsg("");
       
      }
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "Failed to change password."
      );
    }
  };

  /* -------------------- FORMAT DATE -------------------- */
  /* -------------------- FORMAT DATE -------------------- */
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  /* -------------------- DATE FILTER FUNCTION -------------------- */
  const filterByDate = (date) => {
    const d = new Date(date);
    const today = new Date();

    if (filterDate === "This Week") {
      const weekAhead = new Date();
      weekAhead.setDate(today.getDate() + 7);
      return d >= today && d <= weekAhead;
    }
    if (filterDate === "This Month") {
      return (
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    }
    if (filterDate === "This Year") {
      return d.getFullYear() === today.getFullYear();
    }
    return true;
  };

  /* -------------------- APPLY FILTERS & SORT -------------------- */
  const filteredBookings = bookingHistory
    .filter((b) => filterStatus === "All" || b?.bookingStatus === filterStatus)
    .filter(
      (b) => filterPayment === "All" || b?.paymentStatus === filterPayment
    )
    .filter((b) => filterByDate(b?.userDetailsId?.startDate || b?.startDate))
    .sort((a, b) => {
      const aDate = a?.userDetailsId?.startDate || a?.startDate;
      const bDate = b?.userDetailsId?.startDate || b?.startDate;

      if (sortOption === "Newest First")
        return new Date(bDate) - new Date(aDate);
      if (sortOption === "Oldest First")
        return new Date(aDate) - new Date(bDate);
      if (sortOption === "Highest Amount") return b.amount - a.amount;
      if (sortOption === "Lowest Amount") return a.amount - b.amount;
      return 0;
    });

  /* -------------------- HANDLE BOOKING CLICK -------------------- */
  const handleBookingClick = (booking) => {
    const { reDirectTo, userDetailsId, paymentStatus } = booking;
    console.log("Booking clicked:", booking);

    switch (reDirectTo) {
      case 1:
        // Navigate to negotiation modal
        navigate(`/pop-up/${userDetailsId?._id}`);
        break;
      case 2:
        // Navigate to order summary page with payment status
        navigate(`/order-summary/${userDetailsId?._id}`, {
          state: {
            paymentStatus: paymentStatus || "PENDING",
            bookingData: booking
          }
        });
        break;
      default:
        console.error("Invalid reDirectTo value:", reDirectTo);
    }
  };
const handleSubmitReview = async () => {
  try {
    console.log(selectedBooking); // Check booking object

    const response = await axios.post(
      `${BACKEND_URL}/reviews/add`,
      {
        serviceId: selectedBooking.userDetailsId.serviceId[0],
        rating,
        reviewMessage,
      },
      {
        withCredentials: true,
      }
    );

    if (response.data.success) {
      alert("Review submitted successfully!");
setRating(0);
      setReviewMessage("");
      setSelectedBooking(null);
      setShowReviewModal(false);
      
    }
  } catch (error) {
    console.error(error);
    alert(error.response?.data?.message || "Failed to submit review");
    setRating(0);
      setReviewMessage("");
      setSelectedBooking(null);
    setShowReviewModal(false);
  }
};
  return (
    <div className={clsx('profile_section', 'relative', 'w-full', 'flex', 'bg-white')}>
      {/* ✅ Password Success Notification */}
      {showSuccessPopup && (
        <div className={clsx('fixed', 'top-[115px]', 'left-1/2', '-translate-x-1/2', 'py-3', 'px-6', 'rounded-lg', 'bg-green-600', 'text-white', 'font-semibold', 'z-[9999]')}>
          ✅ Password updated successfully!
        </div>
      )}

      {/* ✅ Sidebar */}
      <div className="profile-sidebar-fixed">
        <button
          className={clsx('profile-hamburger', 'lg:hidden', 'fixed', 'top-4', 'left-4', 'z-50', 'bg-blue-600', 'text-white', 'p-2', 'rounded-md', 'shadow-md')}
          onClick={() => setIsSidebarOpen((p) => !p)}
        >
          {isSidebarOpen ? "✕" : "☰"}
        </button>
        <UserSideBar
          isOpen={isSidebarOpen}
          setShowPasswordModal={setShowPasswordModal}
        />
      </div>

      {/* ✅ Main Content */}
      <div className={clsx('profile-scrollable-content', 'md:ml-[-200px]', 'ml-0', 'lg:ml-8', 'sm:ml-0', 'w-full', 'p-4')}>
        <h2 className={clsx('text-3xl', 'font-bold', 'text-center', 'mb-6')}>My Bookings</h2>

        {/* ================= Filter + Sort UI ================= */}
        <div className={clsx('flex', 'flex-wrap', 'items-center', 'justify-between', 'mb-6', 'gap-4')}>
          <div className={clsx('flex', 'flex-wrap', 'gap-3')}>
            {[
              {
                label: "Booking",
                value: filterStatus,
                setter: setFilterStatus,
                options: [
                  "All",
                  "CONFIRMED",
                  "COMPLETED",
                  "CANCELLED",
                  "PENDING",
                ],
              },
              {
                label: "Payment",
                value: filterPayment,
                setter: setFilterPayment,
                options: ["All", "PAID", "PENDING", "FAILED"],
              },
              {
                label: "Event",
                value: filterDate,
                setter: setFilterDate,
                options: ["All", "This Week", "This Month", "This Year"],
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={clsx('filter-sort-box', 'flex', 'items-center', 'gap-2', 'bg-gradient-to-r', 'from-amber-100', 'to-orange-50', 'border', 'border-amber-300', 'rounded-lg', 'px-3', 'py-2', 'shadow-sm', 'hover:shadow-md', 'transition-all', 'duration-300')}
              >
                <span className={clsx('text-sm', 'font-semibold', 'text-amber-700')}>
                  {item.label}:
                </span>
                <select
                  className={clsx('text-sm', 'bg-transparent', 'text-gray-800', 'font-medium', 'outline-none', 'cursor-pointer', 'pr-4', 'border-none', 'focus:ring-0')}
                  style={{ appearance: "none" }}
                  value={item.value}
                  onChange={(e) => item.setter(e.target.value)}
                >
                  {item.options.map((o) => (
                    <option key={o} className={clsx('text-gray-800', 'bg-white')}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* ✅ Sort Dropdown */}
          <div className={clsx('filter-sort-box', 'flex', 'items-center', 'gap-2', 'bg-gradient-to-r', 'from-blue-100', 'to-indigo-50', 'border', 'border-blue-300', 'rounded-lg', 'px-3', 'py-2', 'shadow-sm', 'hover:shadow-md', 'transition-all', 'duration-300')}>
            <span className={clsx('text-sm', 'font-semibold', 'text-blue-700')}>Sort:</span>
            <select
              className={clsx('text-sm', 'bg-transparent', 'text-gray-800', 'font-medium', 'outline-none', 'cursor-pointer', 'pr-4', 'border-none', 'focus:ring-0')}
              style={{ appearance: "none" }}
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option className={clsx('text-gray-800', 'bg-white')}>Newest First</option>
              <option className={clsx('text-gray-800', 'bg-white')}>Oldest First</option>
              <option className={clsx('text-gray-800', 'bg-white')}>Highest Amount</option>
              <option className={clsx('text-gray-800', 'bg-white')}>Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* ✅ Booking Cards */}
        <div className={clsx('h-[90vh]', 'overflow-y-auto', '[scrollbar-width:none]', '[-ms-overflow-style:none]', '[&::-webkit-scrollbar]:hidden')}>
          {loadingBookings ? (
            <p className={clsx('text-center', 'text-lg', 'font-semibold')}>
              Loading bookings...
            </p>
          ) : bookingError ? (
            <div className={clsx('text-center', 'p-4', 'bg-red-50', 'border', 'border-red-200', 'rounded-lg')}>
              <p className={clsx('text-red-600', 'font-semibold')}>Failed to load bookings</p>
              <p className={clsx('text-sm', 'text-red-500')}>{bookingError}</p>
              <button onClick={fetchBookings} className={clsx('mt-2', 'px-4', 'py-2', 'bg-red-600', 'text-white', 'rounded')}>Retry</button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <p className={clsx('text-center', 'text-lg', 'font-semibold')}>
              No bookings found
            </p>
          ) : (
            filteredBookings.map((b, i) => (
              <div
                key={i}
                onClick={() => handleBookingClick(b)}
                className={clsx('w-[90%]', 'md:w-[80%]', 'mx-auto', 'flex', 'flex-col', 'md:flex-row', 'gap-6', 'p-6', 'mb-6', 'bg-[#F8FAFD]', 'rounded-2xl', 'shadow-md', 'border', 'border-gray-400', 'hover:shadow-xl', 'transition-all', 'hover:scale-[0.98]', 'cursor-pointer')}
              >
                {/* Booking Icon/Visual */}
                <div className={clsx('w-full', 'md:w-40', 'h-40', 'md:h-36', 'rounded-xl', 'overflow-hidden', 'shrink-0', 'mx-auto', 'md:mx-0', 'bg-gradient-to-br', 'from-blue-500', 'to-blue-700', 'flex', 'items-center', 'justify-center')}>
                  <div className={clsx('text-center', 'text-white')}>
                    <p className={clsx('text-4xl', 'font-bold')}>
                      {b?.totalServices || 0}
                    </p>
                    <p className={clsx('text-sm', 'mt-1')}>
                      Service{b?.totalServices !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className={clsx('flex-1', 'flex', 'flex-col', 'justify-between')}>
                  <h3 className={clsx('text-lg', 'md:text-xl', 'font-bold', 'text-[#001F3F]', 'mb-2')}>
                    Booking Session
                  </h3>

                  <div className={clsx('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-y-2', 'text-[15px]')}>
                    {/* Left info */}
                    <div className="space-y-1">
                      <p>
                        <span className="font-semibold">Location:</span>{" "}
                        {b?.userDetailsId?.address || b?.location}
                      </p>
                      <p className="font-semibold">Event Period:</p>
                      <p>
                        Start:{" "}
                        {formatDate(
                          b?.userDetailsId?.startDate || b?.startDate
                        )}
                      </p>
                      <p>
                        End:{" "}
                        {formatDate(b?.userDetailsId?.endDate || b?.endDate)}
                      </p>
                      <p>
                        <span className="font-semibold">Total Services:</span>{" "}
                        <span className={clsx('text-blue-700', 'font-bold')}>
                          {b?.totalServices || 0}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">Status:</span>{" "}
                        <span className={clsx('text-blue-700', 'font-bold')}>
                          {b?.bookingStatus}
                        </span>
                      </p>
                    </div>

                    {/* Right info */}
                    <div className="space-y-1">
                      <p>
                        <span className="font-semibold">Total Amount:</span> ₹
                        {b?.amount?.toLocaleString("en-IN") || 0}
                      </p>
                      <p>
                        <span className="font-semibold">Payment Mode:</span>{" "}
                        {b?.paymentMode}
                      </p>
                      <p className="font-semibold">
                        Payment:
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-bold rounded-lg 
                ${
                  b?.paymentStatus === "PAID"
                    ? "bg-green-100 text-green-700"
                    : b?.paymentStatus === "FAILED"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
                        >
                          {b?.paymentStatus}
                        </span>
                      </p>
                      {b?.transactionId && (
                        <p className={clsx('text-xs', 'text-gray-600')}>
                          Txn: {b.transactionId.substring(0, 12)}...
                        </p>
                      )}
                    </div>
                  </div>

                <div className={clsx('flex', 'justify-between', 'items-center', 'mt-4')}>

  <div className={clsx('flex', 'gap-3')}>

    {b?.paymentStatus === "PAID" && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      setSelectedBooking(b);
      setShowReviewModal(true);
    }}
    className={clsx(
      "bg-[#001F3F]",
      "hover:bg-[#003165]",
      "text-white",
      "px-4",
      "py-2",
      "rounded-md",
      "flex",
      "items-center",
      "gap-2"
    )}
  >
    Write Review
  </button>
)}
    
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigate("/report", {
          state: { selectedType: "user" },
        });
      }}
      className={clsx('bg-[#001F3F]', 'hover:bg-[#003165]', 'text-white', 'px-4', 'py-2', 'rounded-md', 'flex', 'items-center', 'gap-2')}
    >
      <MdReportGmailerrorred size={20} />
      Report
    </button>

  </div>

</div>
                </div>
              </div>
            ))
          )}
        </div>
        {showReviewModal && (
  <div className={clsx('fixed', 'inset-0', 'bg-black/40', 'flex', 'justify-center', 'items-center', 'z-50')}>

    <div className={clsx('bg-white', 'w-[500px]', 'rounded-xl', 'p-6')}>

      <h2 className={clsx('text-2xl', 'font-bold', 'mb-4')}>
        Rate Your Experience
      </h2>

      <div className={clsx('flex', 'gap-3', 'justify-center', 'mb-5')}>
        {[1,2,3,4,5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`text-4xl ${
              rating >= star
                ? "text-yellow-500"
                : "text-gray-300"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        rows={5}
        value={reviewMessage}
        onChange={(e)=>setReviewMessage(e.target.value)}
        placeholder="Write your review..."
        className={clsx('w-full', 'border', 'rounded-lg', 'p-3')}
      />

      <div className={clsx('flex', 'justify-end', 'gap-3', 'mt-5')}>

        <button
          onClick={() => setShowReviewModal(false)}
          className={clsx('bg-gray-300', 'px-4', 'py-2', 'rounded')}
        >
          Cancel
        </button>

        <button
          onClick={handleSubmitReview}
          className={clsx('bg-blue-600', 'text-white', 'px-4', 'py-2', 'rounded')}
        >
          Submit Review
        </button>

      </div>

    </div>

  </div>
)}
      </div>

      {/* ✅ Password Change Modal */}
      {/* Password Change Modal */}
{showPasswordModal && (
  <div
    className={clsx(
      "fixed inset-0 z-50 flex items-center justify-center",
      "bg-black/30 px-4"
    )}
  >
    <div
      className={clsx(
        "w-full max-w-md",
        "bg-white rounded-xl shadow-2xl",
        "p-6"
      )}
    >
      <h3 className="text-xl font-bold text-center text-gray-800 mb-6">
        Change Password
      </h3>

      <div className="space-y-4">
        <PasswordInput
          placeholder="Current Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />

        <PasswordInput
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <PasswordInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      {errorMsg && (
        <p className="text-red-500 text-sm mt-4 text-center">
          {errorMsg}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() =>
              setShowPasswordModal(false)}
          className={clsx(
            "px-5 py-2",
            "bg-gray-300 hover:bg-gray-400",
            "rounded-lg transition-colors duration-200"
          )}
        >
          Cancel
        </button>

        <button
          onClick={handlePasswordChangeSubmit}
          className={clsx(
            "px-5 py-2",
            "bg-blue-600 hover:bg-blue-700",
            "text-white rounded-lg",
            "transition-colors duration-200"
          )}
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default Profile;

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./DashBoardSideBar.css";
import VerifyIntroModal from "./VerifyIntroModal.jsx";
import ThankYouModal from "./ThankYouModal.jsx";
import { FaCamera, FaUpload, FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { UseVendorProfile } from "./UseVendorProfile.jsx";
import axios from "axios";
import { setVendor } from "../../redux/VendorSlice.js";
import { IoKey } from "react-icons/io5";
import { BsBank } from "react-icons/bs";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { MdOutlineEdit, MdSave, MdCancel } from "react-icons/md";
import { BACKEND_URL } from "../../utils/constant.js";
import {
  MdDashboard,
  MdBookOnline,
  MdAnalytics,
  MdPeople,
} from "react-icons/md";
import { MdVerified } from "react-icons/md";
import { IoClose, IoShieldCheckmark, IoArrowBack, IoCheckmarkCircle } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";

const NAV_ITEMS = [
  { key: "services",  label: "My Services",  icon: MdDashboard },
  { key: "bookings",  label: "My Bookings",  icon: MdBookOnline },
  { key: "analytics", label: "My Analytics", icon: MdAnalytics },
  { key: "customers", label: "My Customers", icon: MdPeople },
];

const VERIFY_PLANS = [
  { key: "1m",  duration: "1 Month",  price: 399,  perMonth: 300, badge: null, tier: "basic" },
  { key: "3m",  duration: "3 Months", price: 1099,  perMonth: 200, badge: "Save 33%", tier: "basic" },
  { key: "6m",  duration: "1 Months", price: 999, perMonth: 200, badge: "Most Popular", tier: "premium" },
  { key: "12m", duration: "3 Months", price: 2399, perMonth: 200, badge: "Best Value", tier: "premium" },
];

const VERIFY_TIERS = [
  { key: "basic", label: "Basic Verify" },
  { key: "premium", label: "Premium Verify" },
];

function DashBoardSideBar({
  isOpen,
  isVerified,
  setConfirmPasswordModal,
  setIsVerified,
  setVendorShowPasswordModal,
  activeTab,
  setActiveTab,
  closeSidebar,
}) {
  const dispatch = useDispatch();
  const vendor = useSelector((state) => state.vendor.vendor);

  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showProfileSection, setShowProfileSection] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showVerifyIntro, setShowVerifyIntro] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("6m");

  // ✅ Service selection for verification
  const [showServiceSelect, setShowServiceSelect] = useState(false);
  const [vendorServices, setVendorServices] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const { form, updateField, updateVendor, updateBank, resetForm } = UseVendorProfile();

  useEffect(() => {
    if (!isVerified) return;
    if (editMode) {
      (async () => {
        await updateVendor();
        await updateBank();
        setEditMode(false);
        setIsVerified(false);
      })();
    }
  }, [isVerified, editMode]);

  const handleToggleEdit = () => {
    if (editMode) setConfirmPasswordModal(true);
    else setEditMode(true);
  };

  const handleCancelEdit = () => {
    resetForm();
    setEditMode(false);
  };

  const getInitialsAvatar = (name) => {
    if (!name) return "NA";
    return name.split(" ").map((n) => n[0]?.toUpperCase()).join("").slice(0, 2);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file"); return; }
    if (file.size > 9 * 1024 * 1024) { alert("File size should be less than 9MB"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("vendorId", vendor._id);
      formData.append("profilePicture", file);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/vendors/upload-profile`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );
      dispatch(setVendor(res.data.data));
    } catch (err) {
      alert("Failed to upload profile photo.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleImageRemove = async () => {
    setRemoving(true);
    try {
      const formData = new FormData();
      formData.append("removeProfilePicture", "true");
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/vendors/${vendor._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );
      dispatch(setVendor(res.data.data));
    } catch (err) {
      alert("Failed to remove photo.");
    } finally {
      setRemoving(false);
      setShowRemoveConfirm(false);
    }
  };
  const handleVerificationRequest = async () => {
    try {
      const plan = VERIFY_PLANS.find(
        (p) => p.key === selectedPlan
      );

      if (!plan) {
        alert("Please select a plan");
        return;
      }

      if (selectedServiceIds.length === 0) {
        alert("Please select at least one service to verify");
        return;
      }

      const response = await axios.put(
        `${BACKEND_URL}/vendors/verification-request`,
        {
          serviceIds: selectedServiceIds,
          duration: plan.duration,
          amount: plan.price,
          tier: plan.tier,
        },
        {
          withCredentials: true,
        }
      );

      setShowVerifyModal(false);
      setShowServiceSelect(false);
      setSelectedServiceIds([]);
      setShowThankYou(true);

      console.log(response.data);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to submit verification request";
      alert(message);
      setShowVerifyModal(false);
    }
  };

  // ✅ Fetch vendor services for verification selection
  const fetchVendorServices = async () => {
    setLoadingServices(true);
    try {
      const res = await axios.get(
        `${BACKEND_URL}/vendors/my-services`,
        { withCredentials: true }
      );
      if (res.data?.data?.length > 0) {
        setVendorServices(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch services for verification", err);
      alert("Failed to load your services. Please try again.");
    } finally {
      setLoadingServices(false);
    }
  };

  // ✅ Handle Verify My Service button click
  const handleVerifyMyServiceClick = async () => {
    await fetchVendorServices();
    setShowServiceSelect(true);
  };

  /* Closes the pricing modal AND the mobile sidebar drawer, returning the
     user fully back to the dashboard (hamburger/3-line state). */
  const handleVerifyBack = () => {
    setShowVerifyModal(false);
    if (closeSidebar) closeSidebar();
  };

  /* On mobile, the sidebar is a drawer that overlays the page. Modals like
     Change Password render on top of it (via App.jsx / portals) but the
     drawer itself stays open behind them, which looks broken. Give the
     user a couple seconds to see the drawer register the tap, then slide
     it away automatically so only the modal is left on screen. */
  const closeMobileSidebarSoon = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 768 && closeSidebar) {
      setTimeout(() => closeSidebar(), 2000);
    }
  };

  const handleChangePasswordClick = () => {
    setVendorShowPasswordModal(true);
    closeMobileSidebarSoon();
  };

  return (
    <aside className={`dash-sidebar ${isOpen ? "open" : ""}`}>
      {/* Replaced Logo with Profile Card at the top */}
      <div className="sb-avatar-card" style={{ margin: "20px 16px 30px 16px", padding: "20px 16px", borderRadius: "16px" }}>
        <div className="sb-avatar-wrap" onClick={() => document.getElementById("vendor-photo").click()}>
          {vendor?.profilePicture ? (
            <img src={vendor.profilePicture} alt="Profile" className="sb-avatar-img" />
          ) : (
            <div className="sb-avatar-initials">{getInitialsAvatar(form.fullName)}</div>
          )}
          <div className="sb-camera-badge">
            {uploading ? <FaUpload className="spinning" size={12} /> : <FaCamera size={12} />}
          </div>
        </div>
        <input 
          type="file" 
          id="vendor-photo" 
          accept="image/*"
          onChange={handleImageUpload} 
          style={{ display: "none" }} 
          disabled={uploading} 
        />

        <div className="sb-vendor-name" style={{ fontSize: "18px", marginTop: "12px" }}>
          {editMode ? (
            <input 
              type="text" 
              value={form.fullName} 
              className="sb-edit-input"
              onChange={(e) => updateField("fullName", e.target.value)} 
            />
          ) : (
            <span>{form.fullName?.toUpperCase()}</span>
          )}
        </div>
        <div className={`sb-status-badge ${form.active ? "sb-active" : "sb-inactive"}`}>
          <span className="sb-status-dot" />
          {form.active ? "Active" : "Inactive"}
        </div>
      </div>

      <div className="sb-body">
        {/* Navigation */}
        <nav className="sb-nav">
          <div className="sb-nav-label">Navigation</div>
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`sb-nav-item ${activeTab === key ? "sb-nav-active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              <Icon size={18} className="sb-nav-icon" />
              <span>{label}</span>
              {activeTab === key && <span className="sb-nav-pip" />}
            </button>
          ))}

          <button className="sb-verify-btn" onClick={handleVerifyMyServiceClick}>
            <span className="sb-verify-shine" />
            <span className="sb-verify-icon"><IoShieldCheckmark size={17} /></span>
            <span className="sb-verify-text">Verify My Service</span>
            <MdVerified size={16} className="sb-verify-badge" />
          </button>
        </nav>

        {/* Profile Details (collapsible) */}
        <div className="sb-section">
          <button className="sb-section-toggle" onClick={() => setShowProfileSection(!showProfileSection)}>
            <span className="sb-nav-label" style={{ margin: 0 }}>Profile Details</span>
            <span className="text-gray-400">{showProfileSection ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
          </button>

          {showProfileSection && (
            <div className="sb-profile-details">
              <div className="sb-detail-row">
                <span className="sb-detail-label">Email</span>
                {editMode ? (
                  <input type="email" value={form.email} className="sb-edit-input"
                    onChange={(e) => updateField("email", e.target.value)} />
                ) : (
                  <span className="sb-detail-val">{form.email}</span>
                )}
              </div>
              <div className="sb-detail-row">
                <span className="sb-detail-label">Phone</span>
                {editMode ? (
                  <input type="text" value={form.phoneNumber} className="sb-edit-input"
                    onChange={(e) => updateField("phoneNumber", e.target.value)} />
                ) : (
                  <span className="sb-detail-val">{form.phoneNumber}</span>
                )}
              </div>
              <div className="sb-detail-row">
                <span className="sb-detail-label">Events Hosted</span>
                <span className="sb-events-badge">{vendor?.eventsHosted ?? 0}</span>
              </div>
              {editMode && (
                <div className="sb-detail-row" style={{ alignItems: "center" }}>
                  <span className="sb-detail-label">Status</span>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <div style={{ position: "relative", width: 44, height: 24 }}>
                      <input type="checkbox" checked={form.active}
                        onChange={() => updateField("active", !form.active)}
                        style={{ opacity: 0, width: 0, height: 0 }} />
                      <div style={{
                        position: "absolute", inset: 0, borderRadius: 12,
                        background: form.active ? "#22c55e" : "#6b7280", transition: "background 0.3s"
                      }} />
                      <div style={{
                        position: "absolute", top: 3, left: form.active ? 23 : 3,
                        width: 18, height: 18, borderRadius: "50%", background: "#fff",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.3)", transition: "left 0.3s"
                      }} />
                    </div>
                    <span style={{ color: "#fff", fontSize: 13 }}>{form.active ? "Active" : "Inactive"}</span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Account actions */}
        <div className="sb-section">
          <div className="sb-nav-label">Account</div>
          <button className="sb-action-btn" onClick={handleChangePasswordClick}>
            <IoKey size={15} /> Change Password
          </button>
          <button className="sb-action-btn"
            onClick={() => updateField("bankDropdownOpen", !form.bankDropdownOpen)}>
            <BsBank size={14} />
            <span>Bank Details</span>
            <span style={{ marginLeft: "auto" }}>{form.bankDropdownOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
          </button>

          {form.bankDropdownOpen && (
            <div className="sb-bank-panel">
              <div className="sb-bank-row">
                <span>Account No.</span>
                {editMode ? (
                  <input type="text" value={form.tempAccountNumber} className="sb-edit-input"
                    style={{ color: "#000" }}
                    onChange={(e) => updateField("tempAccountNumber", e.target.value)} />
                ) : (
                  <span>****{form.accountNumber?.slice(-4)}</span>
                )}
              </div>
              <div className="sb-bank-row">
                <span>IFSC</span>
                {editMode ? (
                  <input type="text" value={form.tempIfscCode} className="sb-edit-input"
                    style={{ color: "#000" }}
                    onChange={(e) => updateField("tempIfscCode", e.target.value)} />
                ) : (
                  <span>{form.ifscCode}</span>
                )}
              </div>
            </div>
          )}

          {editMode ? (
            <div className="sb-edit-actions">
              <button onClick={handleToggleEdit} className="sb-btn-save"><MdSave size={14} /> Save</button>
              <button onClick={handleCancelEdit} className="sb-btn-cancel"><MdCancel size={14} /> Cancel</button>
            </div>
          ) : (
            <button className="sb-action-btn"onClick={() => setActiveTab("profile")}>
            <MdOutlineEdit size={15} />
            Edit Profile
            </button>
          )}

          {vendor?.profilePicture && (
            <button className={clsx('sb-action-btn', 'sb-action-danger')}
              onClick={() => setShowRemoveConfirm(true)} disabled={uploading || removing}>
              <FaTrash size={12} />
              {removing ? "Removing..." : "Remove Photo"}
            </button>
          )}
        </div>
      </div>

      {/* Remove confirm modal */}
      {showRemoveConfirm && createPortal(
        <div className="sb-overlay">
          <div className="sb-confirm-box">
            <h3 style={{ fontWeight: 700, color: "#001f3f", marginBottom: 8 }}>Remove Profile Photo?</h3>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="sb-btn-save" style={{ flex: 1 }} onClick={handleImageRemove} disabled={removing}>
                {removing ? "Removing..." : "Yes, Remove"}
              </button>
              <button className="sb-btn-cancel" style={{ flex: 1 }} onClick={() => setShowRemoveConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Verify Intro modal — "Why verify" step with the lamp */}
      {showVerifyIntro && createPortal(
        <VerifyIntroModal
          onClose={() => setShowVerifyIntro(false)}
          onAgree={() => {
            setShowVerifyIntro(false);
            setShowVerifyModal(true);
          }}
        />,
        document.body
      )}

      {/* ✅ Service Selection Modal — select which service to verify */}
      {showServiceSelect && createPortal(
        <div className="sb-overlay" onClick={() => setShowServiceSelect(false)}>
          <div className="sb-verify-modal" onClick={(e) => e.stopPropagation()}>
            <button className="sb-verify-close" onClick={() => setShowServiceSelect(false)}>
              <IoClose size={20} />
            </button>

            <div className="sb-verify-modal-icon">
              <IoShieldCheckmark size={30} />
            </div>
            <h2 className="sb-verify-modal-title">Verify My Service</h2>
            <p className="sb-verify-modal-sub">
              Select the services you want to verify. You can choose multiple services.
            </p>

            {loadingServices ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                Loading your services...
              </div>
            ) : vendorServices.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                You don't have any services yet. Please create a service first.
              </div>
            ) : (
              <div className="sb-verify-plans" style={{ flexDirection: "column", gap: "10px", maxHeight: "300px", overflowY: "auto" }}>
                {vendorServices.map((service) => {
                  const isSelected = selectedServiceIds.includes(service._id);
                  return (
                    <button
                      key={service._id}
                      className={`sb-plan-card ${isSelected ? "sb-plan-selected" : ""}`}
                      onClick={() => {
                        setSelectedServiceIds((prev) =>
                          prev.includes(service._id)
                            ? prev.filter((id) => id !== service._id)
                            : [...prev, service._id]
                        );
                      }}
                      style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", textAlign: "left" }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: "#ffffff", fontSize: "14px" }}>
                          {service.serviceName}
                        </div>
                        <div style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "2px" }}>
                          {service.serviceCategory}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="sb-plan-check" style={{ marginLeft: "10px", flexShrink: 0 }}>
                          <IoCheckmarkCircle size={22} color="#22c55e" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

              <button
                className="sb-verify-ok-btn"
                onClick={() => {
                  if (selectedServiceIds.length === 0) {
                    alert("Please select at least one service to verify");
                    return;
                  }
                  setShowServiceSelect(false);
                  setShowVerifyModal(true);
                }}
                disabled={selectedServiceIds.length === 0 || loadingServices}
                style={{ opacity: (selectedServiceIds.length === 0 || loadingServices) ? 0.5 : 1, cursor: (selectedServiceIds.length === 0 || loadingServices) ? "not-allowed" : "pointer" }}
              >
                <span className="sb-verify-ok-shine" />
                Continue
              </button>
          </div>
        </div>,
        document.body
      )}
      {/* Verify My Service modal */}
      {showVerifyModal && createPortal(
        <div className="sb-overlay" onClick={() => setShowVerifyModal(false)}>
          <div className="sb-verify-modal" onClick={(e) => e.stopPropagation()}>
            <button className="sb-verify-back" onClick={handleVerifyBack} title="Back">
              <IoArrowBack size={20} />
            </button>
            <button className="sb-verify-close" onClick={() => setShowVerifyModal(false)}>
              <IoClose size={20} />
            </button>

            <div className="sb-verify-modal-icon">
              <IoShieldCheckmark size={30} />
            </div>
            <h2 className="sb-verify-modal-title">Verify My Service</h2>
            <p className="sb-verify-modal-sub">
              Get a verified badge on your profile and win more customer trust. Choose a plan below.
            </p>

            {VERIFY_TIERS.map((tier) => (
              <div className="sb-tier-group" key={tier.key}>
                <div className={`sb-tier-label sb-tier-${tier.key}`}>{tier.label}</div>
                <div className="sb-verify-plans">
                 {VERIFY_PLANS
        .filter((plan) => plan.tier === tier.key)
        .map((plan) => (
          <button
            key={plan.key}
            className={`sb-plan-card ${
              selectedPlan === plan.key ? "sb-plan-selected" : ""
            }`}
            onClick={() => setSelectedPlan(plan.key)}
          >
                      {plan.badge && <span className="sb-plan-badge">{plan.badge}</span>}
                      <span className="sb-plan-duration">{plan.duration}</span>
                      <span className="sb-plan-price">
                        <span className="sb-plan-currency">₹</span>{plan.price}
                      </span>
                      <span className="sb-plan-permonth">₹{plan.perMonth}/month</span>
                      <span className="sb-plan-check"><FaCheck size={11} /></span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button className="sb-verify-ok-btn" onClick={handleVerificationRequest }>
              <span className="sb-verify-ok-shine" />
              Request
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Thank you modal — shown after a successful verification request */}
      {showThankYou && createPortal(
        <ThankYouModal onClose={() => setShowThankYou(false)} />,
        document.body
      )}
    </aside>
  );
}

export default DashBoardSideBar;
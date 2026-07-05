import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./Navbar.css";
import { FaSearch } from "react-icons/fa";
import logoImg from "../../assets/EventsBridgeOnlyLogo.png";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, fetchCart, setCartCount } from "../../redux/UserSlice.js";
import socket from "../../socket/socketClient.js";
import { clearVendor } from "../../redux/VendorSlice.js";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import CartButton from "./navbar/CartButton";
import ProfileMenu from "./navbar/ProfileMenu";
import VendorMenu from "./navbar/VendorMenu";
import ThreeDot from "./navbar/ThreeDot";
import CategoryData from "../../utils/CatogoryData.jsx";

const CATEGORIES = [
  "dj","band","tenthouse","photographer","pandit","magic","cultural-troupe",
  "bouncers-security","stars-influencers","catering","makeup","floral","transport","fireworks","card-design",
];

const Navbar = ({ onOpenLogin, onOpenRegister, onOpenVendorLogin }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user);

  const [currentUser, setCurrentUser] = useState(null);
  const [userFirstName, setUserFirstName] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showEllipsisDropdown, setShowEllipsisDropdown] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [VendorFirstName, setVendorFirstName] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [showMobileSearchBar, setShowMobileSearchBar] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showVendorLogoutPopup, setShowVendorLogoutPopup] = useState(false);

  const profileRef = useRef(null);
  const ellipsisRef = useRef(null);
  const vendorRef = useRef(null);
  const inputRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const suggestionRef = useRef(null);
  const searchBarRef = useRef(null);


  useEffect(() => {
    const storedName = localStorage.getItem("userFirstName");
    if (storedName) { setUserFirstName(storedName); dispatch(fetchCart()); }
  }, [dispatch]);

  useEffect(() => {
    const handleCartUpdate = (data) => { dispatch(setCartCount(data.count)); };
    socket.on("cart-updated", handleCartUpdate);
    return () => { socket.off("cart-updated", handleCartUpdate); };
  }, [dispatch]);

  const handleSearchicon = (e) => {
    e.stopPropagation();
    if (window.innerWidth <= 768) { setShowMobileSearchBar((prev) => !prev); }
    else { setShowMobileSearchBar(true); if (inputRef.current) inputRef.current.focus(); }
  };

  const handleSearchNavigate = (text) => {
    if (!text.trim()) return;

    const keyword = text.toLowerCase();

    const category = CategoryData.find(cat =>
        cat.title.toLowerCase().includes(keyword) ||
        (cat.keywords &&
            cat.keywords.some(k =>
                k.toLowerCase().includes(keyword)
            ))
    );

    if (category) {
    navigate(
        `/category/${encodeURIComponent(category.title)}`,
        {
            state: { category },
        }
    );
    return;
}

    navigate(`/search?query=${encodeURIComponent(text)}`);
};

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/user/profile`, { withCredentials: true });
      if (res.data.success) setCurrentUser(res.data.data);
      else setCurrentUser(null);
    } catch (err) { setCurrentUser(null); }
  };

  useEffect(() => { fetchUserProfile(); }, []);

  const handleHomeClick = () => {
    if (location.pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
    else navigate("/");
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/user/logout`, {}, { withCredentials: true });
      localStorage.removeItem("userFirstName");
      localStorage.removeItem("currentlyLoggedIn");
      setUserFirstName(null);
      dispatch(clearUser());
      setShowLogoutPopup(true);
      setTimeout(() => { setShowLogoutPopup(false); navigate("/", { replace: true }); }, 3000);
    } catch (error) { alert("Logout failed. Please try again."); }
  };

  const vendorLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/vendors/logout`, {}, { withCredentials: true });
      localStorage.removeItem("VendorFullName");
      localStorage.removeItem("VendorFirstName");
      localStorage.removeItem("VendorInitial");
      localStorage.removeItem("VendorCurrentlyLoggedIn");
      setVendorFirstName(null);
      dispatch(clearVendor());
      setShowVendorLogoutPopup(true);
      setTimeout(() => { setShowVendorLogoutPopup(false); navigate("/", { replace: true }); }, 3000);
    } catch (error) { alert("Failed to logout"); }
  };

  const handleLoginClick = () => { setShowProfileDropdown(false); onOpenLogin(); };
  const handleSignupClick = () => { setShowProfileDropdown(false); onOpenRegister(); };

  useEffect(() => {
    const handleClickOutsideAll = (event) => {
      if (
        profileRef.current && !profileRef.current.contains(event.target) &&
        vendorRef.current && !vendorRef.current.contains(event.target) &&
        ellipsisRef.current && !ellipsisRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
        setShowVendorDropdown(false);
        setShowEllipsisDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideAll);
    return () => document.removeEventListener("mousedown", handleClickOutsideAll);
  }, []);

  useEffect(() => {
    const handleClickOutsideSearch = (e) => {
      const out1 = searchBarRef.current && !searchBarRef.current.contains(e.target);
      const out2 = mobileSearchRef.current && !mobileSearchRef.current.contains(e.target);
      if (showMobileSearchBar && (out1 || out2)) setShowMobileSearchBar(false);
    };
    document.addEventListener("mousedown", handleClickOutsideSearch);
    return () => document.removeEventListener("mousedown", handleClickOutsideSearch);
  }, [showMobileSearchBar]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const updateName = () => {
      setUserFirstName(localStorage.getItem("userFirstName"));
      setVendorFirstName(localStorage.getItem("VendorFirstName"));
    };
    updateName();
    window.addEventListener("userLoggedIn", updateName);
    return () => window.removeEventListener("userLoggedIn", updateName);
  }, []);

  const placeholders = [
    "Search events...", "e.g, DJ Services", "e.g, Catering", "e.g, Photographer",
  ];
  const [placeholder, setPlaceholder] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = () => {
    const isLoggedIn = localStorage.getItem("currentlyLoggedIn") === "true";
    if (isLoggedIn) navigate("/your-cart");
    else onOpenLogin(true);
  };

const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;

    handleSearchNavigate(searchInput);

    setSearchInput("");
    setShowSuggestions(false);
};

  return (
    <>
      {/* ===== FIXED HEADER WRAPPER ===== */}
      <div className="navbar-fixed-wrapper">
      {/* ===== ANNOUNCEMENT BAR ===== */}
      <div className="announcement-bar">
        Your All-in-One Marketplace for Trusted Events Vendors
      </div>

      {/* ===== MAIN NAVBAR ===== */}
      <div className="align_center navbar">

        {/* Logout Popups */}
        {showLogoutPopup && (
          <div className="fixed top-[250px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white font-bold text-lg shadow-2xl border border-blue-700">
            You are logged out successfully!
          </div>
        )}
        {showVendorLogoutPopup && (
          <div className="fixed top-[115px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white font-bold text-lg shadow-2xl border border-blue-700">
            You are logged out successfully!
          </div>
        )}

        {/* Logo */}
        <div className="logo" onClick={handleHomeClick}>
          <img src={logoImg} alt="EventsBridge" className="logo-icon" />
          <span className="logo-text">EventsBridge</span>
        </div>

        {/* Right Side: Search + Auth */}
        <div className="search-and-nav-icons-container items-center">

          {/* Search Bar */}
          <div
            ref={searchBarRef}
            className={`search-bar ${showMobileSearchBar ? "active" : ""}`}
            onClick={(e) => { handleSearchicon(e); e.stopPropagation(); }}
          >
            <div className="searchbarIcon">
              <FaSearch
                className="search-icon"
                onClick={() => { if (searchInput.trim()) handleSearchNavigate(searchInput); }}
              />
            </div>
            {(showMobileSearchBar || window.innerWidth > 768) && (
              <input
                ref={inputRef}
                type="text"
                placeholder={placeholders[placeholder]}
                value={searchInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchInput(value);
                  if (value.trim().length <= 1) { setSuggestions([]); setShowSuggestions(false); return; }
                  // fetchDynamicSuggestions(value);
                  const text = value.toLowerCase();

        const matchedCategories = CategoryData.filter(cat =>

    cat.title.toLowerCase().includes(text) ||

    (cat.keywords &&
        cat.keywords.some(k =>
            k.toLowerCase().includes(text)
        ))
);

setSuggestions(
    matchedCategories.map(cat => ({
        id: cat.id,
        title: cat.title,
    }))
);


setShowSuggestions(true);
                }}
                autoFocus
                onKeyDown={handleKeyDown}
              />
            )}
          </div>

          {/* Suggestions */}
          {showSuggestions && (
            <div className="suggestions-dropdown" ref={suggestionRef}>
              {suggestions.length > 0 ? (
                suggestions.map((s, i) => (
                  <div key={i} className="suggestion-item"
                    onClick={() => {   navigate(`/category/${encodeURIComponent(s.title)}`, {
    state: {
      category: {
        id: s.id,
        title: s.title,
      },
    },
  });
; setSearchInput(""); setShowSuggestions(false); }}>
                    {s.title}
                  </div>
                ))
              ) : (
                <div className="suggestion-item no-results">No results found</div>
              )}
            </div>
          )}

          {/* Auth Buttons + existing icons */}
          <div className="flex items-center gap-2">

            <div className="nav-icons">
              {/* Profile — always visible */}
              <div ref={profileRef}>
                <ProfileMenu
                  userFirstName={userFirstName}
                  currentUser={currentUser}
                  showProfileDropdown={showProfileDropdown}
                  setShowProfileDropdown={setShowProfileDropdown}
                  handleLoginClick={handleLoginClick}
                  handleSignupClick={handleSignupClick}
                  handleLogout={handleLogout}
                  navigate={navigate}
                  setShowEllipsisDropdown={setShowEllipsisDropdown}
                  setShowVendorDropdown={setShowVendorDropdown}
                />
              </div>

              {/* Vendor — hidden on mobile (moved to 3-dot dropdown) */}
              <div ref={vendorRef} className="hidden-on-mobile">
                <VendorMenu
                  VendorFirstName={VendorFirstName}
                  userFirstName={userFirstName}
                  showVendorDropdown={showVendorDropdown}
                  setShowVendorDropdown={setShowVendorDropdown}
                  setShowProfileDropdown={setShowProfileDropdown}
                  setShowEllipsisDropdown={setShowEllipsisDropdown}
                  navigate={navigate}
                  onOpenVendorLogin={onOpenVendorLogin}
                  vendorLogout={vendorLogout}
                />
              </div>

              {/* Cart — hidden on mobile (moved to 3-dot dropdown) */}
              <div className="hidden-on-mobile">
                <CartButton cartCount={user.cartCount} handleAddToCart={handleAddToCart} />
              </div>
            </div>

            {/* Sign In / Get Started — shown when NOT logged in */}
            {!userFirstName && !VendorFirstName && (
              <div className="navbar-auth">
                <button className="signin-btn" onClick={handleLoginClick}>Sign In</button>
                <button className="get-started-btn" onClick={handleSignupClick}>Get Started</button>
              </div>
            )}

            {/* Three dots menu — now receives vendor & cart props for mobile */}
            <div ref={ellipsisRef}>
              <ThreeDot
                showEllipsisDropdown={showEllipsisDropdown}
                setShowEllipsisDropdown={setShowEllipsisDropdown}
                setShowVendorDropdown={setShowVendorDropdown}
                setShowProfileDropdown={setShowProfileDropdown}
                VendorFirstName={VendorFirstName}
                cartCount={user.cartCount}
                handleAddToCart={handleAddToCart}
                onOpenVendorLogin={onOpenVendorLogin}
                vendorLogout={vendorLogout}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Dropdown */}
      {showMobileSearchBar && window.innerWidth <= 768 && (
        <div ref={mobileSearchRef} className="mobile-search-bar-container active">
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholders[placeholder]}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            autoFocus
          />
        </div>
      )}
      </div>{/* end navbar-fixed-wrapper */}
    </>
  );
};

Navbar.propTypes = {
  onOpenLogin: PropTypes.func.isRequired,
  onOpenRegister: PropTypes.func.isRequired,
  onOpenVendorLogin: PropTypes.func.isRequired,
};

export default Navbar;

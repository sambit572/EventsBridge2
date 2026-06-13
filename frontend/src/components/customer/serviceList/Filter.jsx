import React, { useState, useEffect } from "react";
import "../../customer/serviceList/Filter.css";
import locationData from "./LocationData";
import { FaSlidersH, FaTimes, FaCheck, FaUndo } from "react-icons/fa";

const Filter = ({ onApply, onCancel }) => {
  const defaultFilters = {
    minPrice: "",
    maxPrice: "",
    rating: "",
    state: "",
    subdistrict: "",
    duration: "",
  };

  const [filters, setFilters] = useState(defaultFilters);
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState("price");
  const [states] = useState(Object.keys(locationData));
  const [subdistricts, setSubdistricts] = useState([]);
  const [animateIn, setAnimateIn] = useState(false);

  // Count active filters for the badge
  const activeCount = [
    filters.minPrice,
    filters.maxPrice,
    filters.rating,
    filters.state,
    filters.subdistrict,
    filters.duration,
    sortBy !== "price" ? sortBy : "",
  ].filter(Boolean).length;

  useEffect(() => {
    if (showFilter) {
      // slight delay so CSS transition fires after display:flex
      requestAnimationFrame(() => setAnimateIn(true));
      document.body.style.overflow = "hidden";
    } else {
      setAnimateIn(false);
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showFilter]);

  const handleRatingChange = (e) => {
    setFilters({ ...filters, rating: e.target.value ? Number(e.target.value) : "" });
  };
  const handleMinChange = (e) => {
    setFilters((prev) => ({ ...prev, minPrice: e.target.value }));
  };
  const handleMaxChange = (e) => {
    setFilters((prev) => ({ ...prev, maxPrice: e.target.value }));
  };
  const handleStateChange = (e) => {
    const state = e.target.value;
    setFilters({ ...filters, state, subdistrict: "" });
    setSubdistricts(locationData[state] || []);
  };
  const handleSubdistrictChange = (e) => {
    setFilters({ ...filters, subdistrict: e.target.value });
  };

  const handleApply = () => {
    onApply({ ...filters, sortBy });
    closeDrawer();
  };

  const handleCancel = () => {
    setFilters(defaultFilters);
    setSubdistricts([]);
    setSortBy("price");
    onCancel();
    closeDrawer();
  };

  const closeDrawer = () => {
    setAnimateIn(false);
    setTimeout(() => setShowFilter(false), 320);
  };

  return (
    <>
      {/* ── Floating Filter Button ── */}
      <button
        className="filter-fab"
        onClick={() => setShowFilter(true)}
        aria-label="Open filters"
      >
        <FaSlidersH className="fab-icon" />
        <span className="fab-label">Filters</span>
        {activeCount > 0 && (
          <span className="fab-badge">{activeCount}</span>
        )}
      </button>

      {/* ── Backdrop ── */}
      {showFilter && (
        <div
          className={`filter-backdrop ${animateIn ? "backdrop-visible" : ""}`}
          onClick={closeDrawer}
        />
      )}

      {/* ── Drawer ── */}
      {showFilter && (
        <div className={`filter-drawer ${animateIn ? "drawer-open" : ""}`}>
          {/* Header */}
          <div className="drawer-header">
            <div className="drawer-title">
              <FaSlidersH className="drawer-title-icon" />
              <span>Filters</span>
              {activeCount > 0 && (
                <span className="drawer-badge">{activeCount} active</span>
              )}
            </div>
            <button className="drawer-close" onClick={closeDrawer} aria-label="Close">
              <FaTimes />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="drawer-body">

            {/* Sort By */}
            <div className="filter-section">
              <label className="section-label">Sort By</label>
              <div className="sort-pills">
                {["price", "name", "duration", "rating"].map((opt) => (
                  <button
                    key={opt}
                    className={`sort-pill ${sortBy === opt ? "sort-pill-active" : ""}`}
                    onClick={() => setSortBy(opt)}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-divider" />

            {/* Price Range */}
            <div className="filter-section">
              <label className="section-label">Price Range (₹)</label>
              <div className="price-inputs">
                <div className="price-field">
                  <span className="price-symbol">₹</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={handleMinChange}
                    className="price-input"
                  />
                </div>
                <span className="price-dash">—</span>
                <div className="price-field">
                  <span className="price-symbol">₹</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={handleMaxChange}
                    className="price-input"
                  />
                </div>
              </div>
            </div>

            <div className="filter-divider" />

            {/* Customer Rating */}
            <div className="filter-section">
              <label className="section-label">Customer Rating</label>
              <div className="rating-pills">
                {[
                  { value: "", label: "Any" },
                  { value: "3", label: "3+ ★" },
                  { value: "3.5", label: "3.5+ ★" },
                  { value: "4", label: "4+ ★" },
                  { value: "4.5", label: "4.5+ ★" },
                  { value: "5", label: "5 ★" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    className={`rating-pill ${filters.rating === (value ? Number(value) : "") ? "rating-pill-active" : ""}`}
                    onClick={() =>
                      setFilters({ ...filters, rating: value ? Number(value) : "" })
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-divider" />

            {/* Location */}
            <div className="filter-section">
              <label className="section-label">Location</label>
              <div className="select-group">
                <div className="select-wrapper">
                  <label className="select-label">State</label>
                  <select
                    value={filters.state}
                    onChange={handleStateChange}
                    className="styled-select"
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="select-wrapper">
                  <label className="select-label">District</label>
                  <select
                    value={filters.subdistrict}
                    onChange={handleSubdistrictChange}
                    disabled={!filters.state}
                    className="styled-select"
                  >
                    <option value="">Select District</option>
                    {subdistricts.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="filter-divider" />

            {/* Service Ready Within */}
            <div className="filter-section">
              <label className="section-label">Service Ready Within</label>
              <div className="select-wrapper">
                <select
                  value={filters.duration}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      duration: e.target.value ? parseInt(e.target.value) : "",
                    })
                  }
                  className="styled-select"
                >
                  <option value="">Any time</option>
                  <option value={1}>12 Hours</option>
                  <option value={2}>1 Day</option>
                  <option value={3}>2 Days</option>
                  <option value={4}>3 Days</option>
                  <option value={5}>4 Days</option>
                  <option value={7}>1 Week</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="drawer-footer">
            <button className="btn-reset" onClick={handleCancel}>
              <FaUndo className="btn-icon" />
              Reset
            </button>
            <button className="btn-apply" onClick={handleApply}>
              <FaCheck className="btn-icon" />
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Filter;

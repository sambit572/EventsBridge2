import React from "react";
import { useNavigate } from "react-router-dom";
import { Seo } from "../../seo/seo";
import Register from "../common/Register.jsx";

const CustomerRegistration = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/");
  };

  const handleSwitchToLogin = () => {
    navigate("/");
    window.dispatchEvent(new Event("openLoginModal"));
  };

  return (
    <>
      <Seo
        title="Customer Registration | Find & Book Verified Event Vendors | EventsBridge"
        description="Create your free EventsBridge account to discover trusted event vendors, compare prices, negotiate directly, save favourites, track bookings and enjoy flexible EMI payment options for weddings, birthdays and corporate events."
      />
      <Register onClose={handleClose} onSwitchToLogin={handleSwitchToLogin} />
    </>
  );
};

export default CustomerRegistration;
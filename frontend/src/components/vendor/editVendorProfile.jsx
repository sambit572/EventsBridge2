import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { BACKEND_URL } from "../../utils/constant";
import { setVendor } from "../../redux/VendorSlice";
import "./editVendorProfile.css";

const EditProfile = () => {
  const dispatch = useDispatch();

  const vendor = useSelector((state) => state.vendor.vendor);

  const [form, setForm] = useState({
  fullName: "",
  email: "",
  phoneNumber: "",
});

useEffect(() => {
  if (vendor) {
    setForm({
      fullName: vendor.fullName || "",
      email: vendor.email || "",
      phoneNumber: vendor.phoneNumber || "",
    });
  }
}, [vendor]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
  const updatedFields = {};

  if (form.fullName !== vendor.fullName) {
    updatedFields.fullName = form.fullName;
  }

  if (form.email !== vendor.email) {
    updatedFields.email = form.email;
  }

  if (form.phoneNumber !== vendor.phoneNumber) {
    updatedFields.phoneNumber = form.phoneNumber;
  }

  if (Object.keys(updatedFields).length === 0) {
    return alert("No changes made");
  }

  try {
    setLoading(true);

    const res = await axios.put(
      `${BACKEND_URL}/vendors/update-profile`,
      updatedFields,
      {
        withCredentials: true,
      }
    );
    const updatedVendor = res.data.data;

// Update Redux
dispatch(setVendor(updatedVendor));

// Update localStorage also
localStorage.setItem("VendorFullName", updatedVendor.fullName);

const firstName = updatedVendor.fullName?.split(" ")[0] || "";
localStorage.setItem("VendorFirstName", firstName);

localStorage.setItem(
  "VendorInitial",
  firstName.charAt(0).toUpperCase()
);

window.dispatchEvent(new Event("userLoggedIn"));

alert("Profile Updated Successfully");
  } catch (err) {
    alert(err.response?.data?.message || "Failed to update profile");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="edit-profile">

      <div className="form-group">
        <label>Full Name</label>

        <input
          type="text"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Email</label>

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Phone Number</label>

        <input
          type="text"
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={handleChange}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Updating..." : "Save Changes"}
      </button>

    </div>
  );
};

export default EditProfile;
import React from "react";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import { Seo } from "../../seo/seo";

const ContactUs = () => {
  return (
    <>
      <Seo
        title="Contact EventsBridge | Event Booking Support, Vendor Registration & Customer Help"
        description="Need help with event bookings or vendor registration? Contact the EventsBridge support team for assistance with weddings, birthday events, corporate events, bookings, payments, negotiations, cancellations and customer support."
      />
      <div className="bg-[#fefcff] min-h-screen py-12 px-4 md:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[#001f3f]">Contact Us</h1>
            <p className="text-[#001f3f] mt-3 text-lg">
              We're here to help with bookings, vendor registration, payments
              and anything else you need.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 text-red-500 p-4 rounded-full">
                  <FaEnvelope className="text-2xl" />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-[#001f3f] mb-2">
                Email
              </h2>
              <a href="mailto:support@eventsbridge.com" className="text-[#001f3f] underline">
                support@eventsbridge.com
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
                  <FaPhoneAlt className="text-2xl" />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-[#001f3f] mb-2">
                Phone
              </h2>
              <a href="tel:+919348605002" className="text-[#001f3f]">
                +91 9348605002
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 text-green-600 p-4 rounded-full">
                  <FaMapMarkerAlt className="text-2xl" />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-[#001f3f] mb-2">
                Location
              </h2>
              <p className="text-[#001f3f]">Odisha, India</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;
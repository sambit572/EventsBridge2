import React from "react";
import { Seo } from "../../seo/seo";
import FaqSection from "../../components/customer/home/FaqSection.jsx";

const FaqPage = () => {
  return (
    <>
      <Seo
        title="EventsBridge FAQs | Event Booking, Payments, EMI, Vendor Registration & Support"
        description="Find answers to frequently asked questions about event bookings, live price negotiation, EMI payments, vendor verification, cancellations, refunds, customer support and how EventsBridge makes event planning easier."
      />
      <FaqSection />
    </>
  );
};

export default FaqPage;
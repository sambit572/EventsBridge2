// RefundPolicy.jsx
import React from "react";
import { Seo } from "../../seo/seo";

export default function RefundPolicy({
  siteName = "@ EVENTSBRIDGE",
  lastUpdated = "August 12, 2025",
}) {
  return (
    <>
      <Seo
        title={"Refund Policy"}
        description={
          "Learn about Eventsbridge refund and cancellation policy. Understand how refunds work, eligibility, timeframes and terms for event bookings."
        }
      />
      <main className="flex justify-center items-center bg-[#fafafa] px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-10">
        <article className="w-full max-w-5xl bg-white rounded-xl shadow-md p-5 sm:p-8 md:p-10 lg:p-12 text-base sm:text-[17px] leading-relaxed text-[#222]">
          {/* Header */}
          <header className="text-center mb-6">
            <h1 className="mb-6 text-2xl sm:text-3xl md:text-4xl font-bold underline text-[var(--accent)] font-sans">
              Refund Policy
            </h1>
          </header>

          {/* Section */}
          <section className="mt-5">
            <h2 className="my-3 text-lg sm:text-xl font-semibold text-[var(--accent)]">
              Introduction
            </h2>
            <p className="mb-4">
              We value the trust you place in our platform and are committed to
              providing fair and transparent refund practices. This Refund
              Policy explains the conditions under which refunds may be granted
              for bookings, products, or services purchased through our
              platform.
            </p>
            <p className="mb-4">
              EventsBridge operates as a platform that connects customers with
              independent third-party vendors. As such,{" "}
              <strong>
                refund and cancellation terms for the advance payment made at
                the time of booking are determined by the individual vendor
                providing the service
              </strong>
              , and may vary from vendor to vendor. Each vendor's specific
              refund and cancellation policy will be clearly displayed on their
              service/profile page, or communicated to the customer at the time
              of booking.
            </p>
            <p>
              Customers are strongly advised to carefully review a vendor's
              specific refund and cancellation terms before confirming payment
              and completing a booking. By proceeding with a booking, the
              customer agrees to be bound by that vendor's stated refund
              policy, in addition to the general terms below.
            </p>

            <h2 className="my-3 text-lg sm:text-xl font-semibold text-[var(--accent)] mt-6">
              General Terms Applicable Across the Platform
            </h2>
            <p className="mb-2">
              Regardless of the specific vendor's cancellation window or refund
              percentage, the following general terms apply to all eligible
              refunds processed through EventsBridge, unless a vendor's
              individual policy expressly states otherwise:
            </p>

            <ul className="list-disc pl-5 sm:pl-6 mt-6 space-y-4 sm:space-y-5">
              <li>
                Any refund amount payable will{" "}
                <strong>exclude applicable payment gateway charges</strong>,
                which are non-refundable.
              </li>
              <li>
                All eligible refunds shall be processed within{" "}
                <strong>five to seven (5–7)</strong> working days during
                standard operational hours{" "}
                <strong>(9:00 AM to 10:00 PM)</strong>, once approved.
              </li>
              <li>
                Refunds, where applicable, will be credited back to the{" "}
                <strong>original mode of payment</strong> used at the time of
                booking.
              </li>
              <li>
                In case of a disagreement or dispute regarding a vendor's
                refund decision, customers may reach out to EventsBridge
                support, and the platform will make reasonable efforts to
                facilitate a fair resolution between the customer and the
                vendor.
              </li>
            </ul>
          </section>

          {/* Footer */}
          <footer className="border-t mt-8 pt-4 text-center text-sm text-gray-600">
            <div className="flex justify-center items-center gap-2 flex-wrap">
              <span>
                <strong>{siteName}</strong>
              </span>
              <span className="text-gray-400">|</span>
              <span>
                Last updated: <strong>{lastUpdated || "—"}</strong>
              </span>
            </div>
          </footer>
        </article>
      </main>
    </>
  );
}

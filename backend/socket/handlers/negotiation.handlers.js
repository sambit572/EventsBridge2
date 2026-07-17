// registerNegotiationHandler.js
import { Negotiation } from "../../model/common/Negotiation.model.js";
import { sendEmail } from "../../utilities/sendEmail.js";
import Booking from "../../model/common/booking.model.js";
import { UserBookingHistory } from "../../model/user/userBookinghistory.model.js";
import {VendorBooking} from "../../model/vendor/vendorBookingHistory.model.js";
export default async function registerNegotiationHandler(
  apiNameSpace,
  io,
  socket,
  vendorSocketMap
) {
  // 🎯 Handle new negotiation request from customer
  socket.on("new-negotiation-request", async (data) => {
    console.log("📩 Negotiation request received:", data);

    try {
   const res = await Negotiation.create({
  ...data,
  vendorDecision: "pending",
});
const booking = await Booking.create({
  vendor: data.vendorId,
  service: data.serviceId,
  user: data.bookedByUserId,
  startDate: new Date(data.date.startDate),
  endDate: new Date(data.date.endDate),
  userDetailsId: data.userDetailsId,
  amount:
    data.proposedPrice > 0
      ? data.proposedPrice
      : data.originalPriceRange.min,
  bookingStatus: "PENDING",
  location: data.venueLocation,
  negotiationId: res._id,
});
console.log("✅ Booking created");

console.log("✅ Negotiation request saved to DB:", res);

// Linking booking_id to userbooking 
const updatedHistory = await UserBookingHistory.findOneAndUpdate(
    {
        userDetailsId: data.userDetailsId,
    },
    {
        booking: booking._id,
    },
    {
        new: true,
    }
);

if (updatedHistory) {
    console.log("✅ Booking linked to UserBookingHistory");
} else {
    console.log("⚠️ No UserBookingHistory found for userDetailsId:", data.userDetailsId);
}
try {
  await sendEmail({
    to: data.vendorEmail,
    subject: `New Negotiation Request for ${data.serviceName}`,
    html: `
      <h2>New Booking & Negotiation Request</h2>

      <p>Hello ${data.vendorName},</p>

      <p>You have received a new booking enquiry.</p>

      <hr>

      <h3>Customer Details</h3>

      <p><strong>Name:</strong> ${data.bookedByUser}</p>
      <hr>

      <h3>Booking Details</h3>

      <p><strong>Service:</strong> ${data.serviceName}</p>
      <p><strong>Venue:</strong> ${data.venueLocation}</p>

      <p><strong>Start Date:</strong>
      ${new Date(data.date.startDate).toLocaleDateString()}</p>

      <p><strong>End Date:</strong>
      ${new Date(data.date.endDate).toLocaleDateString()}</p>

      <hr>

      <h3>Negotiation</h3>

      <p><strong>Original Price:</strong>
      ₹${data.originalPriceRange.min} - ₹${data.originalPriceRange.max}</p>

      <p><strong>Customer Proposed Price:</strong>
      ₹${data.proposedPrice}</p>

      ${
        data.packageName
          ? `
      <hr>
      <h3>Catering Package</h3>

      <p><strong>Package:</strong> ${data.packageName}</p>
      <p><strong>Plate Count:</strong> ${data.plateCount}</p>
      <p><strong>Price Per Plate:</strong> ₹${data.pricePerPlate}</p>
      <p><strong>Total Price:</strong> ₹${data.totalPrice}</p>
      `
          : ""
      }

      <br>

      <p>Please log in to your vendor dashboard to accept or reject this negotiation.</p>

      <br>

      <p>Thank you,</p>
      <p><strong>EventsBridge Team</strong></p>
    `,
  });

  console.log("✅ Negotiation email sent");
} catch (emailError) {
  console.error("❌ Email sending failed:", emailError);
}
     
      // If vendor is online, send directly
      const vendorSocketId = vendorSocketMap.get(data.vendorId);
      if (vendorSocketId) {
        console.log(`📤 Sending negotiation to vendor: ${data.vendorId}`);
        apiNameSpace.to(vendorSocketId).emit("negotiation_to_vendor", res);
      } else {
        console.log(`⚠ Vendor ${data.vendorId} offline, stored for later.`);
      }
    } catch (err) {
      console.error("❌ Error handling negotiation:", err);
    }
  });

  // 🎯 Handle vendor coming online
  socket.on("vendor-online", async (vendorId) => {
    vendorSocketMap.set(vendorId, socket.id);
    console.log(`✅ Vendor ${vendorId} online with socket ID: ${socket.id}`);

    try {
      const pendingRequests = await Negotiation.find({
        vendorId,
        vendorDecision: "pending",
      });

      console.log("✅ Fetched pending requests:", pendingRequests);

      console.log(
        `📦 Sending ${pendingRequests.length} pending requests to vendor: ${vendorId}`
      );

      if (pendingRequests.length > 0) {
        socket.emit("pending-negotiations", pendingRequests);
      }
    } catch (err) {
      console.error("❌ Error fetching pending requests:", err);
    }
  });

  // 🎯 Handle vendor response (accept/decline)
  socket.on(
    "vendor_response",
    async ({ vendorId, bookedByUserId, serviceId, action, finalPrice }) => {
      try {
        // Find the current negotiation using composite identity
        const negotiation = await Negotiation.findOneAndUpdate(
          {
            vendorId,
            bookedByUserId,
            serviceId,
            vendorDecision: "pending", // prevent updating old records
          },
          {
            vendorDecision: action === "accept" ? "accepted" : "rejected",
            ...(finalPrice !== undefined && { finalPrice }),
          },
          { new: true }
        );

        if (!negotiation) {
          console.log("❌ No matching negotiation found for vendor_response");
          return;
        }

        console.log("✅ Vendor response saved:", negotiation);
        
// Update Booking When vendor accepts the booking 
let updatedBooking;
try {
   updatedBooking = await Booking.findOneAndUpdate(
    {
      negotiationId: negotiation._id,
    },
    {
      bookingStatus:
        negotiation.vendorDecision === "accepted"
          ? "CONFIRMED"
          : "CANCELLED",

      amount:
        negotiation.finalPrice ?? negotiation.proposedPrice,
    },
    { new: true }
  );

  if (updatedBooking) {
    console.log(`✅ Booking updated`);

    // Update userbooking too vendor accepts the booking 
    const updatedHistory=await UserBookingHistory.findOneAndUpdate({
      booking:updatedBooking._id,
    },
    {
      bookingStatus:updatedBooking.bookingStatus,
      amount: updatedBooking.amount,
    },
    {
      new:true,
    }
  );
  if (updatedHistory) {
  console.log("✅ UserBookingHistory updated");
   } else {
  console.log("⚠️ UserBookingHistory not found");
}
  } 
  else {
    console.log("⚠️ No Booking found for negotiation:", negotiation._id);
  }
} catch (error) {
  console.error("❌ Failed to update Booking:", error);
}

  //Create Vendro Booking After being accepted by vendor

   if (updatedBooking){
const existingVendorBooking = await VendorBooking.findOne({
  booking: updatedBooking._id,
});

if (!existingVendorBooking && negotiation.vendorDecision === "accepted") {
  await VendorBooking.create({
    vendor: updatedBooking.vendor,
    booking: updatedBooking._id,
    user: updatedBooking.user,
    service: updatedBooking.service,

    location: updatedBooking.location,
    startDate: updatedBooking.startDate,
    endDate: updatedBooking.endDate,

    amount: updatedBooking.amount,
    paymentStatus: updatedBooking.paymentStatus,
    paymentMode: updatedBooking.paymentMode,

    bookingStatus: updatedBooking.bookingStatus,
  });

  console.log("✅ VendorBooking created");
}
     }     // Notify the customer (bookedByUserId) about the vendor decision
        const customerSocketId = socket.handshake?.query?.customerSocketMap?.[negotiation.bookedByUserId?.toString()];
        // Emit to customer's room if they're connected
        apiNameSpace.to(negotiation.bookedByUserId?.toString()).emit("negotiation-status-update", {
          serviceId: negotiation.serviceId,
          vendorId: negotiation.vendorId,
          vendorDecision: negotiation.vendorDecision,
          finalPrice: negotiation.finalPrice,
          proposedPrice: negotiation.proposedPrice,
          status: negotiation.vendorDecision === "accepted" ? "accepted" : "rejected",
          message: negotiation.vendorDecision === "accepted" 
            ? `Vendor has accepted your negotiation with final price ₹${negotiation.finalPrice || negotiation.proposedPrice}`
            : "Vendor has rejected your negotiation."
        });

        // Send next pending negotiation for this vendor
        const nextPending = await Negotiation.findOne({
          vendorId,
          vendorDecision: "pending",
        }).sort({ createdAt: 1 });

        if (nextPending) {
          console.log(
            "📦 Sending next pending negotiation to vendor:",
            vendorId
          );
          socket.emit("pending-negotiations", [nextPending]);
        }
      } catch (err) {
        console.error("❌ Error handling vendor response:", err);
      }
    }
  );

  // 🎯 Clean up mapping when vendor disconnects
  socket.on("disconnect", () => {
    for (let [id, sockId] of vendorSocketMap.entries()) {
      if (sockId === socket.id) {
        vendorSocketMap.delete(id);
        console.log(`🛑 Vendor ${id} disconnected`);
        break;
      }
    }
  });
}

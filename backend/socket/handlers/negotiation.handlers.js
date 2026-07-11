// registerNegotiationHandler.js
import { Negotiation } from "../../model/common/Negotiation.model.js";
import { sendEmail } from "../../utilities/sendEmail.js";

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
      // Save to DB with vendorDecision as pending
      const res = await Negotiation.create({
        ...data,
        vendorDecision: "pending",
      });

      console.log("✅ Negotiation request saved to DB:", res);

      // Send email to vendor
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

        // Update UserBookingHistory status directly via DB (no API call needed - already in backend)
        try {
          const { UserBookingHistory } = await import("../../model/user/userBookinghistory.model.js");
          
          // Find the booking by userId (bookedByUserId)
          const booking = await UserBookingHistory.findOne({ userId: negotiation.bookedByUserId });
          
          if (booking) {
            const newStatus = negotiation.vendorDecision === "accepted" ? "CONFIRMED" : "CANCELLED";
            const finalAmount = negotiation.finalPrice || negotiation.proposedPrice;
            
            await UserBookingHistory.findByIdAndUpdate(booking._id, {
              bookingStatus: newStatus,
              amount: finalAmount,
            });
            
            console.log(`✅ UserBookingHistory updated: status=${newStatus}, amount=${finalAmount}, userDetailsId=${booking.userDetailsId}`);
          } else {
            console.log("⚠️ No UserBookingHistory found for userId:", negotiation.bookedByUserId);
          }
        } catch (updateError) {
          console.error("⚠️ Failed to update booking history:", updateError.message);
        }

        // Notify the customer (bookedByUserId) about the vendor decision
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

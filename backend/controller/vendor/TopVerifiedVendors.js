import { Service } from "../../model/vendor/service.model.js";
// import clsx from 'clsx';tum 
export const getVerifiedVendors = async (req, res) => {
  try {
    const services = await Service.find({ available: true }).populate({
      path: "vendorId",
      match: {
        active: true,
      },
      select: "fullName verification",
    });

    const topVerifiedVendors = services
      .filter((service) => {
        const vendor = service.vendorId;
        if (!vendor) return false;
        const request = vendor.verification?.requests?.find(
          (item) => item.serviceId?.toString() === service._id.toString()
        );
        return (
          request?.status === "verified" &&
          request?.plan?.tier?.toLowerCase() === "premium"
        );
      })
      .map((service) => {
        const request = service.vendorId.verification?.requests?.find(
          (item) => item.serviceId?.toString() === service._id.toString()
        );
        return {
        id: service._id,
        serviceName: service.serviceName,
        category: service.serviceCategory,
        images: service.serviceImage,
        vendorName: service.vendorId.fullName,
        tier: request?.plan?.tier || "basic",
        };
      });

    res.status(200).json({
      success: true,
      vendors: topVerifiedVendors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

import { Service } from "../../model/vendor/service.model.js";

export const getVerifiedVendors = async (req, res) => {
  try {
    const services = await Service.find().populate({
      path: "vendorId",
      match: {
        "verification.status": "verified",
        "verification.plan.tier":"premium",
      },
      select: "fullName verification",
    });

    const topVerifiedVendors = services
      .filter((service) => service.vendorId)
      .map((service) => ({
        id: service._id,
        serviceName: service.serviceName,
        category: service.serviceCategory,
        images: service.serviceImage,
        vendorName: service.vendorId.fullName,
        tier:service.vendorId.verification.plan.tier,
      }));

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
import Poster from "../../model/common/poster.model.js";

// Get all active posters
export const getActivePosters = async (req, res) => {
  try {
    const now = new Date();

    const posters = await Poster.find({
      isActive: true,
      offerStartDate: { $lte: now },
      offerEndDate: { $gte: now },
    })
      .populate("uploadedBy", "fullName email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: posters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching posters",
      error: error.message,
    });
  }
};

// Get all posters (for admin)
export const getAllPosters = async (req, res) => {
  try {
    const { page = 1, limit = 20, active = "all" } = req.query;

    const query = {};
    if (active !== "all") {
      query.isActive = active === "true";
    }

    const posters = await Poster.find(query)
      .populate("uploadedBy", "fullName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Poster.countDocuments(query);

    res.json({
      success: true,
      data: posters,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching posters",
      error: error.message,
    });
  }
};
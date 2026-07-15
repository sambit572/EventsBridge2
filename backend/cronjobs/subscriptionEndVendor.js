import cron from "node-cron";
import Vendor from "../model/vendor/vendor.model.js";

async function expireSubscriptions() {
   console.log("Cron started at:", new Date());

  try {
    const today = new Date();
    console.log("Today's date:", today);

    const result = await Vendor.updateMany(
      {
        "verification.status": "verified",
        subscriptionEndsAt: { $lte: today },
      },
      {
        $set: {
          "verification.status": "not_verified",
        },
      }
    );

    console.log(
      `${result.modifiedCount} vendor subscription(s) expired.`
    );
  } catch (err) {
    console.error("Subscription Cron Error:", err);
  }
}


expireSubscriptions();

// Run every day at midnight
cron.schedule("0 0 * * *", expireSubscriptions);
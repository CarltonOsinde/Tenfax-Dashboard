import mongoose from "mongoose";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const [userWithStats] = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "affiliatestats",
          localField: "_id",
          foreignField: "userId",
          as: "affiliateStats",
        },
      },
      { $unwind: "$affiliateStats" },
      { $project: { password: 0 } },
    ]);

    if (!userWithStats) {
      return res.status(404).json({ message: "No performance data for this user" });
    }

    const sales = await Transaction.find({
      _id: { $in: userWithStats.affiliateStats.affiliateSales },
    });

    res.status(200).json({ user: userWithStats, sales });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

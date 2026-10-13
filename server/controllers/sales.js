import OverallStat from "../models/OverallStat.js";

export const getSales = async (req, res) => {
  try {
    const overallStat = await OverallStat.findOne();
    if (!overallStat) return res.status(404).json({ message: "No sales data found" });
    res.status(200).json(overallStat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import User from "../models/User.js";
import OverallStat from "../models/OverallStat.js";
import Transaction from "../models/Transaction.js";

// The seed data covers 2021, so the dashboard reports as of this fixed date.
const REPORT_YEAR = 2021;
const REPORT_MONTH = "November";
const REPORT_DAY = "2021-11-15";

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const [transactions, overallStat] = await Promise.all([
      Transaction.find().limit(50).sort({ createdOn: -1 }),
      OverallStat.findOne({ year: REPORT_YEAR }),
    ]);

    if (!overallStat) {
      return res.status(404).json({ message: `No stats found for ${REPORT_YEAR}` });
    }

    const {
      totalCustomers,
      yearlyTotalSoldUnits,
      yearlySalesTotal,
      monthlyData,
      dailyData,
      salesByCategory,
    } = overallStat;

    res.status(200).json({
      totalCustomers,
      yearlyTotalSoldUnits,
      yearlySalesTotal,
      monthlyData,
      salesByCategory,
      thisMonthStats: monthlyData.find(({ month }) => month === REPORT_MONTH),
      todayStats: dailyData.find(({ date }) => date === REPORT_DAY),
      transactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

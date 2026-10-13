import Product from "../models/Product.js";
import ProductStat from "../models/ProductStat.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import getCountryIso3 from "country-iso-2-to-3";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const productsWithStats = await Promise.all(
      products.map(async (product) => {
        const stat = await ProductStat.find({ productId: product._id });
        return { ...product._doc, stat };
      })
    );

    res.status(200).json(productsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "user" }).select("-password");
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Server-side paginated, sortable, searchable transactions.
 * Query params:
 *   page      zero-based page index (MUI DataGrid convention)
 *   pageSize  rows per page
 *   sort      JSON string, e.g. {"field":"userId","sort":"desc"}
 *   search    case-insensitive match on cost or userId
 */
export const getTransactions = async (req, res) => {
  try {
    const page = Math.max(0, parseInt(req.query.page, 10) || 0);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 20));
    const search = escapeRegex(String(req.query.search || ""));

    let sortFormatted = {};
    if (req.query.sort) {
      const { field, sort } = JSON.parse(req.query.sort);
      if (field) sortFormatted = { [field]: sort === "asc" ? 1 : -1 };
    }

    const filter = {
      $or: [
        { cost: { $regex: search, $options: "i" } },
        { userId: { $regex: search, $options: "i" } },
      ],
    };

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort(sortFormatted)
        .skip(page * pageSize)
        .limit(pageSize),
      Transaction.countDocuments(filter),
    ]);

    res.status(200).json({ transactions, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGeography = async (req, res) => {
  try {
    const users = await User.find().select("country");

    const countsByCountry = users.reduce((acc, { country }) => {
      const iso3 = getCountryIso3(country);
      acc[iso3] = (acc[iso3] || 0) + 1;
      return acc;
    }, {});

    const formattedLocations = Object.entries(countsByCountry).map(
      ([country, count]) => ({ id: country, value: count })
    );

    res.status(200).json(formattedLocations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Loads the mock dataset in ./data into MongoDB.
 * Usage: npm run seed            (inserts into an empty database)
 *        npm run seed -- --reset (clears the collections first)
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import Product from "./models/Product.js";
import ProductStat from "./models/ProductStat.js";
import Transaction from "./models/Transaction.js";
import OverallStat from "./models/OverallStat.js";
import AffiliateStat from "./models/AffiliateStat.js";
import {
  dataUser,
  dataProduct,
  dataProductStat,
  dataTransaction,
  dataOverallStat,
  dataAffiliateStat,
} from "./data/index.js";

dotenv.config();

const collections = [
  [User, dataUser],
  [Product, dataProduct],
  [ProductStat, dataProductStat],
  [Transaction, dataTransaction],
  [OverallStat, dataOverallStat],
  [AffiliateStat, dataAffiliateStat],
];

const reset = process.argv.includes("--reset");

try {
  await mongoose.connect(process.env.MONGO_URL);

  for (const [Model, data] of collections) {
    if (reset) await Model.deleteMany({});
    const existing = await Model.estimatedDocumentCount();
    if (existing > 0) {
      console.log(`${Model.modelName}: ${existing} documents already present, skipped`);
      continue;
    }
    await Model.insertMany(data);
    console.log(`${Model.modelName}: inserted ${data.length}`);
  }
} catch (error) {
  console.error(`Seeding failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}

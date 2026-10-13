import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import clientRoutes from "./routes/client.js";
import generalRoutes from "./routes/general.js";
import managementRoutes from "./routes/management.js";
import salesRoutes from "./routes/sales.js";

dotenv.config();

const PORT = process.env.PORT || 9000;
const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  console.error("MONGO_URL is not set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

/* APP */
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(cors());

/* ROUTES */
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
app.use("/client", clientRoutes);
app.use("/general", generalRoutes);
app.use("/management", managementRoutes);
app.use("/sales", salesRoutes);

/* DATABASE + SERVER */
mongoose
  .connect(MONGO_URL)
  .then(() => {
    app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
  })
  .catch((error) => {
    console.error(`Could not connect to MongoDB: ${error.message}`);
    process.exit(1);
  });

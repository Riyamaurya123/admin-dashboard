import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import errorHandler from "./middleware/errorHandler.js";
import productRoute from "./routes/productRoutes.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://admin-dashboard-eta-one-99.vercel.app",
    ], // frontend ka exact origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/products", productRoute);

app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("mongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

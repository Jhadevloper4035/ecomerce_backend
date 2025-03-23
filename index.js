require("dotenv").config();
const express = require("express");
const { connectDb } = require("./config/db.config.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.js");
const productRoutes = require("./routes/product.js");

//connecting database
connectDb();

// defing app
const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

//routes
app.use("/auth", authRoutes);
app.use("/product", productRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

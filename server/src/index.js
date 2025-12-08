const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables before other imports that depend on them
dotenv.config();
const { connectDB } = require("./config/db-config");
const authRoutes = require("./routes/auth-routes");
const favoriteRoutes = require("./routes/favorite-routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoriteRoutes);

app.get("/", (req, res) => {
  res.send("Hello! Server is running.");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

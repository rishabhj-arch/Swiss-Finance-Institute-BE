require("dotenv").config();
const express = require("express");
const cors = require("cors");

const applicationRoutes = require("./routes/application");

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", applicationRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

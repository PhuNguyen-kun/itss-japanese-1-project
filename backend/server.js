require("dotenv").config();
const app = require("./src/app");
const { testConnection } = require("./src/config/database");

const PORT = process.env.PORT || 3000;

const validateEnv = () => {
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET ===
      "your-super-secret-jwt-key-change-this-in-production"
  ) {
    console.error("❌ ERROR: JWT_SECRET is not set or using default value!");
    console.error("Please set a strong JWT_SECRET in your .env file");
    console.error(
      "Example: JWT_SECRET=my-super-secret-key-" +
        Math.random().toString(36).substring(2)
    );
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    validateEnv();
    await testConnection();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

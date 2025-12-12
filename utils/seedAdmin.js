const mongoose = require("mongoose");
const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
require("dotenv").config();


const mongouri = process.env.MONGODB_URI
async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to DB...");

    const existing = await Admin.findOne({ email: "admin@surgeryportal.com" });

    if (existing) {
      console.log("Admin already exists.");
      return process.exit();
    }

    const hashedPassword = await bcrypt.hash("Admin@1234", 10);

    await Admin.create({
      email: "admin@surgeryportal.com",
      password: hashedPassword,
    });

    console.log("Admin seeded successfully!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit();
  }
}

seedAdmin();

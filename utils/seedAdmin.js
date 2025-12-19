const mongoose = require("mongoose");
const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
require('dotenv').config()


async function seedAdmin() {
  // const email = "superadmin@surgeryportal.com";
  // const password = "SuperAdmin@1234";
  const email = "admin@surgeryportal.com";
  const password = "Admin@1234";

  const mongouri = process.env.MONGODB_URI

  try {
    await mongoose.connect(process.env.MONGODB_URI)

    console.log("Connected to DB...");

    const existing = await Admin.findOne({ email });

    if (existing) {
      console.log(`Admin with email ${email} already exists.`);
      await mongoose.disconnect();
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.create({
      email,
      password: hashedPassword,
      // role: 'super-admin'
      role: 'admin'
    });

    console.log(`Admin ${email} seeded successfully!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAdmin();

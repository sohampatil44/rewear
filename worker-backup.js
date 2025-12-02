// worker.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import User from "./models/User.js";

const runWorker = async () => {
  await connectDB();
  console.log("Worker running...");

  // Example job: iterate users and print emails
  const users = await User.find({});
  for (const user of users) {
    console.log(`Would send mail to: ${user.email}`);
    // TODO: integrate nodemailer / SES / etc.
  }

  process.exit(0);
};

runWorker();

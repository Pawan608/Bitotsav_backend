const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");
const mongoose = require("mongoose");
process.on("uncaughtException", (err) => {
  console.log(`Error:  ${err.message}`);
  console.log(`Shutting down the server  due to  uncaught Exception `);
  process.exit(1);
});
const User = require("./model/userModel");
const { json } = require("express");
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Server is Working on  http://localhost:${port}`);
});
const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

console.log(DB);
mongoose.set("strictQuery", true);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful!"));

process.on("unhandledRejection", (err) => {
  console.log(`Error:  ${err.message}`);
  console.log(`Shutting down the server  due to unhandled  promise rejection `);
  server.close(() => {
    process.exit(1);
  });
});
// const addMember = async (req, res, next) => {
//   [21, 22, 23, 24, 25, 26, 27, 28, 29, 30].forEach(async (i) => {
//     const user1 = await User.create({
//       name: `user${i}`,
//       email: `user${i}@gmail.com`,
//       verified: true,
//       password: 123456789,
//       confirmpassword: 123456789,
//       transaction: true,
//       entry: {
//         day1: false,
//         day2: false,
//         day3: false,
//       },
//       college: "sdf",
//       transaction_status: "done",
//     });
//     console.log(user1);
//   });
// };
// addMember();

const createSecurity = async () => {
  const security1 = await User.create({
    name: "Security",
    role: "security",
    email: "security@gmail.com",
    password: "Mayukh123",
    confirmpassword: "Mayukh123",
    college: "Bit mesra",
    verified: true,
  });
  console.log(security1);
};
createSecurity();

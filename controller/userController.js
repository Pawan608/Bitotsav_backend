const User = require("../model/userModel");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("./../utils/email");

///////////////////Token Creation///////////////////////////
const signToken = (id, purpose, res) => {
  if (purpose == "otp")
    return jwt.sign({ id }, process.env.JWT_SECRET_OTP, {
      expiresIn: process.env.JWT_EXPIRES_IN_OTP,
    });
  if (purpose == "login") {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return token;
  }
};

exports.DoesUserExist = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select(
    "+verified"
  );
  if (user) {
    if (!user.verified) await User.deleteOne({ email: req.body.email });
    if (user.verified)
      return next(new AppError("User already exists, Kindly login", 400));
  }
  next();
});

exports.signupcreate = catchAsync(async (req, res, next) => {
  ////////////////Generating 4 digit otp/////////////////////////////
  //////////////////////////////////////////////////////////////////
  const otp =
    (Math.floor(Math.random() * (9 - 1 + 1)) + 1) * 1 +
    (Math.floor(Math.random() * (9 - 1 + 1)) + 1) * 10 +
    (Math.floor(Math.random() * (9 - 1 + 1)) + 1) * 100 +
    (Math.floor(Math.random() * (9 - 1 + 1)) + 1) * 1000;
  req.body.otp = otp;
  /////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////

  //////////Sending OTP through mail//////////////////////////
  const mail = await new Email(req).sendOTP();

  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmpassword: req.body.confirmpassword,
    college: req.body.college,
    otp,
    otp_created_at: Date.now(),
  });
  const token = signToken(user._id, "otp");
  res.status(200).json({
    status: "success",
    message: "Please, verify your mailId",
    token,
  });
});

exports.getLoginToken = catchAsync(async (req, res, next) => {
  const token = signToken(req._user._id, "login");
  return res.status(200).json({
    status: "success",
    message: "Login successfull",
    token,
    user: req._user,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const token = signToken(req._user._id, "login", res);
  console.log(req._user._id, req._user);
  return res.status(200).json({
    status: "success",
    message: "Login successfull",
    token,
    user: req._user,
  });
});

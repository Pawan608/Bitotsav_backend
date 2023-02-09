const User = require("../model/userModel");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Emails = require("./../utils/email");
const EmailId = require("./../model/emailModel");
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

  const email1 = await EmailId.findOneAndUpdate(
    { limit: { $gt: 0 } },
    { $inc: { limit: -1 } }
  );
  //   console.log(email1);
  if (email1 == null) {
    return next(new AppError("Registration closed for the day", 400));
  }
  const mail = await new Emails(req, email1.email, email1.password).sendOTP();
  const userIndex = req.body?.email.lastIndexOf("@");
  const username = req.body?.email?.slice(0, userIndex);
  let roll_num;
  if (req.body?.email?.endsWith("bitmesra.ac.in")) {
    const re = /[a-z]+/i;
    const title = re.exec(username);
    const length = title[0]?.length;
    let finalTitle = "";
    let digit;
    if (length) {
      digit = username.slice(length).split(".");
      if (title[0].toUpperCase() == "BTECH") {
        finalTitle = "B.TECH";
      }
      if (title[0].toUpperCase() != "BTECH") {
        finalTitle = title[0].toUpperCase();
      }
    }
    roll_num = `${finalTitle}/${digit[0]}/${digit[1]}`;
    req.body.transaction_status = "locked";
    // console.log("roll num", roll_num);
  }
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmpassword: req.body.confirmpassword,
    college: req.body.college,
    otp,
    otp_created_at: Date.now(),
    bitotsavId: `BIT_${username}#2023`,
    rollNum: roll_num,
    transaction_status: req.body.transaction_status,
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
  return res.status(200).json({
    status: "success",
    message: "Login successfull",
    token,
    user: req._user,
  });
});

exports.getUserDetail = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate({
      path: "teamId",
      populate: { path: "members", select: "email name college bitotsavId" },
    })
    .select("-entry -transaction");
  res.status(200).json({
    status: "success",
    message: "Data Successfully fetched",
    user,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  console.log("emqail hai", req.body);
  const email = req.body.email;
  const user = await User.findOne({ email }).select("+verified");
  console.log(user);
  if (!user || !user.verified) {
    return next(new AppError("No such user exists", 400));
  }
  const otp =
    (Math.floor(Math.random() * (9 - 1 + 1)) + 1) * 1 +
    (Math.floor(Math.random() * (9 - 1 + 1)) + 1) * 10 +
    (Math.floor(Math.random() * (9 - 1 + 1)) + 1) * 100 +
    (Math.floor(Math.random() * (9 - 1 + 1)) + 1) * 1000;
  req.body.otp = otp;
  user.otp = otp;
  await user.save({ validateBeforeSave: false });
  const email1 = await EmailId.findOneAndUpdate(
    { limit: { $gt: 0 } },
    { $inc: { limit: -1 } }
  );
  //   console.log(email1);
  if (email1 == null) {
    return next(new AppError("Registration closed for the day", 400));
  }
  const mail = await new Emails(req, email1.email, email1.password).sendOTP();
  const token = signToken(user._id, "otp");
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.PasswordresetOTPVerify = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_OTP
  );
  const currentUser = await User.findById(decoded.id);
  if (req.body.otp == currentUser.otp) {
    currentUser.password = req.body.password;
    currentUser.confirmpassword = req.body.confirmpassword;
    await currentUser.save();
    res.status(200).json({
      status: "success",
      message: "Password successfully Changed, kindly login",
    });
  } else return next(new AppError("otp didn not match", 400));
});

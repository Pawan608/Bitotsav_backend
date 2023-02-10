const QRcode = require("qrcode");
const AppError = require("./appError");
const catchAsync = require("./catchAsync");
const cloudinary = require("./../utils/cloudinary");
const User = require("./../model/userModel");
exports.generateQR = catchAsync(async (req, res, next) => {
  if (req._user.QRcode) return next();
  if (!req._user.transaction)
    return next(
      new AppError(
        "Please complete your transaction in order to generate QRCode",
        400
      )
    );
  await QRcode.toFile(
    `public/qrcode/${req._user._id}`,
    `https://www.bitotsav.in//entry/${req._user._id}`
  );
  const result = await cloudinary.uploader.upload(
    `public/qrcode/${req._user._id}`
  );
  req._user.QRcode = result.secure_url;
  await req._user.save({ validateBeforeSave: false });
  return next();
});

exports.getQR = catchAsync(async (req, res, next) => {
  return res.status(200).json({
    status: "success",
    url: req._user.QRcode,
  });
});

exports.checkAdmin = catchAsync(async (req, res, next) => {
  console.log("users", req._user);
  if (req._user.role == "user")
    return next(new AppError("You are not allowed to access this route", 400));
  else next();
});

exports.verifyEntry = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  const date = new Date(Date.now());
  const day1 = new Date(2023, 1, 10);
  const day2 = new Date(2023, 1, 11);
  const day3 = new Date(2023, 1, 12);
  if (date.getMonth() == day1.getMonth() && date.getDate() == day1.getDate())
    if (user.entry.day1) {
      user.entry.day1 = false;
      user.save({ validateBeforeSave: false });
      return res.status(200).json({
        message: "User may enter",
        status: "success",
      });
    } else {
      return res.status(200).json({
        message: "User cannot enter",
        status: "error",
      });
    }
  if (date.getMonth() == day2.getMonth() && date.getDate() == day2.getDate())
    if (user.entry.day2) {
      user.entry.day2 = false;
      user.save({ validateBeforeSave: false });
      return res.status(200).json({
        message: "User may enter",
        status: "success",
      });
    } else {
      return res.status(200).json({
        message: "User cannot enter",
        status: "error",
      });
    }
  if (date.getMonth() == day3.getMonth() && date.getDate() == day3.getDate())
    if (user.entry.day3) {
      user.entry.day3 = false;
      user.save({ validateBeforeSave: false });
      return res.status(200).json({
        message: "User may enter",
        status: "success",
      });
    } else {
      return res.status(200).json({
        message: "User cannot enter",
        status: "error",
      });
    }
  return res.status(400).json({
    message: "No such record found",
    status: "error",
  });
});

const QRcode = require("qrcode");
const User = require("../model/userModel");
const AppError = require("./appError");
const catchAsync = require("./catchAsync");
const cloudinary = require("./../utils/cloudinary");
const User = require("./../model/userModel");
exports.generateQR = catchAsync(async (req, res, next) => {
  if (!req._user.transaction)
    return next(
      new AppError(
        "Please complete your transaction in order to generate QRCode",
        400
      )
    );
  if (req._user.QRcode) next();
  await QRcode.toFile(
    `public/qrcode/${req._user._id}`,
    `http://localhost:3000/entry/${req._user._id}`
  );
  const result = await cloudinary.uploader.upload(
    `public/qrcode/${req._user._id}`
  );
  req._user.QRcode = result.secure_url;
  await req._user.save({ validateBeforeSave: false });
  return next();
});

exports.getQR = catchAsync(async (req, res, next) => {
  res.status(200).json({
    url: req._user.QRcode,
  });
});

exports.verifyEntry = catchAsync(async (req, res, next) => {
  const user = User.findById(req.params.id);
  const date = new Date(Date.now());
  const day1 = new Date(2023, 2, 9);
  const day2 = new Date(2023, 2, 10);
  const day3 = new Date(2023, 2, 11);
  if (date.getMonth() == day1.getMonth() && date.getDate() == day1.getDate())
    if (user.day1) {
      user.entry.day1 = false;
      user.save({ validateBeforeSave: false });
      return res.status(200).json({
        message: "User may enter",
        status: "success",
      });
    } else {
      return res.status(200).json({
        message: "User cannot enter",
        status: "success",
      });
    }
  if (date.getMonth() == day2.getMonth() && date.getDate() == day2.getDate())
    if (user.day2) {
      user.entry.day2 = false;
      user.save({ validateBeforeSave: false });
      return res.status(200).json({
        message: "User may enter",
        status: "success",
      });
    } else {
      return res.status(200).json({
        message: "User cannot enter",
        status: "success",
      });
    }
  if (date.getMonth() == day3.getMonth() && date.getDate() == day3.getDate())
    if (user.day3) {
      user.entry.day3 = false;
      user.save({ validateBeforeSave: false });
      return res.status(200).json({
        message: "User may enter",
        status: "success",
      });
    } else {
      return res.status(200).json({
        message: "User cannot enter",
        status: "success",
      });
    }
});

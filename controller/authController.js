const User = require("../model/userModel");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

/////////////////////validating OTP///////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
exports.signupVerify = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  // console.log(token);
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_OTP
  );
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(new AppError("User not found, Kindly register"), 400);

  if (currentUser.verified) {
    return next(new AppError("user already exists, Kindly login"), 400);
  }
  if (req.body.otp == currentUser.otp) {
    // console.log(req.body.otp);
    currentUser.verified = true;
    currentUser.otp = undefined;
    currentUser.save({ validateBeforeSave: false });
    req._user = currentUser;
    return next();
  } else return next(new AppError("Invalid OTP", 400));
  return next(new AppError("Token not available"), 400);
});

/////A middleware that runs before login, to check users existence and to compare the password
exports.protect = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })
    .select("+password")
    .select("+verified");
  if (!user) {
    return next(new AppError("Either MailID or Password Wrong ", 400));
  }
  let compare;
  if (user) {
    compare = await user.correctPassword(req.body.password, user.password);
    user.password = undefined;
    if (!user || !compare)
      return next(new AppError("Either MailID or Password Wrong ", 401));
  }
  if (compare) {
    if (user.verified) {
      req._user = user;
      next();
    } else return next(new AppError("Either MailID or Password Wrong", 401));
  }
});

////A middleware function that runs each time the loggen in user request for something
exports.checkJWT = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    return next(new AppError("Kindly Login", 400));
  }
  // console.log("tooken", token);
  if (token == "undefined") {
    return next(new AppError("Kindly Login", 400));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded.id);
  const currentUser = await User.findById(decoded.id).select("+verified");
  //console.log(currentUser);
  if (!currentUser) return next(new AppError("Kindly Login ", 401));

  ///To check if the JWT is issued, after the password is changed.
  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(new AppError("Token Expired, Login again", 400));
  req._user = currentUser;
  next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      // console.log("Decoded", req.cookies.jwt);
      const token = req.cookies.jwt;
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );

      const currentUser = await User.findById(decoded.id).select("+verified");
      //  console.log("hey", currentUser);
      if (!currentUser) return next();

      if (currentUser.changedPasswordAfter(decoded.iat)) return next();
      req._user = currentUser;
    }
  } catch (err) {
    return next();
  }
  next();
});

const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const multerImageStorage = multer.memoryStorage();
const Event = require("./../model/eventModel");
const Category = require("./../model/categoryModel");
const cloudinary = require("./../utils/cloudinary");
const mongoose = require("mongoose");
///////////////Check Admin///////////////////////
/////////////////////////////////////////////////
exports.checkAdmin = catchAsync(async (req, res, next) => {
  if (req._user.role == "admin") return next();
  else
    return next(
      new AppError("You don't have permission to access this route", 400)
    );
});
//////////////////////////////////////////////////

const multerImageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const uploadImage = multer({
  storage: multerImageStorage,
  fileFilter: multerImageFilter,
});

exports.uploadcoverImage = uploadImage.fields([{ name: "image", maxCount: 1 }]);

exports.resizeImage = catchAsync(async (req, res, next) => {
  //   if (!req.files)
  //     return next(new AppError("You must provide at least one image", 400));
  console.log("File pdf", req.files);
  await Promise.all(
    req.files.image.map(async (file, i) => {
      const filename = `event-${req._id}-${Date.now()}-${i + 1}.jpeg`;
      const file1 = await sharp(file.buffer)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/EventImage/${filename}`);
      const result = await cloudinary.uploader.upload(
        `public/EventImage/${filename}`
      );
      req.body.coverImage = result.secure_url;
    })
  );
  next();
});
exports.creatEvent = catchAsync(async (req, res, next) => {
  console.log("category Name", req.body.category);
  const category = await Category.findOne({ name: req.body.category });
  console.log(category);
  if (!category) {
    return next(
      new AppError("Category not found, Please try with different name", 400)
    );
  }
  const event = await Event.create({
    name: req.body.name,
    image: req.body.coverImage,
    description: req.body.description,
    dates: {
      day1: req.body.date1,
      day2: req.body.date2,
      day3: req.body.date3,
    },
    category: req.body.category,
  });
  category.events.push(event._id);
  category.save({ validateBeforeSave: false });
  res.status(201).json({
    message: "Event successfully uploaded",
    status: "success",
    data: event,
  });
});

exports.getEvent = catchAsync(async (req, res, next) => {
  const id = req.params?.id;
  const event = id ? await Event.find({ _id: id }) : await Event.find();
  res.status(200).json({
    status: "success",
    message: "Events successfully fetched",
    data: event,
  });
});

///////////////Delete Category///////////////////
exports.deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  console.log(event._id);
  await Category.updateOne(
    { name: event.category },
    { $pull: { events: { $eq: event._id } } }
  );
  res.status(200).json({
    status: "success",
    message: "Category successfully deleted",
    event,
  });
});
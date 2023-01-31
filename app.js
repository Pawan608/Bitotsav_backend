const express = require("express");
const hbs = require("hbs");
const path = require("path");
const cookieParser = require("cookie-parser");
const globalErrorHandler = require("./controller/errorController");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const helmet = require("helmet");
const AppError = require("./utils/appError");
const userRouter = require("./route/userRoute");
const categoriesRouter = require("./route/categoryRoute.js");
const eventRouter = require("./route/eventRoute");
const teamRouter = require("./route/teamRoute");
const leaderBoardRouter = require("./route/leaderBoardRoute");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(express.json());
app.use(express.static("public"));

app.use(cookieParser());
// route imports
app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/event", eventRouter);
app.use("/api/v1/team", teamRouter);
app.use("/api/v1/leaderBoard", leaderBoardRouter);
////To handle unhandled route
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

////Global middleware to handle all sorts of errors
app.use(globalErrorHandler);
module.exports = app;
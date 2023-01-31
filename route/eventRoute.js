const express = require("express");
const router = express.Router();
const authController = require("./../controller/authController");
const eventController = require("./../controller/eventController");
router
  .route("/")
  .post(
    authController.checkJWT,
    eventController.checkAdmin,
    eventController.checkAdmin,
    eventController.uploadcoverImage,
    eventController.resizeImage,
    eventController.creatEvent
  )
  .get(eventController.getEvent);
router
  .route("/:id")
  .get(eventController.getEvent)
  .delete(
    authController.checkJWT,
    eventController.checkAdmin,
    eventController.deleteEvent
  );
module.exports = router;

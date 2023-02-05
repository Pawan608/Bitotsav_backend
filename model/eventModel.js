const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "An event should have a name"],
  },
  description: {
    type: String,
    minlength: [5, "Description should not be below hundered words"],
    required: [true, "Description is required"],
  },
  image: {
    type: String,
    required: [true, "An event should have an image"],
  },
  participants: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Team",
    },
  ],
  place: {
    type: String,
    required: [true, "You must mention the Place"],
  },
  dates: {
    day1: Date,
    day2: Date,
    day3: Date,
  },
  category: {
    type: String,
    required: [true, "An event should belong to a category"],
    enum: {
      values: ["Flagship", "Formal", "Informal"],
      message: "category should either be Flagship, Formal or Informal",
    },
  },
  maxScore: {
    type: Number,
    validate: {
      validator: function (el) {
        if (this.category === "Flagship") return el === 0;
        if (this.category === "Formal") return el === 75;
        if (this.category === "Informal") return el === 40;
      },
      message: "Incorrect Max score",
    },
  },
  middleScore: {
    type: Number,
    validate: {
      validator: function (el) {
        if (this.category === "Flagship") return el === 0;
        if (this.category === "Formal") return el === 55;
        if (this.category === "Informal") return el === 25;
      },
      message: "Incorrect Max score",
    },
  },
  minScore: {
    type: Number,
    validate: {
      validator: function (el) {
        if (this.category === "Flagship") return el === 0;
        if (this.category === "Formal") return el === 35;
        if (this.category === "Informal") return el === 55;
      },
      message: "Incorrect Max score",
    },
  },
  leaderBoard: {
    type: mongoose.Schema.ObjectId,
    ref: "LeaderBoard",
  },
});
const Event = mongoose.model("Event", eventSchema);
module.exports = Event;

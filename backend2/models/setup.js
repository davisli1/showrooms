const mongoose = require("mongoose");
const validator = require("validator");

const setupSchema = new mongoose.Schema(
  {
    products: {
      type: [String],
    },
    img: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    upvotes: {
      type: Number,
    },
    title: {
      type: String
    },
    tags: {
      type: [String]
    },
    description: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

const setup = mongoose.model("setup", setupSchema);
module.exports = setup;

const Joi = require("joi-browser");
const mongoose = require("mongoose");

const flipbookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 255,
  },
  description: {
    type: String,
    required: true,
  },
  flipbookImgs: {
    type: Array,
    required: true,
  },
});

const Flipbook = mongoose.model("Flipbook", flipbookSchema);

function validateFlipbook(flipbook) {
  const schema = {
    title: Joi.string().min(5).max(50).required(),
    description: Joi.string().min(5).max(1024).required(),
  };

  return Joi.validate(flipbook, schema);
}

exports.Flipbook = Flipbook;
exports.validate = validateFlipbook;

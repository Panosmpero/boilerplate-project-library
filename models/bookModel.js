const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  comments: {
    type: [String]
  }
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  bookname: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  author: { type: String, required: true },
});

const Books = mongoose.model("Books", bookSchema);
module.exports = Books;

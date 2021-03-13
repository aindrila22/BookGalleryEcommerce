const Books = require("../../models/books");

function homeController() {
  return {
    async index(req, res) {
      const books = await Books.find();
      return res.render("home", { books: books });
    },
  };
}

module.exports = homeController;

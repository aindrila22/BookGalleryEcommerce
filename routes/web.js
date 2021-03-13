const homeController = require("../app/http/controllers/homeControllers");
const authController = require("../app/http/controllers/authController");
const cartController = require("../app/http/controllers/customers/cartController");
const guest = require("../app/http/middlewares/guest");

function initRoutes(app) {
  app.get("/", homeController().index);

  app.get("/register", guest, authController().register);
  app.post("/register", authController().postregister);

  app.get("/login", guest, authController().login);
  app.post("/login", authController().postlogin);

  app.post("/logout", authController().logout);

  app.get("/cart", cartController().index);

  app.post("/update-cart", cartController().update);
}

module.exports = initRoutes;

const Users = require("../../models/user");
const bcrypt = require("bcrypt");
const passport = require("passport");

function authController() {
  return {
    login(req, res) {
      res.render("auth/login");
    },

    postlogin(req, res, next) {
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          req.flash("error", info.message);
          return next(err);
        }
        if (!user) {
          req.flash("error", info.message);
          return res.redirect("/login");
        }
        req.logIn(user, (error) => {
          if (error) {
            req.flash("error", info.message);
            return next(error);
          }
          return res.redirect("/");
        });
      })(req, res, next);
    },

    register(req, res) {
      res.render("auth/register");
    },

    async postregister(req, res) {
      const { fullname, email, password } = req.body;

      //Validate request

      if (!fullname || !email || !password) {
        req.flash("error", "All fields are required");
        req.flash("fullname", fullname);
        req.flash("email", email);
        return res.redirect("/register");
      }

      //Check if email exists
      Users.exists({ email: email }, (err, result) => {
        if (result) {
          req.flash("error", "Email Already Taken");
          req.flash("fullname", fullname);
          req.flash("email", email);
          return res.redirect("/register");
        }
      });

      //Hash Password
      const hashPassword = await bcrypt.hash(password, 10);

      //Create user
      const user = new Users({
        fullname,
        email,
        password: hashPassword,
      });
      user
        .save()
        .then(() => {
          return res.redirect("/");
        })
        .catch((err) => {
          req.flash("error", "Something went wrong");
          return res.redirect("/register");
        });
    },
    logout(req, res) {
      req.logout();
      return res.redirect("/login");
    },
  };
}

module.exports = authController;

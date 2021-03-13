const express = require("express");
const app = express();
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("express-flash");
const mongoStore = require("connect-mongo");

require("dotenv").config();

const PORT = process.env.PORT || 3000;

//database

const uri = "mongodb://localhost/BookKorner";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: true,
});

const connection = mongoose.connection;
connection.once("open", () => console.log("MongoDB connection established!!!"));

//session config

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore.create({
      mongoUrl: uri,
      collection: "sessions",
    }),
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 10 }, //10 minutes
  })
);

app.use(flash());

//assets
app.use(express.static("public"));
app.use(express.json());

//Global Middleware

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

//set Template engine

app.use(expressLayout);

app.set("views", path.join(__dirname, "/resources/views"));

app.set("view engine", "ejs");

//routes

require("./routes/web")(app);

app.listen(PORT, () => {
  console.log(`app running on port ${PORT}`);
});

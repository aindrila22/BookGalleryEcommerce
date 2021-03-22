const express = require("express");
const app = express();
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("express-flash");
const mongoStore = require("connect-mongo");
const passport = require("passport");
const Emitter = require("events");

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

//event emitter
const eventEmitter = new Emitter();
app.set("eventEmitter", eventEmitter);

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
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, //24 hours
  })
);

//passport config
const passportInit = require("./app/config/passport");
const { Socket } = require("dgram");
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//assets
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Global Middleware

app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});

//set Template engine

app.use(expressLayout);

app.set("views", path.join(__dirname, "/resources/views"));

app.set("view engine", "ejs");

//routes

require("./routes/web")(app);

const server = app.listen(PORT, () => {
  console.log(`app running on port ${PORT}`);
});

//socket

const io = require("socket.io")(server);
io.on("connection", (socket) => {
  socket.on("join", (orderId) => {
    socket.join(orderId);
  });
});
eventEmitter.on("orderUpdated", (data) => {
  io.to(`order_${data._id}`).emit("orderUpdated", data);
});
eventEmitter.on("orderPlaced", (data) => {
  io.to("adminRoom").emit("orderPlaced", data);
});

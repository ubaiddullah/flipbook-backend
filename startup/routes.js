const express = require("express");
const flipbook = require("../routes/flipbook");
const users = require("../routes/users");
const auth = require("../routes/auth");
const error = require("../middleware/error");

module.exports = function (app) {
  app.use(express.json());

  app.use("/api/uploads", express.static("uploads"));
  app.use("/api/flipbooks", flipbook);
  app.use("/api/users", users);
  app.use("/api/auth", auth);

  app.use(error);
};

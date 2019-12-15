const express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  cors = require("cors"),
  mongodb = require("mongodb");

// app.use(cors);
const port = process.env.port || 5000;

const states = require("./routes/api/states");
app.use("/", states);

app.listen(port, function() {
  console.log(`the  server has started on ${port}`);
});

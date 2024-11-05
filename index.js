const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { AgeCalculate } = require("age-calculation");
require("dotenv").config();

app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

// Home route
app.get("/", (req, res) => {
  res.render("home.ejs");
});

//age
app.get("/age", (req, res) => {
  const date = "2003-10-27";
  const Age = AgeCalculate(date);
  res.render("./routes/age.ejs", { Age, date });
});
app.post("/age", (req, res) => {
  const { date } = req.body;
  const Age = AgeCalculate(date);
  res.render("./routes/age", { Age, date });
});

// Server port
// Port setup and server start
let port = process.env.port;
app.listen(port, () => {
  console.log(`App is listening on ${port}`);
});

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

//age route
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

//date route
app.get("/date", (req, res) => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const today = `${year}-${month}-${day}`;
  res.render("./routes/date.ejs", {
    today,
    ans: { years: 0, months: 0, days: 0 },
    from: today,
    to: today,
  });
});

app.post("/date", (req, res) => {
  let { from, to } = req.body;
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const today = `${year}-${month}-${day}`;
  function calculateDateDifference(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    // Adjust for negative day difference
    if (days < 0) {
      months -= 1;
      days += new Date(end.getFullYear(), end.getMonth(), 0).getDate(); // Days in the previous month
    }

    // Adjust for negative month difference
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return { years, months, days };
  }
  const ans = calculateDateDifference(from, to);

  res.render("./routes/date.ejs", { today, ans, from, to });
});

// Port setup and server start
let port = process.env.port;
app.listen(port, () => {
  console.log(`App is listening on ${port}`);
});

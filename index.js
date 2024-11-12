const express = require("express");
const app = express();
const path = require("path");
const { AgeCalculate } = require("age-calculation");
const fs = require("fs");
const { send } = require("process");
require("dotenv").config();
const {
  IMCCalculator,
  MacroCalculator,
  generos,
  atividade,
  objetivo,
} = require("health-calculator-js");

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

//currency route
app.get("/currency", async (req, res) => {
  const { CurrencyConvertor } = await import("mk-currency-convertor");

  // Perform a default conversion (INR to USD, amount 50)
  let defaultAmount = 50;
  let defaultFrom = "INR";
  let defaultTo = "USD";
  let defaultResult;

  try {
    defaultResult = await CurrencyConvertor(
      defaultFrom,
      defaultTo,
      defaultAmount
    );
  } catch (error) {
    console.error("Error in default conversion:", error);
    defaultResult = "Conversion error";
  }

  // Load currency data from JSON file
  const currencies = JSON.parse(
    fs.readFileSync("./public/currency.json", "utf-8")
  );

  res.render("./routes/currency.ejs", {
    currencies,
    amount: defaultAmount,
    fromCurrency: defaultFrom,
    toCurrency: defaultTo,
    result: defaultResult,
  });
});
app.post("/currency", async (req, res) => {
  const { CurrencyConvertor } = await import("mk-currency-convertor");

  // Get form data
  const amount = req.body.amount;
  const fromCurrency = req.body.from;
  const toCurrency = req.body.to;
  let conversionResult;

  try {
    // Perform currency conversion based on form input
    conversionResult = await CurrencyConvertor(
      fromCurrency,
      toCurrency,
      amount
    );
  } catch (error) {
    console.error("Error in custom conversion:", error);
    conversionResult = "Conversion error";
  }

  // Load currency data
  const currencies = JSON.parse(
    fs.readFileSync("./public/currency.json", "utf-8")
  );

  res.render("./routes/currency.ejs", {
    currencies,
    amount,
    fromCurrency,
    toCurrency,
    result: conversionResult,
  });
});

//health route
app.get("/health", (req, res) => {
  res.render("./routes/health/health.ejs");
});
//bmi route
app.get("/health/bmi", (req, res) => {
  const bmi = IMCCalculator.calcular(60, 1.7);
  const bmiClassification = IMCCalculator.classificar(bmi);
  const classificationMap = {
    "Abaixo do peso": "Underweight",
    "Peso normal": "Normal",
    Sobrepeso: "Overweight",
    Obesidade: "Obesity",
  };
  const status = classificationMap[bmiClassification] || bmiClassification;

  res.render("./routes/health/bmi.ejs", { bmi, status });
});
app.post("/health/bmi", (req, res) => {
  let { weight, height } = req.body;
  const bmi = IMCCalculator.calcular(Number(weight), Number(height));
  const bmiClassification = IMCCalculator.classificar(bmi);
  const classificationMap = {
    "Abaixo do peso": "Underweight",
    "Peso normal": "Normal",
    Sobrepeso: "Overweight",
    Obesidade: "Obesity",
  };
  const status = classificationMap[bmiClassification] || bmiClassification;

  res.render("./routes/health/bmi.ejs", { bmi, status });
});

app.get("/health/bmr", (req, res) => {
  res.send("wrokings");
});
app.get("/health/tdee", (req, res) => {
  res.send("wrokings");
});
app.get("/health/mcnutri", (req, res) => {
  res.send("working");
});

// Port setup and server start
let port = process.env.port;
app.listen(port, () => {
  console.log(`App is listening on ${port}`);
});

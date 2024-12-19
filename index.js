const express = require("express");
const app = express();
const path = require("path");
const { AgeCalculate } = require("age-calculation");
const fs = require("fs");
const { send } = require("process");
const ConvertBase = require("convert-base");
require("dotenv").config();
const {
  IMCCalculator,
  MacroCalculator,
  generos,
  atividade,
  objetivo,
} = require("health-calculator-js");
const FastSpeedtest = require("fast-speedtest-api");

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
//bmr route
app.get("/health/bmr", (req, res) => {
  const bmr = MacroCalculator.calcularTMB(60, 1.7, 21, generos.MASCULINO);
  const sedentary = MacroCalculator.calcularTDEE(bmr, atividade.SEDENTARIO);
  const lightAc = MacroCalculator.calcularTDEE(bmr, atividade.POUCO_ATIVO);
  const modeAc = MacroCalculator.calcularTDEE(
    bmr,
    atividade.MODERADAMENTE_ATIVO
  );
  const veryAc = MacroCalculator.calcularTDEE(bmr, atividade.MUITO_ATIVO);
  res.render("./routes/health/bmr.ejs", {
    bmr,
    sedentary,
    lightAc,
    modeAc,
    veryAc,
  });
});
app.post("/health/bmr", (req, res) => {
  let { weight, height, age, gender } = req.body;

  // Convert weight, height, and age to numbers
  weight = parseFloat(weight);
  height = parseFloat(height);
  age = parseInt(age);

  // Map gender input to the appropriate constant from the library
  const genderConstant =
    gender === "Male" ? generos.MASCULINO : generos.FEMININO;

  // Calculate BMR
  const bmr = MacroCalculator.calcularTMB(weight, height, age, genderConstant);

  // Calculate daily calorie needs based on activity levels
  const sedentary = MacroCalculator.calcularTDEE(bmr, atividade.SEDENTARIO);
  const lightAc = MacroCalculator.calcularTDEE(bmr, atividade.POUCO_ATIVO);
  const modeAc = MacroCalculator.calcularTDEE(
    bmr,
    atividade.MODERADAMENTE_ATIVO
  );
  const veryAc = MacroCalculator.calcularTDEE(bmr, atividade.MUITO_ATIVO);

  // Render the result in the bmr.ejs template
  res.render("./routes/health/bmr.ejs", {
    bmr,
    sedentary,
    lightAc,
    modeAc,
    veryAc,
  });
});
//macronutrients route
app.get("/health/mcnutri", (req, res) => {
  const macronutrients = MacroCalculator.calcularMacros(
    60,
    1.7,
    21,
    generos.MASCULINO,
    atividade.SEDENTARIO,
    objetivo.BULKING
  );
  res.render("./routes/health/macnu.ejs", { macronutrients });
});
app.post("/health/mcnutri", (req, res) => {
  // Destructure the input data from req.body
  const { weight, height, age, gender, activity, objective } = req.body;

  // Map user-friendly input values to the enums or constants expected by MacroCalculator
  const genderMap = {
    Male: generos.MASCULINO,
    Female: generos.FEMININO,
  };
  const activityMap = {
    Inactive: atividade.SEDENTARIO,
    "Low Active": atividade.POUCO_ATIVO,
    Active: atividade.ATIVO,
    "Very Active": atividade.MUITO_ATIVO,
  };
  const objectiveMap = {
    "Gain weight": objetivo.BULKING,
    "Loss Weight": objetivo.CUTTING,
    "Maintain weight": objetivo.MANUTENCAO,
  };

  // Convert user inputs to the expected constants for calculation
  const genderValue = genderMap[gender];
  const activityValue = activityMap[activity];
  const objectiveValue = objectiveMap[objective];

  // Calculate macronutrients based on the provided inputs
  const macronutrients = MacroCalculator.calcularMacros(
    Number(weight),
    Number(height),
    Number(age),
    genderValue,
    activityValue,
    objectiveValue
  );

  // Render the macnu.ejs template with the calculated macronutrients
  res.render("./routes/health/macnu.ejs", { macronutrients });
});

//number syytem route
app.get("/numbercon", (req, res) => {
  let from = 10;
  let to = 2;
  let value = "10";
  const convertBase = new ConvertBase();
  let ans = convertBase.convert(value, from, to);
  res.render("./routes/nc.ejs", { ans, from, to, value });
});
// POST route
app.post("/numbercon", (req, res) => {
  let { from, value, to } = req.body;
  const convertBase = new ConvertBase();
  let ans = convertBase.convert(value, Number(from), Number(to));

  // Check if the result is NaN
  if (isNaN(Number(ans))) {
    ans = `Conversion failed: Invalid input "${value}"`;
  }
  // Render with result
  res.render("./routes/nc.ejs", { ans, from, to, value });
});

//speed routes
app.get("/speed", (req, res) => {
  res.render("./routes/speed/speed.ejs");
});
//default speed
app.get("/speed/default", (req, res) => {
  res.render("./routes/speed/default.ejs"); // Render the page immediately
});
app.get("/api/speed", async (req, res) => {
  let speedtest = new FastSpeedtest({
    token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm", // required
    verbose: false,
    timeout: 5000,
    https: true,
    urlCount: 5,
    bufferSize: 8,
    unit: FastSpeedtest.UNITS.Mbps,
  });
  try {
    const speed = await speedtest.getSpeed(); // Perform speed test
    res.json({ success: true, speed: speed.toFixed(2) }); // Respond with the speed
  } catch (error) {
    res.json({ success: false, error: error.message }); // Respond with the error
  }
});

// Port setup and server start
let port = process.env.port;
app.listen(port, () => {
  console.log(`App is listening on ${port}`);
});

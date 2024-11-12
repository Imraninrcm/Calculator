const {
  IMCCalculator,
  MacroCalculator,
  generos,
  atividade,
  objetivo,
} = require("health-calculator-js");

// Calculate BMI
const bmi = IMCCalculator.calcular(95, 1.8); // 70 kg and 1.75 meters
const bmiClassification = IMCCalculator.classificar(bmi); // Classify BMI value
console.log(`BMI: ${bmi}, Classification: ${bmiClassification}`); // Outputs BMI value and category

// Calculate BMR
const bmr = MacroCalculator.calcularTMB(95, 1.8, 21, generos.MASCULINO); // 70 kg, 1.75 meters, 25 years, male
console.log(`BMR: ${bmr}`); // Outputs BMR calorie needs

// Calculate TDEE based on activity level
const tdee = MacroCalculator.calcularTDEE(bmr, atividade.POUCO_ATIVO); // Moderate activity level
console.log(`TDEE: ${tdee}`); // Outputs TDEE calorie needs

// Calculate Macronutrients based on goal (e.g., maintain weight)
const macronutrients = MacroCalculator.calcularMacros(
  95,
  1.89,
  21,
  generos.MASCULINO,
  atividade.POUCO_ATIVO,
  objetivo.CUTTING
);
console.log(`Macronutrients:`, macronutrients); // Outputs macronutrient distribution

const ConvertBase = require("convert-base");
const convertBase = new ConvertBase();

try {
  // Example with invalid input
  let fromBase = 10;
  let toBase = 2;
  let value = "ABCD";

  // Perform conversion
  let result = convertBase.convert(value, fromBase, toBase);

  // Check if the result is NaN
  if (isNaN(Number(result))) {
    throw new Error(
      `Conversion failed: Invalid input "${value}" for base ${fromBase}`
    );
  }

  console.log("Conversion result:", result);
} catch (error) {
  console.error("An error occurred:", error.message);
}

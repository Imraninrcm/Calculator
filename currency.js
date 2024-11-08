(async () => {
  const { CurrencyConvertor } = await import("mk-currency-convertor");
  CurrencyConvertor("INR", "INR", 100.25).then((res) => {
    console.log(res);
  });
})();

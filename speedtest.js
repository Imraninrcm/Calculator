const FastSpeedtest = require("fast-speedtest-api");

let speedtest = new FastSpeedtest({
  token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm", // required
  verbose: true, // default: false
  timeout: 5000, // default: 5000
  https: true, // default: true
  urlCount: 5, // default: 5
  bufferSize: 8, // default: 8
  unit: FastSpeedtest.UNITS.Mbps, // default: Bps
});

speedtest
  .getSpeed()
  .then((speed) => {
    let value = speed;
    console.log(`Speed: ${value} Mbps`);
  })
  .catch((error) => {
    value = error.message;
    console.error(error.message);
  });

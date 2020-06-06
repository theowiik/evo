const TIMEBOX_ADDRESS = "11:75:68:ef:30:64";
var btSerial = new (require("bluetooth-serial-port").BluetoothSerialPort)();
var Divoom = require("node-divoom-timebox-evo");

btSerial.findSerialPortChannel(
  TIMEBOX_ADDRESS,
  function (channel) {
    btSerial.connect(
      TIMEBOX_ADDRESS,
      channel,
      function () {
        console.log("connected");

        btSerial.on("data", function (buffer) {
          console.log(buffer.toString("ascii"));
        });
      },
      function () {
        console.log("cannot connect");
      }
    );
  },
  function () {
    console.log("found nothing");
  }
);

var d = new Divoom.TimeboxEvo().createRequest("animation");
d.read("animation.gif")
  .then(result => {
    result.asBinaryBuffer().forEach(elt => {
      btSerial.write(elt, function (err, bytesWritten) {
        if (err) console.log(err);
      });
    });
  })
  .catch(err => {
    throw err;
  });

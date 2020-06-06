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

        writeImage();

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

function writeImage() {
  var d = new Divoom.TimeboxEvo().createRequest("picture");
  d.read("img.png")
    .then(result => {
      console.log(result.asBinaryBuffer());
      result.asBinaryBuffer().forEach(elt => {
        console.log("writing");
        btSerial.write(elt, function (err, bytesWritten) {
          if (err) console.log(err);
        });
      });
    })
    .then(value => {
      console.log("uploaded image");
    })
    .catch(err => {
      throw err;
    });
}

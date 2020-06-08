const TIMEBOX_ADDRESS = "11:75:68:ef:30:64";
var btSerial = new (require("bluetooth-serial-port").BluetoothSerialPort)();
var Divoom = require("node-divoom-timebox-evo");
let Jimp = require("jimp");

/**
 * The width of the (square) matrix.
 */
const PIXELS = 16;

/**
 * The hex color of alive cells.
 */
const ALIVE_COLOR = 0xffffffff;
const IMAGE_NAME = "frame";

let image = new Jimp(PIXELS, PIXELS, "black", (err, image) => {
  if (err) throw err;
});

image.setPixelColor(ALIVE_COLOR, 1, 1);

let file = `${IMAGE_NAME}.${image.getExtension()}`;
image.write(file);

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
  d.read(IMAGE_NAME + ".png")
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

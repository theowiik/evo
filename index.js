const TIMEBOX_ADDRESS = "11:75:68:ef:30:64";
let btSerial = new (require("bluetooth-serial-port").BluetoothSerialPort)();
let Divoom = require("node-divoom-timebox-evo");
let Jimp = require("jimp");

/**
 * The width of the (square) matrix.
 */
const PIXELS = 16;

/**
 * The hex color of alive cells.
 */
const ALIVE_COLOR = 0x42f59eff;
const IMAGE_NAME = "frame";

btSerial.findSerialPortChannel(
  TIMEBOX_ADDRESS,
  function (channel) {
    btSerial.connect(
      TIMEBOX_ADDRESS,
      channel,
      function () {
        console.log("connected");
        gameOfLife();
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

function uploadFrame() {
  var d = new Divoom.TimeboxEvo().createRequest("picture");
  d.read("frame.png")
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
      console.log(err);
    });
}

async function gameOfLife() {
  while (true) {
    let world = randomWorld();
    await worldToFrame(world);
    uploadFrame();
    await sleep(500);
  }
}

/**
 * Generates a random world.
 *
 * @returns a matrix of booleans with the width and height of the PIXELS variable.
 */
function randomWorld() {
  let world = [];
  const p = 0.2;

  for (let rowIndex = 0; rowIndex < PIXELS; rowIndex++) {
    let row = [];

    for (let colIndex = 0; colIndex < PIXELS; colIndex++) {
      row.push(Math.random() <= p);
    }

    world.push(row);
  }

  return world;
}

function worldToFrame(w) {
  let image = new Jimp(PIXELS, PIXELS, "black", (err, image) => {
    if (err) throw err;
  });

  for (let rowIndex = 0; rowIndex < PIXELS; rowIndex++) {
    for (let colIndex = 0; colIndex < PIXELS; colIndex++) {
      if (w[rowIndex][colIndex]) image.setPixelColor(ALIVE_COLOR, rowIndex, colIndex);
    }
  }

  let file = `${IMAGE_NAME}.${image.getExtension()}`;

  return image
    .writeAsync(file)
    .then(() => {
      console.log("saved image");
    })
    .catch(err => {
      console.log("could not save image");
    });
}

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

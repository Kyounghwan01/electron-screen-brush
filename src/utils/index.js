import { v4 } from "uuid";
import Jimp from "jimp/es";
const fs = window.require("fs");
const path = window.require("path");
const { shell, remote } = window.require("electron");

export const saveToDisk = (img, discardSnip) => {
  const directory = remote.app.getPath("pictures"); // Users/ky/Pictures
  const filepath = path.join(directory + "/" + v4() + ".png");
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
  fs.writeFile(
    filepath,
    img.replace(/^data:image\/(png|gif|jpeg);base64,/, ""),
    "base64",
    err => {
      if (err) console.log(err);
      shell.showItemInFolder(filepath); // 저장한 파일 리렉토리 open
      // discardSnip(null); // 초기화 하고 싶으면 실행
    }
  );
};

export const getImgUrl = async (base64data, mode, coordinate, cb) => {
  // add to buffer base64 image instead of saving locally in order to manipulate with Jimp
  let encondedImageBuffer = new Buffer(
    base64data.replace(/^data:image\/(png|gif|jpeg);base64,/, ""),
    "base64"
  );

  Jimp.read(encondedImageBuffer, (err, image) => {
    if (err) throw err;

    const crop =
      mode === "fullScreen"
        ? image
        : image.crop(
            coordinate.x,
            coordinate.y,
            parseInt(coordinate.width, 10),
            parseInt(coordinate.height, 10)
          );

    crop.getBase64("image/png", (err, base64data) => cb(base64data));
  });
};

export const getScreenShot = async (
  imageFormat,
  selectWindow,
  handleStream
) => {
  try {
    imageFormat = imageFormat || "image/png";

    console.log("desktopCapturer getSources");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: selectWindow,
            minWidth: 1280,
            maxWidth: 4000,
            minHeight: 720,
            maxHeight: 4000
          }
        }
      });
      console.log("stream getUserMedia res", stream);
      handleStream(stream, imageFormat);
    } catch (e) {
      console.log(e);
    }
  } catch (e) {
    console.log(e);
  }
};

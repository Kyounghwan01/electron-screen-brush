// 일렉트론 블로그 포스팅용 자료

import React, { useState, useEffect, useContext, useRef } from "react";
import { ImageContext } from "../context";
import SelectBox from "./SelectBox";
import CloseBtn from "./CloseBtn";
import ImageCrop from "./ImageCrop";
import { saveToDisk, getImgUrl, getScreenShot } from "../utils";

const { ipcRenderer, desktopCapturer, remote } = window.require("electron");
const path = require("path");
const url = require("url");

const { screen } = remote;

const BrowserWindow = remote.BrowserWindow;
const screenSize = screen.getPrimaryDisplay().size;

let snipWindow = null,
  mainWindow = null;

const NewSnipper = () => {
  const [mode, setMode] = useState("none");
  const [currentWindow] = useState(remote.getCurrentWindow());
  const [windowList, setWindowList] = useState([]);
  const [selectWindow, setSelectWindow] = useState("");
  const { data, setImageData } = useContext(ImageContext);
  const previewCanvasRef = useRef(null);

  useEffect(() => {
    setWindows();
  }, []);

  useEffect(() => {
    setImageData({ image: null });
    setMode("none");
  }, [selectWindow]);

  const setWindows = async () => {
    const res = await desktopCapturer.getSources({ types: ["screen"] });
    setWindowList(res);
  };

  const destroyCurrentWindow = () => {
    currentWindow.close();
  };

  const handleStream = (stream, imageFormat, coordinate) => {
    console.log("handleStream");
    // Create hidden video tag
    let video_dom = document.createElement("video");
    video_dom.style.cssText = "position:absolute;top:-10000px;left:-10000px;";
    // Event connected to stream
    video_dom.onloadedmetadata = function () {
      // Set video ORIGINAL height (screenshot)
      video_dom.style.height = this.videoHeight + "px"; // videoHeight
      video_dom.style.width = this.videoWidth + "px"; // videoWidth

      // Create canvas
      let canvas = document.createElement("canvas");
      canvas.width = this.videoWidth;
      canvas.height = this.videoHeight;
      let ctx = canvas.getContext("2d");
      // Draw video on canvas
      ctx.drawImage(video_dom, 0, 0, canvas.width, canvas.height);

      // Save screenshot to base64
      console.log(55555, coordinate);
      getImgUrl(canvas.toDataURL(imageFormat), coordinate, base64data => {
        console.log(base64data);
        setImageData({ image: base64data });
        setMode("capture");
        // resizeWindowFor("snip");
        currentWindow.show();
      });

      // Remove hidden video tag
      video_dom.remove();
      try {
        // Destroy connect to stream
        stream.getTracks()[0].stop();
      } catch (e) {}
    };

    console.log(stream);
    video_dom.srcObject = stream;
    video_dom.play();
    document.body.appendChild(video_dom);
  };

  const captureScreen = coordinates => {
    console.log(6666, coordinates);
    // coordinates 가 다른 screen이어서 공유가 안되네 params으로 넘겨야겠다
    currentWindow.hide();
    // setCoordinates(coordinates);
    getScreenShot(null, selectWindow, handleStream, coordinates);
  };

  const discardSnip = () => {
    setImageData({ image: null });
    setMode("none");
    // resizeWindowFor("main");
  };

  const initCropper = () => {
    mainWindow = currentWindow;
    mainWindow.hide();

    snipWindow = new BrowserWindow({
      width: screenSize.width,
      height: screenSize.height,
      frame: false,
      transparent: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false
      }
    });

    snipWindow.on("close", () => {
      snipWindow = null;
    });

    ipcRenderer.once("snipCropImage", (event, data) => {
      console.log(8999, data);
      captureScreen(data);
    });

    ipcRenderer.once("cancelled", event => {
      mainWindow.show();
    });

    snipWindow.loadURL(
      global.location.hostname === "localhost"
        ? "http://localhost:3000?snip"
        : url.format({
            pathname: path.join(__dirname, "../build/index.html"),
            protocol: "file:",
            slashes: true
          }) + "?snip"
    );
    snipWindow.setResizable(false);
  };

  const getMainInstance = () => {
    let instances = BrowserWindow.getAllWindows();
    return instances.filter(instance => {
      return instance.id !== currentWindow.id;
    })[0];
  };

  const snapShootCropImage = state => {
    getMainInstance().webContents.send("snipCropImage", state);
    destroyCurrentWindow(null);
  };

  const destroySnipView = () => {
    getMainInstance().webContents.send("cancelled");
    destroyCurrentWindow(null);
  };

  const cutImage = () => {
    const base64Image = previewCanvasRef.current.toDataURL("image/jpeg");
    setImageData({ image: base64Image });
    setMode("capture");
  };

  return (
    <>
      <div className="snip-controls text-center">
        <CloseBtn destroyCurrentWindow={destroyCurrentWindow} />

        <div className="snipper-container">
          <h2 className="margin-20">Snipper</h2>

          {!data.image && (
            <div className="margin-20">
              <SelectBox list={windowList} setter={setSelectWindow} />
            </div>
          )}

          <div>
            {mode === "none" ? (
              <>
                {selectWindow && (
                  <button
                    className="btn btn-primary"
                    onClick={() => captureScreen(null)}
                  >
                    캡쳐
                  </button>
                )}
              </>
            ) : (
              <div>
                {mode === "capture" ? (
                  <>
                    <button
                      className="btn btn-primary mr-2"
                      onClick={() => saveToDisk(data.image, discardSnip)}
                    >
                      Save to Disk
                    </button>

                    <button
                      className="btn btn-primary mr-2"
                      // onClick={() => saveToDisk(image, discardSnip)}
                    >
                      brush
                    </button>

                    <button
                      className="btn btn-primary mr-2"
                      onClick={() => setMode("crop")}
                    >
                      Crop image
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-primary mr-2" onClick={cutImage}>
                      cut!
                    </button>
                  </>
                )}

                <button className="btn btn-primary mr-1" onClick={discardSnip}>
                  Discard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {data.image && (
        <div className="snipped-image">
          {mode === "capture" ? (
            <img className="preview" src={data.image} alt="" />
          ) : (
            <div className="preview">
              <ImageCrop
                previewCanvasRef={previewCanvasRef}
                captureImage={data.image}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default NewSnipper;

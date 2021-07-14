import React, { useState, useEffect } from "react";
import "./Snipper.scss";
import Cropper from "./Cropper";
import SelectBox from "../components/SelectBox";
import { saveToDisk, getImgUrl, getScreenShot } from "../utils";

const { ipcRenderer, desktopCapturer, remote } = window.require("electron");
const path = require("path");
const url = require("url");

const { screen } = remote;

const BrowserWindow = remote.BrowserWindow;
const dev = process.env.NODE_ENV === "development";
const screenSize = screen.getPrimaryDisplay().size;

let snipWindow = null,
  mainWindow = null;

const NewSnipper = () => {
  const [view, setView] = useState("");
  const [saveControls, setSaveControls] = useState(false);
  const [image, setImage] = useState("");
  const [coordinate, setCoordinates] = useState(null);
  const [currentWindow] = useState(remote.getCurrentWindow());
  const [windowList, setWindowList] = useState([]);
  const [selectWindow, setSelectWindow] = useState("");
  const [mode, setMode] = useState("fullScreen");

  useEffect(() => {
    const context = global.location.search;
    setView(context.substr(1, context.length - 1));

    setWindows();
  }, []);

  useEffect(() => {
    setImage("");
    setSaveControls(false);
  }, [selectWindow]);

  const setWindows = async () => {
    const res = await desktopCapturer.getSources({ types: ["screen"] });
    setWindowList(res);
  };

  const destroyCurrentWindow = () => {
    currentWindow.close();
  };

  const resizeWindowFor = view => {
    if (view === "snip") {
      currentWindow.setSize(800, 500);
      let x = screenSize.width / 2 - 400;
      let y = screenSize.height / 2 - 250;
      currentWindow.setPosition(x, y);
    } else if (view === "main") {
      const width = dev ? 800 : 400;
      const height = dev ? 800 : 200;
      currentWindow.setSize(width, height);
      let x = screenSize.width / 2 - width / 2;
      let y = screenSize.height / 2 - height / 2;
      currentWindow.setPosition(x, y);
    }
  };

  const handleStream = (stream, imageFormat) => {
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
      getImgUrl(canvas.toDataURL(imageFormat), mode, coordinate, base64data => {
        setImage(base64data);
        setSaveControls(true);
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

  const captureScreen = (coordinates, mode) => {
    currentWindow.hide();
    setMode(mode);
    setCoordinates(coordinates);
    getScreenShot(null, selectWindow, handleStream);
  };

  const discardSnip = () => {
    setImage("");
    setSaveControls(false);
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
      captureScreen(data, null);
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

  return (
    <>
      {view === "main" ? (
        <>
          <div className="snip-controls text-center">
            <span
              className="close"
              title="close"
              onClick={destroyCurrentWindow}
            >
              &times;
            </span>

            <div>
              <h2>Snipper</h2>
            </div>

            <SelectBox list={windowList} setter={setSelectWindow} />

            {!saveControls ? (
              <>
                {selectWindow && (
                  <div>
                    <button
                      className="btn btn-primary mr-1"
                      onClick={() => captureScreen(null, "fullScreen")}
                    >
                      Fullscreen
                    </button>

                    <button
                      className="btn btn-primary mr-1"
                      onClick={initCropper}
                    >
                      Crop Image
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div>
                <button
                  className="btn btn-primary mr-1"
                  onClick={() => saveToDisk(image, discardSnip)}
                >
                  Save to Disk
                </button>

                <button className="btn btn-primary mr-1" onClick={discardSnip}>
                  Discard
                </button>
              </div>
            )}
          </div>

          {image && (
            <div className="snipped-image">
              <img className="preview" src={image} alt="" />
            </div>
          )}
        </>
      ) : (
        <Cropper
          screen={screen}
          snapShootCropImage={snapShootCropImage}
          destroySnipView={destroySnipView}
        />
      )}
    </>
  );
};

export default NewSnipper;

import React, { useState, useEffect } from "react";
import "./Snipper.scss";
// import Cropper from "./Cropper";
import Jimp from "jimp/es";
import { v4 } from "uuid";
import SelectBox from "../components/SelectBox";
import { saveToDisk, getImgUrl, getScreenShot } from "../utils";

const { ipcRenderer, desktopCapturer, shell, remote } =
  window.require("electron");
const { screen } = remote; // Main process modules

// const BrowserWindow = remote.BrowserWindow;
const dev = process.env.NODE_ENV === "development";
const path = window.require("path");
const screenSize = screen.getPrimaryDisplay().size;
const fs = window.require("fs");

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

  const destoryCurrentWindow = () => {
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

  return (
    <>
      {view === "main" ? (
        <>
          <div className="snip-controls text-center">
            <span
              className="close"
              title="close"
              onClick={destoryCurrentWindow}
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
                      // onClick={this.initCropper.bind(this)}
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
        // <Cropper
        // snip={this.snip.bind(this)}
        // destroySnipView={this.destroySnipView.bind(this)}
        // />
        <div>cropper</div>
      )}
    </>
  );
};

export default NewSnipper;

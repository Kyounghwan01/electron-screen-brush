/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useRef } from "react";
import "./Snipper.scss";
import { ImageContext } from "../context";
import SelectBox from "../components/SelectBox";
import CloseBtn from "../components/CloseBtn";
import ImageCrop from "../components/ImageCrop";
import { saveToDisk, getImgUrl, getScreenShot, onSelectFile } from "../utils";

const { desktopCapturer, remote } = window.require("electron");

const NewSnipper = () => {
  const [currentWindow] = useState(remote.getCurrentWindow());
  const { data, setImageData } = useContext(ImageContext);
  const previewCanvasRef = useRef(null);

  useEffect(() => {
    setWindows();
  }, []);

  useEffect(() => {
    setImageData({ image: null, mode: "none" });
  }, [data.selectWindow]);

  const setWindows = async () => {
    const res = await desktopCapturer.getSources({ types: ["screen"] });
    setImageData({ windowList: res });
  };

  const destroyCurrentWindow = () => {
    currentWindow.close();
  };

  const handleStream = stream => {
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
      getImgUrl(canvas.toDataURL("image/png"), base64data => {
        setImageData({ image: base64data, mode: "capture" });

        currentWindow.show();
      });

      // Remove hidden video tag
      video_dom.remove();
      try {
        // Destroy connect to stream
        stream.getTracks()[0].stop();
      } catch (e) {}
    };

    video_dom.srcObject = stream;
    video_dom.play();
    document.body.appendChild(video_dom);
  };

  const captureScreen = () => {
    // coordinates 가 다른 screen이어서 공유가 안되네 params으로 넘겨야겠다
    currentWindow.hide();
    getScreenShot(data.selectWindow, handleStream);
  };

  const discardSnip = () => {
    setImageData({ image: null, mode: "none", selectWindow: "" });
  };

  const cutImage = () => {
    const base64Image = previewCanvasRef.current.toDataURL("image/jpeg");
    setImageData({ image: base64Image, mode: "capture" });
  };

  return (
    <>
      <div className="snip-controls text-center">
        <CloseBtn destroyCurrentWindow={destroyCurrentWindow} />

        <div className="snipper-container">
          <h2 className="margin-20">Snipper</h2>

          {!data.image && (
            <div className="margin-20">
              <SelectBox />
            </div>
          )}

          <div style={{ display: "flex" }}>
            {data.mode === "none" ? (
              <>
                {data.selectWindow && (
                  <button className="btn btn-primary" onClick={captureScreen}>
                    Capture
                  </button>
                )}
              </>
            ) : (
              <div>
                {data.mode === "capture" ? (
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
                      Brush
                    </button>

                    <button
                      className="btn btn-primary mr-2"
                      onClick={() => setImageData({ mode: "crop" })}
                    >
                      Crop image
                    </button>
                  </>
                ) : (
                  <>
                    {data.mode === "fileUpload" ? (
                      <button
                        className="btn btn-primary mr-2"
                        onClick={() => setImageData({ mode: "crop" })}
                      >
                        Crop image
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn btn-primary mr-2"
                          onClick={cutImage}
                        >
                          Cut
                        </button>
                      </>
                    )}
                  </>
                )}

                <button className="btn btn-primary mr-1" onClick={discardSnip}>
                  Discard
                </button>
              </div>
            )}
            {data.mode === "none" && (
              <>
                <label
                  className="btn btn-primary file-upload-btn"
                  for="input-file"
                  accept="image/*"
                >
                  File-upload
                </label>
                <input
                  type="file"
                  id="input-file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={e => onSelectFile(e, setImageData)}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {data.image && (
        <div className="snipped-image">
          <div className="preview">
            {data.mode === "capture" || data.mode === "fileUpload" ? (
              <img className="preview" src={data.image} alt="capture-img" />
            ) : (
              <ImageCrop
                previewCanvasRef={previewCanvasRef}
                captureImage={data.image}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NewSnipper;

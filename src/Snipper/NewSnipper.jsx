/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useContext, useRef } from "react";
import "./Snipper.scss";
import { ImageContext, ModalRoot } from "../context";
import SelectBox from "../components/SelectBox";
import CloseBtn from "../components/CloseBtn";
import ImageCrop from "../components/ImageCrop";
import ButtonGroup from "../components/ButtonGroup";
import Brush from "../components/Brush";
import { getImgUrl, getScreenShot } from "../utils";

const { desktopCapturer, remote } = window.require("electron");

const NewSnipper = () => {
  const [currentWindow] = useState(remote.getCurrentWindow());
  const { data, setImageData } = useContext(ImageContext);
  const canvasRef = useRef(null);

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

  const cutImage = () => {
    const base64Image = canvasRef.current.toDataURL("image/jpeg");
    setImageData({ image: base64Image, mode: "capture" });
  };

  return (
    <>
      <ModalRoot />
      <div className="snip-controls text-center">
        <CloseBtn />

        <div className="snipper-container">
          <h2 className="margin-20">Snipper</h2>

          {!data.image && (
            <div className="margin-20">
              <SelectBox />
            </div>
          )}

          <div style={{ display: "flex" }}>
            <ButtonGroup
              canvasRef={canvasRef}
              cutImage={cutImage}
              captureScreen={captureScreen}
            />
          </div>
        </div>
      </div>

      {data.image && (
        <div className="snipped-image">
          <div className="preview">
            {data.mode === "capture" || data.mode === "fileUpload" ? (
              <img className="preview" src={data.image} alt="capture-img" />
            ) : (
              <>
                {data.mode === "brush" ? (
                  <Brush canvasRef={canvasRef} />
                ) : (
                  <ImageCrop canvasRef={canvasRef} />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NewSnipper;

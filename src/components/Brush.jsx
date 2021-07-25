/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useEffect, useContext } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { ImageContext } from "../context";
import "./Brush.scss";

const Brush = ({ canvasRef }) => {
  const [upImg, setUpImg] = useState();
  const imgRef = useRef(null);
  const contextRef = useRef(null);
  const [crop, setCrop] = useState({ unit: "%", width: 100, height: 100 });
  const [imageSize, setImageSize] = useState(null);
  const [isFinishImgLoad, setFinishImgLoad] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWeight, setLineWeight] = useState(2.5);
  const { data } = useContext(ImageContext);

  useEffect(() => {
    setUpImg(data.image);

    if (!imageSize || !canvasRef.current || !imgRef.current) {
      return;
    }
    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pixelRatio = window.devicePixelRatio;

    canvas.width = imageSize.width * pixelRatio;
    canvas.height = imageSize.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    ctx.lineWidth = lineWeight;
    ctx.drawImage(image, 0, 0, imageSize.width, imageSize.height);

    contextRef.current = ctx;
    setFinishImgLoad(true);
  }, [imageSize]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const changeStrokeColor = event => {
    const color = event.target.style.backgroundColor || "#ffffff";
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
  };

  function handleRangeChange(event) {
    const size = event.target.value;
    setLineWeight(size);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineWidth = size;
  }

  return (
    <>
      {!isFinishImgLoad && (
        <ReactCrop
          src={upImg}
          onImageLoaded={img => (imgRef.current = img)}
          crop={crop}
          onChange={c => setCrop(c)}
          onComplete={c => setImageSize(c)}
        />
      )}

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        style={{
          width: Math.round(imageSize?.width ?? 0),
          height: Math.round(imageSize?.height ?? 0)
        }}
      />

      <div className="brush-dock">
        {[
          "#2c2c2c",
          "#ff3b30",
          "#ff9500",
          "#ffcc00",
          "#4cd963",
          "#5ac9fa",
          "#0579ff",
          "#5856d6",
          "#ffffff"
        ].map((color, index) => (
          <div key={index}>
            {color === "#ffffff" ? (
              <div className="controls__erase" onClick={changeStrokeColor}>
                <div className="top" />
                <div className="middle" />
              </div>
            ) : (
              <div
                className="controls__color"
                style={{ backgroundColor: color }}
                onClick={e => changeStrokeColor(e)}
              />
            )}
          </div>
        ))}

        <div className="controls__range">
          <input
            type="range"
            min="0.1"
            max="5.0"
            value={lineWeight}
            step="0.1"
            onChange={handleRangeChange}
          />
        </div>
      </div>
    </>
  );
};

export default Brush;

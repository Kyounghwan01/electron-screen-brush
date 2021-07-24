/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useEffect, useContext } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { ImageContext } from "../context";

const Brush = ({ canvasRef }) => {
  const [upImg, setUpImg] = useState();
  const imgRef = useRef(null);
  const contextRef = useRef(null);
  const [crop, setCrop] = useState({ unit: "%", width: 100, height: 100 });
  const [imageSize, setImageSize] = useState(null);
  const [isFinishImgLoad, setFinishImgLoad] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
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
    ctx.lineWidth = 5;
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
    </>
  );
};

export default Brush;

/**
 * 
 * ×
TypeError: Failed to execute 'drawImage' on 'CanvasRenderingContext2D': The provided value is not of type '(CSSImageValue or HTMLImageElement or SVGImageElement or HTMLVideoElement or HTMLCanvasElement or ImageBitmap or OffscreenCanvas or VideoFrame)'

-> 이미지로드되지 않은 상태에서 image를 canvas에 넣을때 생기는 에러
 */

/**
const Brush = () => {
  const canvasRef = useRef(null);
  const { data } = useContext(ImageContext);

  useEffect(() => {
    console.log(data);
    const ctx = canvasRef.current.getContext("2d");
    ctx.drawImage(data.image, 0, 0);
  }, [canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%"
      }}
    />
  );
};

export default Brush;
 */

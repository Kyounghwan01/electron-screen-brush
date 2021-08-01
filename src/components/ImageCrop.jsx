import { useState, useCallback, useRef, useEffect, useContext } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { ImageContext } from "context";

const ImageCrop = ({ canvasRef }) => {
  const [upImg, setUpImg] = useState();
  const imgRef = useRef(null);
  const [crop, setCrop] = useState({ unit: "%", width: 30, aspect: 16 / 9 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const { data } = useContext(ImageContext);

  const onLoad = useCallback(img => {
    imgRef.current = img;
  }, []);

  useEffect(() => {
    setUpImg(data.image);

    if (!completedCrop || !canvasRef.current || !imgRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
  }, [completedCrop]);

  return (
    <>
      <ReactCrop
        src={upImg}
        onImageLoaded={onLoad}
        crop={crop}
        onChange={c => setCrop(c)}
        onComplete={c => setCompletedCrop(c)}
      />
      <div style={{ display: "none" }}>
        <canvas
          ref={canvasRef}
          style={{
            width: Math.round(completedCrop?.width ?? 0),
            height: Math.round(completedCrop?.height ?? 0)
          }}
        />
      </div>
    </>
  );
};

export default ImageCrop;

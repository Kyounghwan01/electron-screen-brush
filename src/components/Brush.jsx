import { useState, useRef, useEffect, useContext } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import styled from "styled-components";
import { ImageContext, ModalContext } from "context";

const Brush = ({ canvasRef }) => {
  const [upImg, setUpImg] = useState();
  const imgRef = useRef(null);
  const contextRef = useRef(null);
  const [crop, setCrop] = useState({ unit: "%", width: 100, height: 100 });
  const [imageSize, setImageSize] = useState(null);
  const [isFinishImgLoad, setFinishImgLoad] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWeight, setLineWeight] = useState(2.5);
  const { data, setPlatteColor } = useContext(ImageContext);
  const { showModal } = useContext(ModalContext);

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

  const handleRangeChange = event => {
    const size = event.target.value;
    setLineWeight(size);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineWidth = size;
  };

  const erasePaper = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(imgRef.current, 0, 0, imageSize.width, imageSize.height);
  };

  const popColorSelector = () => {
    import("./popup/PalletPop").then(({ default: Component }) => {
      showModal({
        component: Component,
        modalProps: {
          title: "h2h2h2h2h2h2",
          desc: "h3h3h3h3h3"
        }
      });
    });
  };

  return (
    <BrushBlock>
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
        {[...setPlatteColor(), "selector", "erase"].map((color, index) => (
          <div key={index}>
            {color === "erase" ? (
              <div className="controls__erase" onClick={erasePaper}>
                <div className="top" />
                <div className="middle" />
              </div>
            ) : (
              <>
                {color === "selector" ? (
                  <div className="controls__color" onClick={popColorSelector}>
                    <img
                      src="rainbow-circle.png"
                      style={{ width: "50px", borderRadius: "50%" }}
                      alt="색편집"
                    />
                  </div>
                ) : (
                  <div
                    className="controls__color"
                    style={{ backgroundColor: color }}
                    onClick={e => changeStrokeColor(e)}
                  />
                )}
              </>
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
    </BrushBlock>
  );
};

const BrushBlock = styled.div`
  .controls__color {
    width: 50px;
    height: 50px;
    box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
    border-radius: 25px;
    cursor: pointer;
    margin: 10px 0 0 10px;
  }

  .controls__erase {
    box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);

    cursor: pointer;
    margin: 10px 0 0 10px;
    display: flex;
    border-radius: 8px;
    width: 50px;
    .top {
      width: 30px;
      height: 40px;
      background-color: dodgerblue;
    }
    .middle {
      width: 20px;
      height: 40px;
      background-color: white;
      border-radius: 0 8px 8px 0;
    }
  }

  .brush-dock {
    position: absolute;
    left: 0;
    height: 100vh;
    z-index: 1;
    top: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .controls__range {
    margin: 10px 0 0 10px;
    input {
      width: 100px;
    }
  }
`;

export default Brush;

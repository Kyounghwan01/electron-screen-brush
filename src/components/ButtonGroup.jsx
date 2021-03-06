import { useContext, useCallback } from "react";
import { ImageContext } from "context";
import { saveToDisk, onSelectFile } from "utils";

const ButtonGroup = ({ captureScreen, cutImage, canvasRef }) => {
  const { data, setImageData } = useContext(ImageContext);

  const discardSnip = () => {
    setImageData({ image: null, mode: "none", selectWindow: "" });
  };

  const NoneModeButtonGroup = () => (
    <>
      {data.selectWindow && (
        <button className="btn btn-primary" onClick={captureScreen}>
          Capture
        </button>
      )}
      <label
        className="btn btn-primary file-upload-btn"
        htmlFor="input-file"
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
  );

  const FileUploadModeButtonGroup = () => {
    return (
      <>
        {[
          { title: "Brush", func: () => setImageData({ mode: "brush" }) },
          {
            title: "Crop image",
            func: () => setImageData({ mode: "crop" })
          },
          {
            title: "Discard",
            func: discardSnip
          }
        ].map(({ title, func }) => (
          <button key={title} className="btn btn-primary mr-2" onClick={func}>
            {title}
          </button>
        ))}
      </>
    );
  };

  const CropModeButtonGroup = () => (
    <>
      {[
        {
          title: "Cut",
          func: cutImage
        },
        {
          title: "Discard",
          func: discardSnip
        }
      ].map(({ title, func }) => (
        <button key={title} className="btn btn-primary mr-2" onClick={func}>
          {title}
        </button>
      ))}
    </>
  );

  const CaptureModeButtonGroup = () => (
    <>
      {[
        {
          title: "Save to Disk",
          func: () => saveToDisk(data.image, discardSnip)
        },
        { title: "Brush", func: () => setImageData({ mode: "brush" }) },
        {
          title: "Crop image",
          func: () => setImageData({ mode: "crop" })
        },
        {
          title: "Discard",
          func: discardSnip
        }
      ].map(({ title, func }) => (
        <button key={title} className="btn btn-primary mr-2" onClick={func}>
          {title}
        </button>
      ))}
    </>
  );

  const BrushModeButtonGroup = () => (
    <>
      {[
        {
          title: "Save to Disk",
          func: () =>
            saveToDisk(canvasRef.current.toDataURL("image/jpeg"), discardSnip)
        },
        {
          title: "Crop image",
          func: () =>
            setImageData({
              image: canvasRef.current.toDataURL("image/jpeg"),
              mode: "crop"
            })
        },
        {
          title: "Discard",
          func: discardSnip
        }
      ].map(({ title, func }) => (
        <button key={title} className="btn btn-primary mr-2" onClick={func}>
          {title}
        </button>
      ))}
    </>
  );

  const RenderComponent = useCallback(() => {
    switch (data.mode) {
      case "none":
        return <NoneModeButtonGroup />;
      case "fileUpload":
        return <FileUploadModeButtonGroup />;
      case "crop":
        return <CropModeButtonGroup />;
      case "capture":
        return <CaptureModeButtonGroup />;
      case "brush":
        return <BrushModeButtonGroup />;
      default:
        return <NoneModeButtonGroup />;
    }
  }, [data.mode, data.selectWindow]);

  return <RenderComponent />;
};

export default ButtonGroup;

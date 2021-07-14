import { useState } from "react";
import { Rnd } from "react-rnd";
const { remote } = window.require("electron");
const { screen } = remote;

const screenSize = screen.getPrimaryDisplay().size;

const style = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "solid 2px #3a38d2",
  margin: "5px"
};

const Cropper = ({ snapShootCropImage, destroySnipView }) => {
  const [size, setSize] = useState({
    width: "500px",
    height: "500px",
    x: screenSize.width / 2 - 250,
    y: screenSize.height / 2 - 250
  });

  return (
    <Rnd
      style={style}
      size={{ width: size.width, height: size.height }}
      position={{ x: size.x, y: size.y }}
      onDragStop={(e, d) => {
        setSize({ ...size, x: d.x, y: d.y });
      }}
      onResize={(e, direction, ref, delta, position) => {
        setSize({
          width: ref.style.width,
          height: ref.style.height,
          x: position.x,
          y: position.y
        });
      }}
      bounds={"parent"}
    >
      <div className="rnd-controls">
        <button
          className="btn btn-primary"
          onClick={() => snapShootCropImage(size)}
        >
          Capture
        </button>
        <button onClick={destroySnipView} className="btn btn-primary">
          Cancel
        </button>
      </div>
    </Rnd>
  );
};

export default Cropper;

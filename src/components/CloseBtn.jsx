import { useState } from "react";
import "../Snipper/Snipper.scss";

const { remote } = window.require("electron");

const CloseBtn = () => {
  const [currentWindow] = useState(remote.getCurrentWindow());
  const closeWindow = () => {
    currentWindow.close();
  };

  return (
    <span className="close" title="close" onClick={closeWindow}>
      &times;
    </span>
  );
};

export default CloseBtn;

import React from "react";
import ReactDOM from "react-dom";
import { ImageProvider, ModalProvider } from "./context";
import NewSnipper from "./Snipper/NewSnipper";
import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.render(
  <React.StrictMode>
    <ImageProvider>
      <ModalProvider>
        <NewSnipper />
      </ModalProvider>
    </ImageProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

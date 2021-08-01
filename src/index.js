import React from "react";
import ReactDOM from "react-dom";
import { ImageProvider, ModalProvider } from "./context";
import Main from "./Main";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.scss";

ReactDOM.render(
  <React.StrictMode>
    <ImageProvider>
      <ModalProvider>
        <Main />
      </ModalProvider>
    </ImageProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

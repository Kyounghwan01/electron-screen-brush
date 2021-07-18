import React from "react";
import ReactDOM from "react-dom";
import { ImageProvider } from "./context";
import NewSnipper from "./Snipper/NewSnipper";
import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.render(
  <React.StrictMode>
    <ImageProvider>
      <NewSnipper />
    </ImageProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

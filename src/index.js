import React from "react";
import ReactDOM from "react-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

// import Snipper from "./Snipper/Snipper";
import NewSnipper from "./Snipper/NewSnipper";

ReactDOM.render(
  <React.StrictMode>
    <NewSnipper />
  </React.StrictMode>,
  document.getElementById("root")
);

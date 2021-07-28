import React, { useState } from "react";

export const ImageContext = React.createContext();

const ImageProvider = ({ children }) => {
  const [data, setData] = useState({
    image: null,
    mode: "none",
    cropImage: null,
    selectWindow: "",
    windowList: [],
    platte: [
      { r: 44, g: 44, b: 44 },
      { r: 255, g: 60, b: 47 },
      { r: 255, g: 149, b: 0 },
      { r: 255, g: 230, b: 2 },
      { r: 75, g: 217, b: 99 },
      { r: 90, g: 202, b: 250 },
      { r: 5, g: 121, b: 255 },
      { r: 88, g: 86, b: 213 },
      { r: 255, g: 255, b: 255 }
    ],
    initPlatte: [
      { r: 44, g: 44, b: 44 },
      { r: 255, g: 60, b: 47 },
      { r: 255, g: 149, b: 0 },
      { r: 255, g: 230, b: 2 },
      { r: 75, g: 217, b: 99 },
      { r: 90, g: 202, b: 250 },
      { r: 5, g: 121, b: 255 },
      { r: 88, g: 86, b: 213 },
      { r: 255, g: 255, b: 255 }
    ]
  });

  const setImageData = props => {
    setData({ ...data, ...props });
  };

  const setPlatteColor = init => {
    return data[init ? "initPlatte" : "platte"].map(
      color => `rgb(${color.r},${color.g},${color.b})`
    );
  };

  return (
    <ImageContext.Provider value={{ data, setImageData, setPlatteColor }}>
      {children}
    </ImageContext.Provider>
  );
};

export default ImageProvider;

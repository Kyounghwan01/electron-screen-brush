import React, { useState } from "react";

export const ImageContext = React.createContext();

const ImageProvider = ({ children }) => {
  const [data, setData] = useState({
    image: null,
    mode: "none",
    cropImage: null,
    selectWindow: "",
    windowList: []
  });

  const setImageData = props => {
    setData({ ...data, ...props });
  };

  return (
    <ImageContext.Provider value={{ data, setImageData }}>
      {children}
    </ImageContext.Provider>
  );
};

export default ImageProvider;

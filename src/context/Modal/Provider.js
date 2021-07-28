import React, { useState } from "react";

export const ModalContext = React.createContext();

const ModalProvider = ({ children }) => {
  const [data, setData] = useState({
    component: null,
    modalProps: {},
    isOpen: false
  });

  const showModal = ({ component, modalProps = {} }) => {
    setData({ ...data, component, modalProps, isOpen: true });
  };

  const hideModal = () => {
    setData({ ...data, isOpen: false });
  };

  return (
    <ModalContext.Provider value={{ ...data, showModal, hideModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;

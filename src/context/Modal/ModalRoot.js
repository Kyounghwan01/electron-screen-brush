import React from "react";
import { ModalContext } from "./Provider";
import Portal from "../../components/Portal";

const ModalRoot = () => {
  const {
    component: Component,
    isOpen,
    hideModal,
    modalProps
  } = React.useContext(ModalContext);

  return (
    Component &&
    isOpen && (
      <Portal selector="#portal">
        <Component {...modalProps} isOpen={isOpen} hideModal={hideModal} />
      </Portal>
    )
  );
};

export default ModalRoot;

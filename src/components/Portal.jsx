import ReactDOM from "react-dom";

const Portal = props => {
  const element =
    typeof window !== "undefined" && document.querySelector(props.selector);
  return element && props.children
    ? ReactDOM.createPortal(props.children, element)
    : null;
};

export default Portal;

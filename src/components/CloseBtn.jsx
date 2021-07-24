import "../Snipper/Snipper.scss";

const CloseBtn = ({ destroyCurrentWindow }) => {
  return (
    <span className="close" title="close" onClick={destroyCurrentWindow}>
      &times;
    </span>
  );
};

export default CloseBtn;

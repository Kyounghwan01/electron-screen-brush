import React, { useContext } from "react";
import { ImageContext } from "../context";

const SelectBox = () => {
  const { data, setImageData } = useContext(ImageContext);

  return (
    <div className="form-group">
      <select
        className="form-select"
        style={{ lineHeight: 1 }}
        onChange={e => setImageData({ selectWindow: e.target.value })}
      >
        <option value="">--select screen--</option>
        {data.windowList.map(window => (
          <option key={window.id} value={window.id}>
            {window.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectBox;

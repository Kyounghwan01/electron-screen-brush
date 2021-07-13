const SelectBox = ({ list = [], setter }) => {
  return (
    <div className="form-group">
      <select className="form-select" onChange={e => setter(e.target.value)}>
        <option value="">--select screen--</option>
        {list.map(window => (
          <option key={window.id} value={window.id}>
            {window.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectBox;

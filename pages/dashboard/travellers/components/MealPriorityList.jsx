import Select from 'react-select';
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';
import { BsTrash3 } from 'react-icons/bs';

const MealPriorityList = ({ label, options, value, onChange }) => {
  const handleAdd = (option) => {
    if (option && value.length < 3 && !value.find((v) => v.value === option.value)) {
      onChange([...value, option]);
    }
  };

  const handleRemove = (index) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const moveUp = (index) => {
    if (index > 0) {
      const newValue = [...value];
      const temp = newValue[index];
      newValue[index] = newValue[index - 1];
      newValue[index - 1] = temp;
      onChange(newValue);
    }
  };

  const moveDown = (index) => {
    if (index < value.length - 1) {
      const newValue = [...value];
      const temp = newValue[index];
      newValue[index] = newValue[index + 1];
      newValue[index + 1] = temp;
      onChange(newValue);
    }
  };

  return (
    <div className="meal-priority-list">
      <label className="text-15 text-light-1 mb-10 d-block">{label}</label>
      <Select
        options={options.filter((opt) => !value.find((v) => v.value === opt.value))}
        onChange={handleAdd}
        placeholder="Search and select to add..."
        isClearable
        isDisabled={value.length >= 3}
        value={null} // Keep it clear to adding items
      />
      <div className="mt-2 text-13 text-light-1">
        {value.length} of 3 selected
      </div>
      <ul className="mt-10 list-group">
        {value.map((item, index) => (
          <li
            key={item.value}
            className="list-group-item d-flex justify-content-between align-items-center p-2"
            style={{ backgroundColor: '#f8f9fa' }}
          >
            <div className="d-flex align-items-center">
              <span className="fw-600 mr-10" style={{ width: '20px' }}>
                {index + 1}.
              </span>
              <span className="text-14">{item.label}</span>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary p-1"
                onClick={() => moveUp(index)}
                disabled={index === 0}
                title="Move Up"
              >
                <AiOutlineArrowUp size={14} />
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary p-1"
                onClick={() => moveDown(index)}
                disabled={index === value.length - 1}
                title="Move Down"
              >
                <AiOutlineArrowDown size={14} />
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger p-1"
                onClick={() => handleRemove(index)}
                title="Remove"
              >
                <BsTrash3 size={14} />
              </button>
            </div>
          </li>
        ))}
        {value.length === 0 && (
          <li className="list-group-item text-center text-light-1 p-2 text-14">
            No preferences added yet.
          </li>
        )}
      </ul>
    </div>
  );
};

export default MealPriorityList;

import React, { useEffect, useState } from "react";
import Select from 'react-select';

const Counter = ({ name, defaultValue, onCounterChange }) => {
  const [count, setCount] = useState(defaultValue);
  const incrementCount = () => {
    setCount(count + 1);
    onCounterChange(name, count + 1, +1);
  };
  const decrementCount = () => {
    if (count > 0) {
      setCount(count - 1);
      onCounterChange(name, count - 1, -1);
    }
  };

  return (
    <>
      <div className="row y-gap-10 justify-between items-center">
        <div className="col-auto">
          <div className="text-15 lh-12 fw-500">{name}</div>
          {name === "Children" && (
            <div className="text-14 lh-12 text-light-1 mt-5">Ages 0 - 11</div>
          )}
        </div>
        {/* End .col-auto */}
        <div className="col-auto">
          <div className="d-flex items-center js-counter">
            <button
              className="button -outline-blue-1 text-blue-1 size-38 rounded-4 js-down"
              onClick={decrementCount}
            >
              <i className="icon-minus text-12" />
            </button>
            {/* decrement button */}
            <div className="flex-center size-20 ml-15 mr-15">
              <div className="text-15 js-count">{count}</div>
            </div>
            {/* counter text  */}
            <button
              className="button -outline-blue-1 text-blue-1 size-38 rounded-4 js-up"
              onClick={incrementCount}
            >
              <i className="icon-plus text-12" />
            </button>
            {/* increment button */}
          </div>
        </div>
        {/* End .col-auto */}
      </div>
      {/* End .row */}
      <div className="border-top-light mt-24 mb-24" />
    </>
  );
};

const Room = ({setRoomsData, index=0}) => {
  const childAge = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const [guests, setGuests] = useState({'Adults': 1, 'Children': 0});
  const [childAges, setChildAges] = useState([]);

  const handleCounterChange = (name, value, dir) => {
    setGuests((prevState) => ({ ...prevState, [name]: value }));
    if (name == 'Children') {
      if (dir > 0) {
        setChildAges(prev => [...prev, 0]);
      } else {
        setChildAges(prev => prev.length ? prev.splice(-1) : prev);
      }
    }
  };

  useEffect(() => {
    setRoomsData(prev => {
      prev[index] = {adults: guests.Adults, child: childAges};
      return [...prev];
    });
  }, [guests, childAges]);

  return (
    <div key={index}>
      {Object.entries(guests).map(([key, value]) => (
        <Counter
          key={key}
          name={key}
          defaultValue={value}
          onCounterChange={handleCounterChange}
        />
      ))}
      {console.log('Child Ages', childAges)}
      {childAges.map((age, idx) => {
        <div>
          <label className='text-15 lh-12 fw-500 mt-10'>
            Child {idx + 1}'s Age
          </label>
          <Select
            options={childAge.map((el) => ({ value: el, label: el }))}
            onChange={(id) =>
              setChildAges((prev) => {
                prev[idx] = +(id?.value);
                return [...prev];
              })
            }
            value={{ value: age, label: age }}
          />
        </div>
      })}
    </div>
  );
}

export default Room;
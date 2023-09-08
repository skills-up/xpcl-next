import React from 'react';
// import Select from 'react-select';

const Counter = ({ name, defaultValue, onCounterChange, range = [0] }) => {
  const incrementCount = () => {
    if (range?.length < 2 || defaultValue < range[1]) {
      onCounterChange(name, defaultValue + 1, +1);
    }
  };
  const decrementCount = () => {
    if (range?.length < 1 || defaultValue > range[0]) {
      onCounterChange(name, defaultValue - 1, -1);
    }
  };

  return (
    <>
      <div className='row y-gap-10 justify-between items-center'>
        <div className='col-auto'>
          <div className='text-15 lh-12 fw-500'>{name}
          {name === 'Children' && (
            <span className='text-14 lh-12 text-light-1 pl-5'>(Ages 0 - 11)</span>
          )}
          </div>
        </div>
        {/* End .col-auto */}
        <div className='col-auto'>
          <div className='d-flex items-center js-counter'>
            <button
              className='button -outline-blue-1 text-blue-1 size-20 rounded-4 js-down'
              onClick={decrementCount}
            >
              <i className='icon-minus text-12' />
            </button>
            {/* decrement button */}
            <div className='flex-center size-20 ml-15 mr-15'>
              <div className='text-15 js-count'>{defaultValue}</div>
            </div>
            {/* counter text  */}
            <button
              className='button -outline-blue-1 text-blue-1 size-20 rounded-4 js-up'
              onClick={incrementCount}
            >
              <i className='icon-plus text-12' />
            </button>
            {/* increment button */}
          </div>
        </div>
        {/* End .col-auto */}
      </div>
      {/* End .row */}
      <div className='border-top-light mt-10 mb-10' />
    </>
  );
};

const Room = ({ roomsData, setRoomsData, index = 0 }) => {
  const handleCounterChange = (name, value, dir) => {
    setRoomsData((prev) => {
      if (name === 'Children') {
        if (dir > 0) {
          prev[index]?.child?.push(0);
        } else {
          prev[index]?.child?.pop();
        }
      } else {
        prev[index].adults = value;
      }
      return [...prev];
    });
  };

  return (
    <div key={index}>
      {Object.entries(roomsData).map(([key, value]) => (
        <Counter
          key={key}
          name={key === 'child' ? 'Children' : key === 'adults' ? 'Adults' : key}
          defaultValue={key === 'adults' ? value : value?.length}
          onCounterChange={handleCounterChange}
          range={[0, 5]}
        />
      ))}
      {roomsData?.child?.map((age, idx) => {
        return (
          <>
          {/* <div key={idx} className='row y-gap-10 justify-between items-center'>
            <div className="col-auto">
              <label className='text-15 lh-12 fw-500 mt-10'>Child {idx + 1}'s Age</label>
            </div>
            <div className="col-auto">
              <Select
                options={childAge.map((el) => ({ value: el, label: el }))}
                onChange={(id) =>
                  setRoomsData((prev) => {
                    if (prev[index]?.child) prev[index].child[idx] = +id?.value;
                    return [...prev];
                  })
                }
                value={{ value: age, label: age }}
              />
            </div>
          </div> */}
          <Counter
            key={idx}
            name={`Child ${idx+1}'s Age`}
            defaultValue={age}
            range={[0, 11]}
            onCounterChange={(_, value) => {
              setRoomsData((prev) => {
                if (prev[index]?.child) prev[index].child[idx] = value;
                return [...prev];
              })
            }}
          />
          </>
        );
      })}
    </div>
  );
};

export default Room;

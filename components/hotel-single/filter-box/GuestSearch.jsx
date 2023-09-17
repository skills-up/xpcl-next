import React, { useState } from 'react';
import { sendToast } from '../../../utils/toastify';
import Select from 'react-select';

const counters = [
  { name: 'Adults', defaultValue: 2 },
  { name: 'Children', defaultValue: 1 },
  { name: 'Rooms', defaultValue: 1 },
];

const Counter = ({ name, defaultValue, onCounterChange }) => {
  const [count, setCount] = useState(defaultValue);
  const incrementCount = () => {
    setCount(count + 1);
    onCounterChange(name, count + 1);
  };
  const decrementCount = () => {
    if (count > 0) {
      setCount(count - 1);
      onCounterChange(name, count - 1);
    }
  };
  return (
    <>
      <div className='row y-gap-10 justify-between items-center'>
        <div className='col-auto'>
          <div className='text-15 lh-12 fw-500'>{name}</div>
          {name === 'Children' && (
            <div className='text-14 lh-12 text-light-1 mt-5'>Ages 0 - 17</div>
          )}
        </div>
        {/* End .col-auto */}
        <div className='col-auto'>
          <div className='d-flex items-center js-counter'>
            <button
              className='button -outline-blue-1 text-blue-1 size-38 rounded-4 js-down'
              onClick={decrementCount}
            >
              <i className='icon-minus text-12' />
            </button>
            {/* decrement button */}
            <div className='flex-center size-20 ml-15 mr-15'>
              <div className='text-15 js-count'>{count}</div>
            </div>
            {/* counter text  */}
            <button
              className='button -outline-blue-1 text-blue-1 size-38 rounded-4 js-up'
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
      <div className='border-top-light mt-24 mb-24' />
    </>
  );
};

const GuestSearch = ({ room }) => {
  let [rooms, setRooms] = room;
  rooms = [...rooms];
  const [guestCounts, setGuestCounts] = useState({
    Adults: 2,
    Children: 1,
    Rooms: 1,
  });
  const handleCounterChange = (name, value) => {
    setGuestCounts((prevState) => ({ ...prevState, [name]: value }));
  };
  const childAge = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  return (
    <>
      {rooms.map((room, index) => {
        return (
          <div className='row items-center pl-20 mb-10'>
            <div className='col-lg-11 searchMenu-guests px-20 py-10 border-light rounded-4 js-form-dd js-form-counters'>
              <div
                data-bs-toggle='dropdown'
                data-bs-auto-close='outside'
                aria-expanded='false'
                data-bs-offset='0,22'
              >
                <h4 className='text-15 fw-500 ls-2 lh-16'>Room {index + 1}</h4>
                <div className='text-15 text-light-1 ls-2 lh-16'>
                  <span className='js-count-adult'>{room.adult}</span> adults -{' '}
                  <span className='js-count-child'>{room.child.length}</span> children
                </div>
              </div>
              {/* End guest */}

              {/* Dropdown */}
              <div className='shadow-2 dropdown-menu min-width-400'>
                <div className='bg-white px-30 py-30 rounded-4 counter-box'>
                  <div className='row y-gap-10 justify-between items-center'>
                    {/* Adults */}
                    <div className='col-auto'>
                      <div className='text-15 lh-12 fw-500'>Adults</div>
                    </div>
                    <div className='col-auto'>
                      <div className='d-flex items-center js-counter'>
                        <button
                          className='button -outline-blue-1 text-blue-1 size-38 rounded-4 js-down'
                          onClick={() =>
                            setRooms((prev) => {
                              if (prev[index].adult > 0) prev[index].adult -= 1;
                              return [...prev];
                            })
                          }
                        >
                          <i className='icon-minus text-12' />
                        </button>
                        {/* decrement button */}
                        <div className='flex-center size-20 ml-15 mr-15'>
                          <div className='text-17 js-count'>{room.adult}</div>
                        </div>
                        {/* counter text  */}
                        <button
                          className='button -outline-blue-1 text-blue-1 size-38 rounded-4 js-up'
                          onClick={() =>
                            setRooms((prev) => {
                              if (prev[index].adult + prev[index].child.length >= 5)
                                sendToast(
                                  'error',
                                  'Each room can have a maximum of 5 travellers',
                                  4000
                                );
                              else prev[index].adult += 1;
                              return [...prev];
                            })
                          }
                        >
                          <i className='icon-plus text-12' />
                        </button>
                        {/* increment button */}
                      </div>
                    </div>
                    {/* End .col-auto */}
                  </div>
                  {/* End .row */}
                  <div className='border-top-light mt-24 mb-24' />
                  {/* Children */}
                  <div className='row y-gap-10 justify-between items-center'>
                    <div className='col-auto'>
                      <div className='text-17 lh-12 fw-500'>Children</div>
                      <div className='text-14 lh-12 text-light-1 mt-5'>Ages 0 - 11</div>
                    </div>
                    {/* End .col-auto */}
                    <div className='col-auto'>
                      <div className='d-flex items-center js-counter'>
                        <button
                          className='button -outline-blue-1 text-blue-1 size-38 rounded-4 js-down'
                          onClick={() =>
                            setRooms((prev) => {
                              if (prev[index].child.length > 0) prev[index].child.pop();
                              return [...prev];
                            })
                          }
                        >
                          <i className='icon-minus text-12' />
                        </button>
                        {/* decrement button */}
                        <div className='flex-center size-20 ml-15 mr-15'>
                          <div className='text-15 js-count'>{room.child.length}</div>
                        </div>
                        {/* counter text  */}
                        <button
                          className='button -outline-blue-1 text-blue-1 size-38 rounded-4 js-up'
                          onClick={() =>
                            setRooms((prev) => {
                              if (prev[index].adult + prev[index].child.length >= 5)
                                sendToast(
                                  'error',
                                  'Each room can have a maximum of 5 travellers',
                                  4000
                                );
                              else prev[index].child.push(0);
                              return [...prev];
                            })
                          }
                        >
                          <i className='icon-plus text-12' />
                        </button>
                        {/* increment button */}
                      </div>
                    </div>
                    {/* End .col-auto */}
                  </div>
                  {room.child.map((child, childInd) => (
                    <>
                      <label className='text-15 lh-12 fw-500 mt-10'>
                        Child {childInd + 1}'s Age
                      </label>
                      <Select
                        options={childAge.map((el) => ({ value: el, label: el }))}
                        onChange={(id) =>
                          setRooms((prev) => {
                            if (id?.value) prev[index].child[childInd] = +id.value;
                            return [...prev];
                          })
                        }
                        value={{ value: child, label: child }}
                      />
                    </>
                  ))}
                </div>
              </div>
            </div>
            <div className='col-lg-1 lg:px-15 m-0 d-flex gap-1'>
              {index < 8 && (
                <button
                  className='button -outline-blue-1 text-blue-1 size-38 rounded-4 js-up'
                  onClick={() =>
                    setRooms((prev) => {
                      prev.length < 9
                        ? prev.push({ adult: 0, child: [] })
                        : sendToast('error', 'Maximum 9 rooms are allowed', 4000);
                      return [...prev];
                    })
                  }
                >
                  <i className='icon-plus text-15' />
                </button>
              )}
              {index > 0 && (
                <button
                  className='button -outline-blue-1 text-blue-1 size-38 rounded-4 js-up'
                  onClick={() =>
                    setRooms((prev) => {
                      prev.splice(index, 1);
                      return [...prev];
                    })
                  }
                >
                  <i className='icon-minus text-12' />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};
export default GuestSearch;

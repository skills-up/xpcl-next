import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { store } from '../../../app/store';
import { setTravellerDOBS } from '../../../features/flightSearch/flightSearchSlice';
import Pluralize from '../../../utils/pluralChecker';
import { FaUserTie } from 'react-icons/fa';

const counters = [
  { name: 'Adults', defaultValue: 1 },
  { name: 'Children', defaultValue: 0 },
  { name: 'Infants', defaultValue: 0 },
];

const cabinOptions = ['Economy', 'Premium Economy', 'Business', 'First'];

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
            <div className='text-14 lh-12 text-light-1 mt-5'>Ages 2 - 11</div>
          )}

          {name === 'Infants' && (
            <div className='text-14 lh-12 text-light-1 mt-5'>Ages 0 - 1</div>
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

const GuestSearch = ({ guests, cabins }) => {
  console.log('cabin', cabins);
  const [guestCounts, setGuestCounts] = guests;
  const [preferredCabin, setPrefferedCabin] = cabins;
  const handleCounterChange = (name, value) => {
    setGuestCounts((prevState) => ({ ...prevState, [name]: value }));
  };
  return (
    <div className='searchMenu-guests px-20 lg:px-0 js-form-dd bg-white position-relative'>
      <div
        data-bs-toggle='dropdown'
        data-bs-auto-close='outside'
        aria-expanded='false'
        data-bs-offset='0,22'
      >
        {/* <h4 className='text-15 fw-500 ls-2 lh-16'>Travellers</h4> */}
        <div className='text-18 d-flex gap-2 items-center cursor-pointer'>
          {/* Adult */}
          {/* <FaUserTie className='text-25' /> */}
          <span className='js-count-adult'>
            {guestCounts.Adults} {Pluralize('Adult', 'Adults', guestCounts.Adults)}
            {/* Children */}
            {guestCounts.Children > 0 && (
              <>
                , {guestCounts.Children}{' '}
                {Pluralize(' Child', 'Children', guestCounts.Children)}
              </>
            )}
            {/* Infants */}
            {guestCounts.Infants > 0 && (
              <>
                , {guestCounts.Infants}{' '}
                {Pluralize(' Infant', 'Infants', guestCounts.Infants)}
              </>
            )}
            <>, {preferredCabin?.value}</>
          </span>
          <i className='icon icon-chevron-sm-down text-7' />
        </div>
      </div>
      {/* End guest */}

      <div className='shadow-2 dropdown-menu min-width-450'>
        <div
          className='bg-white px-30 py-30 rounded-4 counter-box'
          style={{ zIndex: '6' }}
        >
          {counters.map((counter) => (
            <Counter
              key={counter.name}
              name={counter.name}
              defaultValue={counter.defaultValue}
              onCounterChange={handleCounterChange}
            />
          ))}
          <div className='row y-gap-20'>
            {cabinOptions.map((opt, optIn) => (
              <div
                className={`button -blue-1 bg-blue-1-05 mb-1 mx-1 col-auto text-blue-1 py-5 px-20 rounded-100  cursor-pointer ${
                  preferredCabin?.value === opt ? 'active' : ''
                }`}
                onClick={() => setPrefferedCabin({ value: opt })}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default GuestSearch;

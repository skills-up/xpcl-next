import { useDispatch, useSelector } from 'react-redux';
import { setAirlines } from '../../../features/flightSearch/flightSearchSlice';
import { useState } from 'react';

const Airlines = () => {
  const dispatch = useDispatch();
  const airlines = useSelector((state) => state.flightSearch.value.airlines);
  const [checkAll, setCheckAll] = useState(false);

  return (
    <>
      <a
        className='text-14 text-blue-1 fw-500 underline'
        onClick={() => {
          let temp = {};
          for (let [key, value] of Object.entries(airlines)) {
            temp[key] = { ...value, value: checkAll };
          }
          dispatch(setAirlines(temp));
          setCheckAll((prev) => !prev);
        }}
      >
        {checkAll ? 'Check' : 'Uncheck'} All
      </a>
      {airlines &&
        Object.entries(airlines).map(([key, value], index) => (
          <div className='row y-gap-10 items-center justify-between'>
            <div className='col-auto'>
              <div className='form-checkbox d-flex items-center'>
                <input
                  type='checkbox'
                  name='name'
                  checked={value.value}
                  onClick={() =>
                    dispatch(
                      setAirlines({
                        ...airlines,
                        [key]: {
                          number: value.number,
                          value: !value.value,
                          code: value.code,
                        },
                      })
                    )
                  }
                />
                <div className='form-checkbox__mark'>
                  <div className='form-checkbox__icon icon-check' />
                </div>
                <div className='text-15 ml-10'>{key}</div>
              </div>
            </div>
            <div className='col-auto'>
              <div className='text-15 text-light-1'>{value.number}</div>
            </div>
          </div>
        ))}
    </>
  );
};

export default Airlines;

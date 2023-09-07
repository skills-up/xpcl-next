import { useDispatch, useSelector } from 'react-redux';
import { setDepartTimes } from '../../../features/flightSearch/flightSearchSlice';
import { useState } from 'react';

const DepartTime = () => {
  const dispatch = useDispatch();
  const departTimes = useSelector((state) => state.flightSearch.value.departTimes);
  const [checkAll, setCheckAll] = useState(false);

  return (
    <>
      <a
        className='text-14 text-blue-1 fw-500 underline'
        onClick={() => {
          let temp = {};
          for (let [key, value] of Object.entries(departTimes)) {
            temp[key] = { ...value, value: checkAll };
          }
          dispatch(setDepartTimes(temp));
          setCheckAll((prev) => !prev);
        }}
      >
        {checkAll ? 'Check' : 'Uncheck'} All
      </a>
      {departTimes &&
        Object.entries(departTimes)
          .filter(([key, value]) => value.number > 0)
          .map(([key, value], index) => (
            <div className='row y-gap-10 items-center justify-between'>
              <div className='col-auto'>
                <div className='form-checkbox d-flex items-center'>
                  <input
                    type='checkbox'
                    name='name'
                    checked={value.value}
                    onClick={() =>
                      dispatch(
                        setDepartTimes({
                          ...departTimes,
                          [key]: {
                            times: value.times,
                            value: !value.value,
                            number: value.number,
                          },
                        })
                      )
                    }
                  />
                  <div className='form-checkbox__mark'>
                    <div className='form-checkbox__icon icon-check' />
                  </div>
                  <div className='text-15 ml-10'>
                    <span>
                      {key
                        .split('_')
                        .map(
                          (word) => `${word.charAt(0).toUpperCase() + word.slice(1)} `
                        )}
                    </span>
                    <small className='text-secondary'>({value.times})</small>
                  </div>
                </div>
              </div>
              <div className='col-auto'>
                <div className='text-15 text-light-1'>{value.number}</div>
              </div>
            </div>
          ))}
      {/* End .row */}
    </>
  );
};

export default DepartTime;

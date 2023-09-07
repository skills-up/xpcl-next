import { useDispatch, useSelector } from 'react-redux';
import { setCabins } from '../../../features/flightSearch/flightSearchSlice';
import { useState } from 'react';

const Cabin = () => {
  const dispatch = useDispatch();
  const cabins = useSelector((state) => state.flightSearch.value.cabins);
  const [checkAll, setCheckAll] = useState(false);

  return (
    <>
      <a
        className='text-14 text-blue-1 fw-500 underline'
        onClick={() => {
          let temp = {};
          for (let [key, value] of Object.entries(cabins)) {
            temp[key] = { ...value, value: checkAll };
          }
          dispatch(setCabins(temp));
          setCheckAll((prev) => !prev);
        }}
      >
        {checkAll ? 'Check' : 'Uncheck'} All
      </a>
      {cabins &&
        Object.entries(cabins).map(([key, value], index) => (
          <div className='row y-gap-10 items-center justify-between'>
            <div className='col-auto'>
              <div className='form-checkbox d-flex items-center'>
                <input
                  type='checkbox'
                  checked={value.value}
                  onChange={() =>
                    dispatch(
                      setCabins({
                        ...cabins,
                        [key]: { number: value.number, value: !value.value },
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

export default Cabin;

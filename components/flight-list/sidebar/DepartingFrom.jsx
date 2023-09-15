import { useDispatch, useSelector } from 'react-redux';
import { setDepartingFrom } from '../../../features/flightSearch/flightSearchSlice';
import { useState } from 'react';

const DepartingFrom = () => {
  const dispatch = useDispatch();
  const departingFrom = useSelector((state) => state.flightSearch.value.departingFrom);
  const [checkAll, setCheckAll] = useState(false);

  return (
    <>
      <a
        className='text-14 text-blue-1 fw-500 underline'
        onClick={() => {
          let temp = {};
          for (let [key, value] of Object.entries(departingFrom)) {
            temp[key] = { ...value, value: checkAll };
          }
          dispatch(setDepartingFrom(temp));
          setCheckAll((prev) => !prev);
        }}
      >
        {checkAll ? 'Check' : 'Uncheck'} All
      </a>
      {departingFrom &&
        Object.entries(departingFrom).map(([key, value], index) => (
          <div className='row y-gap-10 items-center justify-between'>
            <div className='col-auto -wmax-80'>
              <div className='form-checkbox d-flex items-center'>
                <input
                  type='checkbox'
                  name='name'
                  checked={value.value}
                  onChange={() =>
                    dispatch(
                      setDepartingFrom({
                        ...departingFrom,
                        [key]: {
                          number: value.number,
                          value: !value.value,
                          iata_code: value.iata_code,
                          city: value.city,
                        },
                      })
                    )
                  }
                />
                <div className='form-checkbox__mark'>
                  <div className='form-checkbox__icon icon-check' />
                </div>
                <div className='text-15 ml-10'>
                  {key} ({value.iata_code}), {value.city}
                </div>
              </div>
            </div>
            {/* End .col */}
            <div className='col-auto'>
              <div className='text-15 text-light-1'>{value.number}</div>
            </div>
          </div>
        ))}
      {/* End .row */}
    </>
  );
};

export default DepartingFrom;

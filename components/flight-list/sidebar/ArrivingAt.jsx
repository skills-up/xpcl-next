import { useDispatch, useSelector } from 'react-redux';
import { setArrivingAt } from '../../../features/flightSearch/flightSearchSlice';
import { useState } from 'react';

const ArrivingAt = () => {
  const dispatch = useDispatch();
  const arrivingAt = useSelector((state) => state.flightSearch.value.arrivingAt);
  const [checkAll, setCheckAll] = useState(false);

  return (
    <>
      <div className='row mb-3'>
        {checkAll && (
          <div className='col-12'>
            <button
              className='btn col-12 btn-outline-primary text-15'
              onClick={() => {
                let temp = {};
                for (let [key, value] of Object.entries(arrivingAt)) {
                  temp[key] = { ...value, value: true };
                }
                dispatch(setArrivingAt(temp));
                setCheckAll((prev) => !prev);
              }}
            >
              Check All
            </button>
          </div>
        )}
        {!checkAll && (
          <div className='col-12'>
            <button
              className='btn col-12 btn-outline-primary text-15'
              onClick={() => {
                let temp = {};
                for (let [key, value] of Object.entries(arrivingAt)) {
                  temp[key] = { ...value, value: false };
                }
                dispatch(setArrivingAt(temp));
                setCheckAll((prev) => !prev);
              }}
            >
              Uncheck All
            </button>
          </div>
        )}
      </div>
      {arrivingAt &&
        Object.entries(arrivingAt).map(([key, value], index) => (
          <div className='row y-gap-10 items-center justify-between'>
            <div className='col-auto'>
              <div className='form-checkbox d-flex items-center'>
                <input
                  type='checkbox'
                  name='name'
                  checked={value.value}
                  onChange={() =>
                    dispatch(
                      setArrivingAt({
                        ...arrivingAt,
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

export default ArrivingAt;

import { useDispatch, useSelector } from 'react-redux';
import { setDepartTimes } from '../../../features/flightSearch/flightSearchSlice';

const DepartTime = () => {
  const dispatch = useDispatch();
  const departTimes = useSelector((state) => state.flightSearch.value.departTimes);

  return (
    <>
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
                    {key
                      .split('_')
                      .map((word) => `${word.charAt(0).toUpperCase() + word.slice(1)} `)}
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

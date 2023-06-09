import { useDispatch, useSelector } from 'react-redux';
import { setStops } from '../../../features/flightSearch/flightSearchSlice';

const Stops = () => {
  const dispatch = useDispatch();
  const stops = useSelector((state) => state.flightSearch.value.stops);

  return (
    <>
      {stops &&
        Object.entries(stops).map(([key, value], index) => (
          <div className='row y-gap-10 items-center justify-between'>
            <div className='col-auto'>
              <div className='form-checkbox d-flex items-center'>
                <input
                  type='checkbox'
                  checked={value.value}
                  onChange={() => {
                    dispatch(
                      setStops({
                        ...stops,
                        [key]: { number: value.number, value: !value.value },
                      })
                    );
                  }}
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

export default Stops;

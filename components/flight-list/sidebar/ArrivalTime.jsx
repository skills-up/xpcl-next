import { useDispatch, useSelector } from 'react-redux';
import { setArriveTimes } from '../../../features/flightSearch/flightSearchSlice';

const ArrivalTime = () => {
  const dispatch = useDispatch();
  const arriveTimes = useSelector((state) => state.flightSearch.value.arriveTimes);

  return (
    <>
      <div className='row mb-3'>
        <div className='col-6'>
          <button
            className='btn col-12 btn-outline-primary text-15'
            onClick={() => {
              let temp = {};
              for (let [key, value] of Object.entries(arriveTimes)) {
                temp[key] = { ...value, value: true };
              }
              dispatch(setArriveTimes(temp));
            }}
          >
            Check All
          </button>
        </div>
        <div className='col-6'>
          <button
            className='btn col-12 btn-outline-primary text-15'
            onClick={() => {
              let temp = {};
              for (let [key, value] of Object.entries(arriveTimes)) {
                temp[key] = { ...value, value: false };
              }
              dispatch(setArriveTimes(temp));
            }}
          >
            Uncheck All
          </button>
        </div>
      </div>
      {arriveTimes &&
        Object.entries(arriveTimes)
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
                        setArriveTimes({
                          ...arriveTimes,
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

export default ArrivalTime;

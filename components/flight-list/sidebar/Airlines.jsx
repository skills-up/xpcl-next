import { useDispatch, useSelector } from 'react-redux';
import { setAirlines } from '../../../features/flightSearch/flightSearchSlice';

const Airlines = () => {
  const dispatch = useDispatch();
  const airlines = useSelector((state) => state.flightSearch.value.airlines);

  return (
    <>
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

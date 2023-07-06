import { useDispatch, useSelector } from 'react-redux';
import { setDepartingFrom } from '../../../features/flightSearch/flightSearchSlice';

const DepartingFrom = () => {
  const dispatch = useDispatch();
  const departingFrom = useSelector((state) => state.flightSearch.value.departingFrom);

  return (
    <>
      {departingFrom &&
        Object.entries(departingFrom).map(([key, value], index) => (
          <div className='row y-gap-10 items-center justify-between'>
            <div className='col-auto'>
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

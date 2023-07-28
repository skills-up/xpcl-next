import { useDispatch, useSelector } from 'react-redux';
import { setOptions } from '../../../features/hotelSearch/hotelSearchSlice';

const popularFilters = () => {
  const filters = useSelector((state) => state.hotelSearch.value.options);
  const dispatch = useDispatch();
  return (
    <>
      {filters &&
        Object.entries(filters).map(([key, value], index) => (
          <div key={index} className='row y-gap-10 items-center justify-between'>
            <div className='col-auto'>
              <div className='form-checkbox d-flex items-center'>
                <input
                  type='checkbox'
                  checked={value.value}
                  onClick={() =>
                    dispatch(
                      setOptions({
                        ...filters,
                        [key]: {
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
                  {key.split(' ').map((word) => (
                    <>{word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()} </>
                  ))}
                </div>
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

export default popularFilters;

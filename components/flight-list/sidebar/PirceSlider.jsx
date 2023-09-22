import InputRange from 'react-input-range';
import { useDispatch, useSelector } from 'react-redux';
import { setPrice } from '../../../features/flightSearch/flightSearchSlice';

const PirceSlider = () => {
  const dispatch = useDispatch();
  const price = useSelector((state) => state.flightSearch.value.price);

  const handleOnChange = (value) => {
    dispatch(setPrice({ maxPrice: price.maxPrice, value }));
  };

  return (
    <>
      {price && (
        <div className='js-price-rangeSlider'>
          <div className='text-14 fw-500'></div>

          <div className='d-flex justify-between mb-20'>
            <div className='text-15 text-dark-1'>
              <span className='js-lower mx-1'>
                {price.value.min.toLocaleString('en-AE', {
                  maximumFractionDigits: 2,
                  style: 'currency',
                  currency: 'AED',
                })}
              </span>
              -
              <span className='js-upper mx-1'>
                {price.value.max.toLocaleString('en-AE', {
                  maximumFractionDigits: 2,
                  style: 'currency',
                  currency: 'AED',
                })}
              </span>
            </div>
          </div>

          <div className='px-5'>
            <InputRange
              formatLabel={(value) => ``}
              minValue={0}
              maxValue={price.maxPrice}
              value={price.value}
              onChange={(value) => handleOnChange(value)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PirceSlider;

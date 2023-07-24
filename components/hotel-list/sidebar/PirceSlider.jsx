import InputRange from 'react-input-range';
import { useDispatch, useSelector } from 'react-redux';
import { setPrice } from '../../../features/hotelSearch/hotelSearchSlice';

const PirceSlider = () => {
  const dispatch = useDispatch();
  const price = useSelector((state) => state.hotelSearch.value.price);

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
                {price.value.min.toLocaleString('en-IN', {
                  maximumFractionDigits: 2,
                  style: 'currency',
                  currency: 'INR',
                })}
              </span>
              -
              <span className='js-upper mx-1'>
                {price.value.max.toLocaleString('en-IN', {
                  maximumFractionDigits: 2,
                  style: 'currency',
                  currency: 'INR',
                })}
              </span>
            </div>
          </div>

          <div className='px-5'>
            {console.log('Min Price', price.minPrice)}
            <InputRange
              formatLabel={(value) => ``}
              minValue={price.minPrice}
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

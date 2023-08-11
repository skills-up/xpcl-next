import { useEffect, useState } from 'react';
import InputRange from 'react-input-range';
import { useDispatch, useSelector } from 'react-redux';
import {
  setMaxRatings,
  setRatings,
} from '../../../features/hotelSearch/hotelSearchSlice';

const RatingsFilter = () => {
  const dispatch = useDispatch();
  let [ratingOptions, setRatingOptions] = useState([1, 2, 3, 4, 5]);
  const ratingParams = useSelector((state) => state.hotelSearch.value.ratingParams);
  const maxRatings = useSelector((state) => state.hotelSearch.value.maxRatings);
  const ratings = useSelector((state) => state.hotelSearch.value.ratings);
  useEffect(() => {
    if (ratingParams.length > 0) {
      console.log('ratings', ratingParams);
      let dat = ratingParams.map((el) => +el.value).sort();
      setRatingOptions(dat);
      dispatch(setRatings(dat[0]));
      dispatch(setMaxRatings(dat.at(-1)));
    }
  }, []);

  return (
    <>
      <div className='text-15 text-dark-1'>
        <span className='js-lower mx-1'>
          {ratings} - {maxRatings}
        </span>
      </div>
      <div className='px-5'>
        <InputRange
          formatLabel={(value) => ``}
          minValue={ratingOptions[0]}
          maxValue={ratingOptions.at(-1)}
          value={{ min: ratings, max: maxRatings }}
          onChange={(value) => {
            dispatch(setRatings(value.min));
            dispatch(setMaxRatings(value.max));
            console.log('value', value);
          }}
        />
      </div>
      <div className='text-15 text-blue-1 justify-between d-flex'>
        <span className='fw-500'>{ratingOptions[0]}</span> -{' '}
        <span className='fw-500'>{ratingOptions.at(-1)}</span>
      </div>
    </>
  );
};

export default RatingsFilter;

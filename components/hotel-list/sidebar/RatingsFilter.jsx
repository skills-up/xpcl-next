import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setRatings } from '../../../features/hotelSearch/hotelSearchSlice';

const RatingsFilter = () => {
  const ratingOptions = [1, 2, 3, 4, 5];
  const [activeRating, setActiveRating] = useState(null);

  const ratings = useSelector((state) => state.hotelSearch.value.ratings);
  const dispatch = useDispatch();

  const handleRatingClick = (rating) => {
    dispatch(setRatings(rating));
  };

  return (
    <>
      {ratingOptions.map((rating) => (
        <div className='col-auto' key={rating}>
          <button
            className={`button -blue-1 bg-blue-1-05 text-blue-1 py-5 px-20 rounded-100 ${
              rating === ratings ? 'active' : ''
            }`}
            onClick={() => handleRatingClick(rating)}
          >
            {rating}
          </button>
        </div>
      ))}
    </>
  );
};

export default RatingsFilter;

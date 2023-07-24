import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setMaxRatings } from '../../../features/hotelSearch/hotelSearchSlice';

const RatingsFilter = () => {
  const ratingOptions = [1, 2, 3, 4, 5];
  const [activeRating, setActiveRating] = useState(null);

  const ratings = useSelector((state) => state.hotelSearch.value.ratings);
  const maxRatings = useSelector((state) => state.hotelSearch.value.maxRatings);
  const dispatch = useDispatch();

  const handleRatingClick = (rating) => {
    if (rating >= ratings) dispatch(setMaxRatings(rating));
  };

  return (
    <>
      {ratingOptions.map((rating) => (
        <div className='col-auto' key={rating}>
          <button
            disabled={rating < ratings}
            className={`button -blue-1 bg-blue-1-05 text-blue-1 py-5 px-20 rounded-100 ${
              rating === maxRatings ? 'active' : ''
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

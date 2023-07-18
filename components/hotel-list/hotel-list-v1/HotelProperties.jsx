import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hotelsData } from '../../../data/hotels';
import { setPaginateTotalDataSize } from '../../../features/hotelSearch/hotelSearchSlice';
import HotelProperty from '../common/HotelProperty';

const HotelProperties = () => {
  const paginateDataNumber = useSelector(
    (state) => state.hotelSearch.value.paginateDataNumber
  );
  const paginateDataPerPage = useSelector(
    (state) => state.hotelSearch.value.paginateDataPerPage
  );
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    dispatch(setPaginateTotalDataSize({ paginateTotalDataSize: hotelsData.length }));
  }, []);

  return (
    <>
      {hotelsData.map((element, index) => {
        // 1 Get lower bound
        let lowerBound;
        let mod = paginateDataNumber % paginateDataPerPage;
        if (mod === 0) {
          lowerBound = paginateDataNumber - (paginateDataPerPage - 1);
        } else {
          lowerBound = paginateDataNumber - (mod - 1);
        }
        // 2 Return index between lower and upper
        if (index + 1 >= lowerBound && index + 1 <= paginateDataNumber)
          return <HotelProperty key={index} item={element} />;
      })}
    </>
  );
};

export default HotelProperties;

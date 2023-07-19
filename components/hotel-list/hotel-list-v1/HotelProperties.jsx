import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { customAPICall } from '../../../api/xplorzApi';
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
  const sort = useSelector((state) => state.hotelSearch.value.sort);

  const [manip, setManip] = useState([]);
  const searchData = useSelector((state) => state.hotelSearch.value.searchData);

  useEffect(() => {
    console.log('SearchData', searchData);
    if (searchData?.searchResult?.his) setManip(searchData.searchResult?.his);
  }, [searchData]);

  useEffect(() => {
    if (manip)
      dispatch(setPaginateTotalDataSize({ paginateTotalDataSize: manip.length }));
  }, [manip, sort]);

  return (
    <>
      {manip &&
        manip.length > 0 &&
        manip
          .filter((el) => el)
          .sort((a, b) => {
            if (sort.price) {
              return sort._
                ? +a?.ops[0]?.tp - +b?.ops[0]?.tp
                : +b?.ops[0]?.tp - +a?.ops[0]?.tp;
            } else if (sort.rating) {
              return sort._ ? +a.rt - +b.rt : +b.rt - +a.rt;
            }
          })
          .map((element, index) => {
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

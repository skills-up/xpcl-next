import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setOptions,
  setPaginateTotalDataSize,
  setPrice,
} from '../../../features/hotelSearch/hotelSearchSlice';
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
  const price = useSelector((state) => state.hotelSearch.value.price);
  const ratings = useSelector((state) => state.hotelSearch.value.ratings);
  const maxRatings = useSelector((state) => state.hotelSearch.value.maxRatings);
  const options = useSelector((state) => state.hotelSearch.value.options);
  const searchQuery = useSelector((state) => state.hotelSearch.value.searchQuery.toLowerCase());

  const [manip, setManip] = useState([]);
  const searchData = useSelector((state) => state.hotelSearch.value.searchData);

  useEffect(() => {
    if (searchData?.searchResult?.his) {
      let maxPrice = 0;
      let options = {};
      let minPrice = 0;
      for (let data of searchData.searchResult?.his) {
        // Options
        for (let pop of data.pops)
          options[pop.fc] ? (options[pop.fc] += 1) : (options[pop.fc] = 1);
        // Max Price
        if (data.ops[0].tp > maxPrice) {
          maxPrice = data.ops[0].tp;
        }
        // Min Price
        if (minPrice === 0 || data.ops[0].tp < minPrice) minPrice = data.ops[0].tp;
      }
      // Options Manip
      for (let [key, value] of Object.entries(options))
        options[key] = { number: value, value: true };
      // Price
      dispatch(
        setPrice({
          value: { min: minPrice, max: maxPrice + 1 },
          minPrice,
          maxPrice: maxPrice + 1,
        })
      );
      dispatch(setOptions(options));
      // Setting Search Data
      setManip(searchData.searchResult?.his);
    }
  }, [searchData]);

  useEffect(() => {
    if (manip)
      dispatch(
        setPaginateTotalDataSize({
          paginateTotalDataSize: manip.filter((el) => {
            let stat = filter(el);
            return stat;
          }).length,
        })
      );
  }, [manip, sort, options, ratings, maxRatings, price, searchQuery]);

  const filter = (el) => {
    // Filters

    // Filter by search query
    if (searchQuery.length && !el.name.toLowerCase().includes(searchQuery) && !el.ad?.adr?.toLowerCase().includes(searchQuery)) {
      return false;
    }
    // Filter By Price Slider
    if (!(el.ops[0].tp >= price.value.min && el.ops[0].tp <= price.value.max))
      return false;
    // Filter By Ratings
    if (el.rt < ratings || el.rt > maxRatings) return false;
    // Filter By Options
    let hasOption = false;
    for (let [key, value] of Object.entries(options)) {
      for (let pop of el.pops) {
        if (pop.fc[0] === key && value.value) hasOption = true;
      }
    }
    if (!hasOption) return false;
    return true;
  };

  return (
    <div id='hotel-properties'>
      {manip &&
        manip.length > 0 &&
        manip
          .filter((el) => {
            let stat = filter(el);
            return stat;
          })
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
    </div>
  );
};

export default HotelProperties;

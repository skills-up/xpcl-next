import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setAirlines,
  setArriveTimes,
  setArrivingAt,
  setCabins,
  setDepartingFrom,
  setDepartTimes,
  setPaginateTotalDataSize,
  setPrice,
  setSelectedBookings,
  setStops,
} from '../../../features/flightSearch/flightSearchSlice';
import { BsArrowRight } from 'react-icons/bs';
import FlightProperty from '../common/FlightProperty';

const FlightProperties = () => {
  const searchData = useSelector((state) => state.flightSearch.value.searchData);
  const [manip, setManip] = useState([]);
  const [currentTab, setCurrentTab] = useState('to');
  const airports = useSelector((state) => state.apis.value.airports);
  const travellerDOBS = useSelector((state) => state.flightSearch.value.travellerDOBS);
  const airlineOrgs = useSelector((state) => state.flightSearch.value.airlineOrgs);
  const [toCount, setToCount] = useState(0);
  const [fromCount, setFromCount] = useState(0);
  const [combinedCount, setCombinedCount] = useState(0);

  const stops = useSelector((state) => state.flightSearch.value.stops);
  const cabins = useSelector((state) => state.flightSearch.value.cabins);
  const airlines = useSelector((state) => state.flightSearch.value.airlines);
  const departTimes = useSelector((state) => state.flightSearch.value.departTimes);
  const arriveTimes = useSelector((state) => state.flightSearch.value.arriveTimes);
  const price = useSelector((state) => state.flightSearch.value.price);
  const departingFrom = useSelector((state) => state.flightSearch.value.departingFrom);
  const arrivingAt = useSelector((state) => state.flightSearch.value.arrivingAt);
  const sort = useSelector((state) => state.flightSearch.value.sort);
  const selectedBookings = useSelector(
    (state) => state.flightSearch.value.selectedBookings
  );

  const paginateDataNumber = useSelector(
    (state) => state.flightSearch.value.paginateDataNumber
  );
  const paginateDataPerPage = useSelector(
    (state) => state.flightSearch.value.paginateDataPerPage
  );
  const destinations = useSelector((state) => state.flightSearch.value.destinations);
  const dispatch = useDispatch();

  // Manipulating Data
  useEffect(() => {
    if (searchData && airlineOrgs) {
      let temp = [];
      let counter = 1;
      let toCount = 0;
      let fromCount = 0;
      let combinedCount = 0;
      let stops = {};
      let cabins = {};
      let airlines = {};
      let maxPrice = 0;
      let departingFrom = {};
      let arrivingAt = {};
      let departTimes = {
        early_morning: { times: '04:00 - 08:00', value: true, number: 0 },
        morning: { times: '08:00 - 12:00', value: true, number: 0 },
        afternoon: { times: '12:00 - 16:00', value: true, number: 0 },
        evening: { times: '16:00 - 20:00', value: true, number: 0 },
        night: { times: '20:00 - 24:00', value: true, number: 0 },
        late_night: { times: '00:00 - 04:00', value: true, number: 0 },
      };
      let arriveTimes = {
        early_morning: { times: '04:00 - 08:00', value: true, number: 0 },
        morning: { times: '08:00 - 12:00', value: true, number: 0 },
        afternoon: { times: '12:00 - 16:00', value: true, number: 0 },
        evening: { times: '16:00 - 20:00', value: true, number: 0 },
        night: { times: '20:00 - 24:00', value: true, number: 0 },
        late_night: { times: '00:00 - 04:00', value: true, number: 0 },
      };
      // Iterating over providers
      for (let [key, value] of Object.entries(searchData)) {
        // If provider was found
        if (value) {
          // Iterating over to, from and combined
          for (let [secondKey, secondValue] of Object.entries(value)) {
            if (secondValue && secondValue?.length > 0) {
              for (let val of secondValue) {
                // Pricing
                let total = 0;
                let infantPrice = 0;
                let childPrice = 0;
                let adultPrice = 0;
                if (key === 'aa') {
                  infantPrice = val.prices.prices?.CHD?.fare * travellerDOBS.INF;
                  childPrice = val.prices.prices?.CHD?.fare * travellerDOBS.CHD;
                  adultPrice = val.prices.prices?.ADT?.fare * travellerDOBS.ADT;
                  total =
                    (infantPrice > 0 ? infantPrice : 0) +
                    (childPrice > 0 ? adultPrice : 0) +
                    (adultPrice > 0 ? adultPrice : 0);
                } else if (key === 'tj') {
                  infantPrice = val.prices.prices?.INFANT?.fare * travellerDOBS.INF;
                  childPrice = val.prices.prices?.CHILD?.fare * travellerDOBS.CHD;
                  adultPrice = val.prices.prices?.ADULT?.fare * travellerDOBS.ADT;
                  total =
                    (infantPrice > 0 ? infantPrice : 0) +
                    (childPrice > 0 ? adultPrice : 0) +
                    (adultPrice > 0 ? adultPrice : 0);
                }
                // Overall Duration + Day Difference
                let totalDuration =
                  (new Date(val.segments.at(-1).arrival.time).getTime() -
                    new Date(val.segments[0].departure.time).getTime()) /
                  60000;

                let departureDay = new Date(val.segments[0].departure.time.slice(0, 10));
                let arrivalDay = new Date(val.segments.at(-1).arrival.time.slice(0, 10));
                let overallDayDifference = Math.floor(
                  (Date.UTC(
                    arrivalDay.getFullYear(),
                    arrivalDay.getMonth(),
                    arrivalDay.getDate()
                  ) -
                    Date.UTC(
                      departureDay.getFullYear(),
                      departureDay.getMonth(),
                      departureDay.getDate()
                    )) /
                    (1000 * 60 * 60 * 24)
                );
                // Setting from and combined count
                if (secondKey === 'to') toCount += 1;
                if (secondKey === 'from') fromCount += 1;
                if (secondKey === 'combined') combinedCount += 1;
                /* Sorting */
                // Stops
                if (val.segments.length > 1) {
                  if (val.segments.length > 2)
                    stops[`${val.segments.length - 1} Stops`]
                      ? (stops[`${val.segments.length - 1} Stops`] += 1)
                      : (stops[`${val.segments.length - 1} Stops`] = 1);
                  else stops['1 Stop'] ? (stops['1 Stop'] += 1) : (stops['1 Stop'] = 1);
                } else {
                  stops['Nonstop'] ? (stops['Nonstop'] += 1) : (stops['Nonstop'] = 1);
                }
                // Cabin
                if (key === 'aa') {
                  if (val.prices.prices.ADT.cabinClass === 'EC')
                    cabins['Economy']
                      ? (cabins['Economy'] += 1)
                      : (cabins['Economy'] = 1);
                } else if (key === 'tj') {
                  if (val.prices.prices.ADULT.cabinClass === 'PREMIUM_ECONOMY')
                    cabins['Premium Economy']
                      ? (cabins['Premium Economy'] += 1)
                      : (cabins['Premium Economy'] = 1);
                  else {
                    let tempClass =
                      val.prices.prices.ADULT.cabinClass.charAt(0).toUpperCase() +
                      val.prices.prices.ADULT.cabinClass.slice(1).toLowerCase();
                    cabins[tempClass]
                      ? (cabins[tempClass] += 1)
                      : (cabins[tempClass] = 1);
                  }
                }
                // Airlines
                airlines[val.segments[0].flight.airline]
                  ? (airlines[val.segments[0].flight.airline] += 1)
                  : (airlines[val.segments[0].flight.airline] = 1);
                // Depart Time
                let departHour = val.segments[0].departure.time
                  .split('T')[1]
                  .split(':')[0];
                for (let [key, value] of Object.entries(departTimes)) {
                  if (
                    +departHour >= +value.times.slice(0, 2) &&
                    +departHour < +value.times.slice(8, 10)
                  )
                    departTimes[key].number += 1;
                }
                // Arriving Time
                let arrivalHour = val.segments
                  .at(-1)
                  .arrival.time.split('T')[1]
                  .split(':')[0];
                for (let [key, value] of Object.entries(arriveTimes)) {
                  if (
                    +arrivalHour >= +value.times.slice(0, 2) &&
                    +arrivalHour < +value.times.slice(8, 10)
                  )
                    arriveTimes[key].number += 1;
                }
                // Pricing
                if (total > maxPrice) maxPrice = total;
                // Departing From
                departingFrom[val.segments[0].departure.airport.code]
                  ? (departingFrom[val.segments[0].departure.airport.code] += 1)
                  : (departingFrom[val.segments[0].departure.airport.code] = 1);
                // Arriving At (Checking Combined Logic Too)
                if (secondKey === 'combined') {
                  let x = false;
                  for (let segment of val.segments) {
                    if (segment?.segmentNo === 0) {
                      if (!x) x = true;
                      else {
                        arrivingAt[segment.departure.airport.code]
                          ? (arrivingAt[segment.departure.airport.code] += 1)
                          : (arrivingAt[segment.departure.airport.code] = 1);
                      }
                    }
                  }
                } else
                  arrivingAt[val.segments.at(-1).arrival.airport.code]
                    ? (arrivingAt[val.segments.at(-1).arrival.airport.code] += 1)
                    : (arrivingAt[val.segments.at(-1).arrival.airport.code] = 1);
                /* Pushing */
                temp.push({
                  ...val,
                  ...{
                    provider: key,
                    selectId: `collapse_${counter}`,
                    type: secondKey,
                    total,
                    childPrice,
                    infantPrice,
                    adultPrice,
                    totalDuration,
                    overallDayDifference,
                  },
                });
                counter += 1;
              }
            }
          }
        }
      }
      // Manipulating Stops
      for (let [key, value] of Object.entries(stops)) {
        stops[key] = { number: value, value: true };
      }
      // Manipulating Cabins
      for (let [key, value] of Object.entries(cabins)) {
        cabins[key] = { number: value, value: true };
      }
      // Manipulating Airlines
      for (let [key, value] of Object.entries(airlines)) {
        for (let org of airlineOrgs) {
          if (org.code === key) {
            airlines[org.name] = { number: value, value: true, code: key };
            delete airlines[key];
            break;
          }
        }
      }
      // Manipulating Departing From
      for (let [key, value] of Object.entries(departingFrom)) {
        for (let airport of airports) {
          if (airport.iata_code === key) {
            departingFrom[airport.name] = {
              number: value,
              value: true,
              iata_code: key,
              city: airport.city,
            };
            delete departingFrom[key];
          }
        }
      }
      // Manipulating Arriving At
      for (let [key, value] of Object.entries(arrivingAt)) {
        for (let airport of airports) {
          if (airport.iata_code === key) {
            arrivingAt[airport.name] = {
              number: value,
              value: true,
              iata_code: key,
              city: airport.city,
            };
            delete arrivingAt[key];
          }
        }
      }
      dispatch(setStops(stops));
      dispatch(setCabins(cabins));
      dispatch(setAirlines(airlines));
      dispatch(setDepartTimes(departTimes));
      dispatch(setArriveTimes(arriveTimes));
      dispatch(
        setPrice({ value: { min: 0, max: maxPrice + 1 }, maxPrice: maxPrice + 1 })
      );
      dispatch(setDepartingFrom(departingFrom));
      dispatch(setArrivingAt(arrivingAt));
      console.log(temp);
      setToCount(toCount);
      setFromCount(fromCount);
      setCombinedCount(combinedCount);
      setManip(temp);
      if (toCount > 0) {
        setCurrentTab('to');
      } else if (fromCount > 0) {
        setCurrentTab('from');
      } else if (combinedCount > 0) {
        setCurrentTab('combined');
      }
    }
  }, [searchData, airlineOrgs]);

  useEffect(() => {
    if (manip) {
      dispatch(
        setPaginateTotalDataSize({
          paginateTotalDataSize: manip.filter((el) => {
            let stat = filter(el);
            return stat;
          }).length,
        })
      );
    }
  }, [
    sort,
    manip,
    currentTab,
    stops,
    cabins,
    airlines,
    departTimes,
    arriveTimes,
    price,
    departingFrom,
    arrivingAt,
  ]);

  const filter = (el) => {
    // If Element type is of current tab
    if (el.type === currentTab) {
      // Filters:
      // Filter By Stops
      if (el.segments.length === 1) {
        if (!stops['Nonstop']?.value) return false;
      } else if (el.segments.length === 2) {
        if (!stops['1 Stop']?.value) return false;
      } else {
        if (!stops[`${el.segments.length - 1} Stops`]?.value) return false;
      }
      // Filter By Cabin
      if (el.provider === 'aa') {
        if (el.prices.prices.ADT.cabinClass === 'EC')
          if (!cabins['Economy']?.value) return false;
      } else if (el.provider === 'tj') {
        if (el.prices.prices.ADULT.cabinClass === 'PREMIUM_ECONOMY') {
          if (!cabins['Premium Economy']?.value) return false;
        } else {
          let tempClass =
            el.prices.prices.ADULT.cabinClass.charAt(0).toUpperCase() +
            el.prices.prices.ADULT.cabinClass.slice(1).toLowerCase();
          if (!cabins[tempClass]?.value) return false;
        }
      }
      // Filter By Airline
      for (let airline of Object.values(airlines)) {
        if (el.segments[0].flight.airline === airline.code)
          if (!airline.value) return false;
      }
      // Filter By Depart Time
      let departHour = el.segments[0].departure.time.split('T')[1].split(':')[0];
      for (let [key, value] of Object.entries(departTimes)) {
        if (
          +departHour >= +value.times.slice(0, 2) &&
          +departHour < +value.times.slice(8, 10)
        )
          if (!value.value) return false;
      }
      // Filter By Airline Time
      let arrivalHour = el.segments.at(-1).arrival.time.split('T')[1].split(':')[0];
      for (let [key, value] of Object.entries(arriveTimes)) {
        if (
          +arrivalHour >= +value.times.slice(0, 2) &&
          +arrivalHour < +value.times.slice(8, 10)
        )
          if (!value.value) return false;
      }
      // Filter By Price Slider
      if (!(el.total >= price.value.min && el.total <= price.value.max)) return false;
      // Filter By Departing From & Arriving At
      let departValueCheck = el.segments[0].departure.airport.code;
      for (let dep of Object.values(departingFrom)) {
        if (departValueCheck === dep.iata_code) if (!dep.value) return false;
      }
      let arrivalValueCheck = el.segments.at(-1).arrival.airport.code;
      if (el?.type === 'combined') {
        let x = false;
        for (let segment of el.segments) {
          if (segment.segmentNo === 0) {
            if (!x) x = true;
            else arrivalValueCheck = segment.departure.airport.code;
          }
        }
      }
      for (let arr of Object.values(arrivingAt)) {
        if (arrivalValueCheck === arr.iata_code) if (!arr.value) return false;
      }
      // Return True by Default
      return true;
    } else {
      return false;
    }
  };

  return (
    <>
      {/* Tabs */}
      {(fromCount > 0 || combinedCount > 0) && (
        <div
          style={{ width: '100%', display: 'flex', textAlign: 'center' }}
          className='mt-30'
        >
          {toCount > 0 && (
            <span
              onClick={() => setCurrentTab('to')}
              className='d-flex items-center justify-center gap-2'
              style={{
                cursor: 'pointer',
                borderBottom:
                  currentTab === 'to' ? 'solid 2px blue' : 'transparent 2px solid',
                flex: '1',
              }}
            >
              {destinations?.from?.iata} <BsArrowRight /> {destinations?.to?.iata}
            </span>
          )}
          {fromCount > 0 && (
            <span
              onClick={() => setCurrentTab('from')}
              className='d-flex items-center justify-center gap-2'
              style={{
                cursor: 'pointer',
                borderBottom:
                  currentTab === 'from' ? 'solid 2px blue' : 'transparent 2px solid',
                flex: '1',
              }}
            >
              {destinations?.to?.iata} <BsArrowRight /> {destinations?.from?.iata}
            </span>
          )}
          {combinedCount > 0 && (
            <span
              onClick={() => setCurrentTab('combined')}
              className='d-flex items-center justify-center gap-2'
              style={{
                cursor: 'pointer',
                borderBottom:
                  currentTab === 'combined' ? 'solid 2px blue' : 'transparent 2px solid',
                flex: '1',
              }}
            >
              Round Trip
            </span>
          )}
        </div>
      )}
      {/* Table */}
      {manip &&
        manip.length > 0 &&
        manip
          .filter((el) => {
            let stat = filter(el);
            return stat;
          })
          .sort((a, b) => {
            if (sort.price) {
              return sort._ ? +a.total - +b.total : +b.total - +a.total;
            } else if (sort.total_duration) {
              return sort._
                ? +a.totalDuration - +b.totalDuration
                : +b.totalDuration - +a.totalDuration;
            } else if (sort.departure_time) {
              return sort._
                ? new Date(a.segments[0].departure.time).getTime() -
                    new Date(b.segments[0].departure.time).getTime()
                : new Date(b.segments[0].departure.time).getTime() -
                    new Date(a.segments[0].departure.time).getTime();
            } else if (sort.arrival_time) {
              return sort._
                ? new Date(a.segments.at(-1).arrival.time).getTime() -
                    new Date(b.segments.at(-1).arrival.time).getTime()
                : new Date(b.segments.at(-1).arrival.time).getTime() -
                    new Date(a.segments.at(-1).arrival.time).getTime();
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
              return (
                <FlightProperty element={element} key={index} currentTab={currentTab} />
              );
          })}
    </>
  );
};

export default FlightProperties;

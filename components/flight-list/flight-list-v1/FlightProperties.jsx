import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaChevronCircleDown, FaRegClock } from 'react-icons/fa';
import { setPaginateTotalDataSize } from '../../../features/flightSearch/flightSearchSlice';
import { BsArrowRight } from 'react-icons/bs';

const FlightProperties = () => {
  const searchData = useSelector((state) => state.flightSearch.value.searchData);
  const [manip, setManip] = useState([]);
  const [currentTab, setCurrentTab] = useState('to');
  const airports = useSelector((state) => state.apis.value.airports);
  const travellerDOBS = useSelector((state) => state.flightSearch.value.travellerDOBS);
  const airlineOrgs = useSelector((state) => state.flightSearch.value.airlineOrgs);
  const [expand, setExpand] = useState([]);
  const [fromCount, setFromCount] = useState(0);
  const [combinedCount, setCombinedCount] = useState(0);
  const [to, setTo] = useState('');
  const [from, setFrom] = useState('');

  const paginateDataNumber = useSelector(
    (state) => state.flightSearch.value.paginateDataNumber
  );
  const paginateDataPerPage = useSelector(
    (state) => state.flightSearch.value.paginateDataPerPage
  );
  const dispatch = useDispatch();

  /* TODO
  - Pagination
  */

  // Manipulating Data
  useEffect(() => {
    if (searchData) {
      let temp = [];
      let counter = 1;
      let fromCount = 0;
      let combinedCount = 0;
      let to = '',
        from = '';
      for (let [key, value] of Object.entries(searchData)) {
        if (value) {
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
                // Setting Arrival and Departure Airport Codes
                if (from === '' && to === '' && secondKey === 'to') {
                  from = val.segments[0].departure.airport.code;
                  to = val.segments.at(-1).arrival.airport.code;
                }
                // Setting from and combined count
                if (secondKey === 'from') fromCount += 1;
                if (secondKey === 'combined') combinedCount += 1;
                // Pushing
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
      console.log(temp);
      setFrom(from);
      setTo(to);
      setFromCount(fromCount);
      setCombinedCount(combinedCount);
      setManip(temp);
    }
  }, [searchData]);

  useEffect(() => {
    if (manip) {
      dispatch(
        setPaginateTotalDataSize({
          paginateTotalDataSize: manip.filter((el) => el.type === currentTab).length,
        })
      );
    }
  }, [manip, currentTab]);

  return (
    <>
      {/* Tabs */}
      {(fromCount > 0 || combinedCount > 0) && (
        <div
          style={{ width: '100%', display: 'flex', textAlign: 'center' }}
          className='mt-10'
        >
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
            {from} <BsArrowRight /> {to}
          </span>
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
              {to} <BsArrowRight /> {from}
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
          .filter((el) => el.type === currentTab)
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
                <div className='js-accordion' key={index}>
                  <div className='py-30 px-30 bg-white rounded-4 base-tr mt-30'>
                    <div className='row y-gap-30 justify-between'>
                      <div
                        className='col d-flex flex-column justify-between'
                        style={{ minHeight: '200px' }}
                      >
                        <div className='row y-gap-10 items-center'>
                          <div className='col-sm-auto'>
                            <img
                              src={`/img/flights/${element.segments[0].flight.airline}.png`}
                              alt='image'
                            />
                          </div>
                          <div className='col'>
                            <div className='row x-gap-20 items-end'>
                              <div className='col-auto'>
                                <div className='lh-15 fw-500'>
                                  {element.provider === 'aa' &&
                                    element.segments[0].departure.time.slice(-8, -3)}
                                  {element.provider === 'tj' &&
                                    element.segments[0].departure.time.slice(-5)}
                                </div>
                                <div className='text-15 lh-15 text-light-1'>
                                  {element.segments[0].departure.airport.code}
                                </div>
                              </div>
                              <div className='col text-center'>
                                <div className='flightLine'>
                                  <div />
                                  <div />
                                </div>
                                <div className='text-15 lh-15 text-light-1 mt-10'>
                                  {element.segments.length > 1 ? (
                                    <>
                                      {element.segments.length - 1}{' '}
                                      {element.segments.length - 1 > 1 ? 'Stops' : 'Stop'}{' '}
                                      (
                                      {element.segments.map((segmentStop, stopIndex) => {
                                        if (stopIndex + 1 < element.segments.length) {
                                          if (stopIndex === 0) {
                                            return (
                                              <>{segmentStop.arrival.airport.code}</>
                                            );
                                          } else {
                                            return (
                                              <>,{segmentStop.arrival.airport.code}</>
                                            );
                                          }
                                        }
                                      })}
                                      )
                                    </>
                                  ) : (
                                    'Nonstop'
                                  )}
                                </div>
                              </div>
                              <div className='col-auto'>
                                <div className='lh-15 fw-500'>
                                  {element.provider === 'aa' &&
                                    element.segments.at(-1).arrival.time.slice(-8, -3)}
                                  {element.provider === 'tj' &&
                                    element.segments.at(-1).arrival.time.slice(-5)}{' '}
                                  {element.overallDayDifference > 0 ? (
                                    <span className='text-secondary text-14'>
                                      (
                                      <span className='text-danger'>
                                        +{element.overallDayDifference}
                                      </span>
                                      )
                                    </span>
                                  ) : (
                                    <></>
                                  )}
                                </div>
                                <div className='text-15 lh-15 text-light-1'>
                                  {element.segments.at(-1).arrival.airport.code}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className='col-md-auto'>
                            <div className='text-15 text-light-1 px-20 md:px-0'>
                              {Math.floor(element.totalDuration / 60)}h{' '}
                              {element.totalDuration % 60}m
                            </div>
                          </div>
                        </div>
                        {/* Return Trip */}
                        {/* <div className='row y-gap-10 items-center pt-30'>
                      <div className='col-sm-auto'>
                        <img
                          className='size-40'
                          src='/img/flightIcons/2.png'
                          alt='image'
                        />
                      </div>
                      <div className='col'>
                        <div className='row x-gap-20 items-end'>
                          <div className='col-auto'>
                            <div className='lh-15 fw-500'>14:00</div>
                            <div className='text-15 lh-15 text-light-1'>SAW</div>
                          </div>
                          <div className='col text-center'>
                            <div className='flightLine'>
                              <div />
                              <div />
                            </div>
                            <div className='text-15 lh-15 text-light-1 mt-10'>
                              Nonstop
                            </div>
                          </div>
                          <div className='col -auto'>
                            <div className='lh-15 fw-500'>22:00</div>
                            <div className='text-15 lh-15 text-light-1'>STN</div>
                          </div>
                        </div>
                      </div>
                      <div className='col-md-auto'>
                        <div className='text-15 text-light-1 px-20 md:px-0'>4h 05m</div>
                      </div>
                    </div> */}
                        <div className='d-flex justify-center pb-5'>
                          <FaChevronCircleDown
                            className='text-info text-25 cursor-pointer'
                            data-bs-toggle='collapse'
                            data-bs-target={`#${element.selectId}`}
                            onClick={() =>
                              setExpand((prev) => {
                                if (prev.includes(element.selectId)) {
                                  prev = prev.filter((e) => e !== element.selectId);
                                } else {
                                  prev.push(element.selectId);
                                }
                                return [...prev];
                              })
                            }
                            style={{
                              transitionDuration: '0.3s',
                              rotate: expand.includes(element.selectId) && '180deg',
                            }}
                          />
                        </div>
                      </div>
                      {/* End .col */}
                      <div className='col-md-auto'>
                        <div className='d-flex items-center h-full'>
                          <div className='pl-30 border-left-light h-full md:d-none' />
                          <div>
                            <button className='button -dark-1 px-30 h-50 bg-blue-1 text-white'>
                              Book Now <div className='icon-arrow-top-right ml-15' />
                            </button>
                            <div className='text-right md:text-left mt-10'>
                              <div className='text-18 lh-16 fw-500'>
                                INR{' '}
                                {element.total.toLocaleString('en-IN', {
                                  maximumFractionDigits: 2,
                                  style: 'currency',
                                  currency: 'INR',
                                })}
                              </div>
                              {element.adultPrice > 0 && (
                                <div className='text-15 lh-16 text-light-1'>
                                  {travellerDOBS.ADT}x Adult @{' '}
                                  {element.adultPrice.toLocaleString('en-IN', {
                                    maximumFractionDigits: 2,
                                    style: 'currency',
                                    currency: 'INR',
                                  })}
                                </div>
                              )}
                              {element.childPrice > 0 && (
                                <div className='text-15 lh-16 text-light-1'>
                                  {travellerDOBS.CHD}x Child @{' '}
                                  {element.childPrice.toLocaleString('en-IN', {
                                    maximumFractionDigits: 2,
                                    style: 'currency',
                                    currency: 'INR',
                                  })}
                                </div>
                              )}
                              {element.infantPrice > 0 && (
                                <div className='text-15 lh-16 text-light-1'>
                                  {travellerDOBS.INF}x Infant @{' '}
                                  {element.infantPrice.toLocaleString('en-IN', {
                                    maximumFractionDigits: 2,
                                    style: 'currency',
                                    currency: 'INR',
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* End .col-md-auto */}
                    </div>
                    {/* End .row */}
                    <div className=' collapse' id={element.selectId}>
                      {element.segments.map((segment, segmentIndex) => {
                        // Duration
                        let duration =
                          (new Date(segment.arrival.time).getTime() -
                            new Date(segment.departure.time).getTime()) /
                          60000;
                        let hours = Math.floor(duration / 60);
                        let minutes = duration % 60;

                        // Layover Time
                        let layoverTime;
                        if (segmentIndex + 1 < element.segments.length) {
                          layoverTime =
                            (new Date(
                              element.segments[segmentIndex + 1].departure.time
                            ).getTime() -
                              new Date(segment.arrival.time).getTime()) /
                            60000;
                        }

                        const departureDate = new Date(segment.departure.time).toString();

                        // Airport Name
                        let departureAirport;
                        let arrivalAirport;
                        for (let airport of airports) {
                          if (segment.departure.airport.code === airport.iata_code)
                            departureAirport = airport.name;
                          if (segment.arrival.airport.code === airport.iata_code)
                            arrivalAirport = airport.name;
                        }

                        // Airline Name
                        let airlineName = segment.flight.airline;
                        for (let airline of airlineOrgs) {
                          if (airline.code === segment.flight.airline)
                            airlineName = airline.name;
                        }

                        // Business Class
                        let businessClass;
                        if (element.provider === 'aa') {
                          if (element.prices.prices.ADT.cabinClass === 'EC')
                            businessClass = 'Economy';
                        } else if (element.provider === 'tj') {
                          if (
                            element.prices.prices.ADULT.cabinClass === 'PREMIUM_ECONOMY'
                          )
                            businessClass = 'Premium Economy';
                          else
                            businessClass =
                              element.prices.prices.ADULT.cabinClass
                                .charAt(0)
                                .toUpperCase() +
                              element.prices.prices.ADULT.cabinClass
                                .slice(1)
                                .toLowerCase();
                        }

                        // Segment Day Difference
                        let departureDay = new Date(segment.departure.time.slice(0, 10));
                        let arrivalDay = new Date(segment.arrival.time.slice(0, 10));
                        let segmentDayDifference = Math.floor(
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

                        return (
                          <div key={segmentIndex}>
                            <div className='border-light rounded-4 my-3'>
                              <div className='py-20 px-30'>
                                <div className='row justify-between items-center'>
                                  <div className='col-auto'>
                                    <div className='fw-500 text-dark-1'>
                                      Depart • {departureDate.slice(0, 3)},{' '}
                                      {departureDate.slice(3, 10)}
                                    </div>
                                  </div>
                                  <div className='col-auto'>
                                    <div className='text-14 text-light-1'>
                                      {hours}h {minutes}m
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className='py-30 px-30 border-top-light'>
                                <div className='row y-gap-10 justify-between'>
                                  <div className='col-auto'>
                                    <div className='d-flex items-center mb-15'>
                                      <div className='w-28 d-flex justify-center mr-15'>
                                        <img
                                          src={`/img/flights/${segment.flight.airline}.png`}
                                          alt='image'
                                        />
                                      </div>
                                      <div className='text-14 text-light-1'>
                                        {airlineName} - {segment.flight.airline}{' '}
                                        {segment.flight.number}
                                      </div>
                                    </div>
                                    <div className='relative z-0'>
                                      <div className='border-line-2' />
                                      <div className='d-flex items-center'>
                                        <div className='w-28 d-flex justify-center mr-15'>
                                          <div className='size-10 border-light rounded-full bg-white' />
                                        </div>
                                        <div className='row'>
                                          <div className='col-auto'>
                                            <div className='lh-14 fw-500'>
                                              {element.provider === 'aa' &&
                                                segment.departure.time.slice(-8, -3)}
                                              {element.provider === 'tj' &&
                                                segment.departure.time.slice(-5)}
                                            </div>
                                          </div>
                                          <div className='col-auto'>
                                            <div className='lh-14 fw-500'>
                                              {departureAirport} (
                                              {segment.departure.airport.code})
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className='d-flex items-center mt-15'>
                                        <div className='w-28 d-flex justify-center mr-15'>
                                          <img src='/img/flights/plane.svg' alt='image' />
                                        </div>
                                        <div className='text-14 text-light-1'>
                                          {hours}h {minutes}m
                                        </div>
                                      </div>
                                      <div className='d-flex items-center mt-15'>
                                        <div className='w-28 d-flex justify-center mr-15'>
                                          <div className='size-10 border-light rounded-full bg-border' />
                                        </div>
                                        <div className='row'>
                                          <div className='col-auto'>
                                            <div className='lh-14 fw-500'>
                                              {element.provider === 'aa' &&
                                                segment.arrival.time.slice(-8, -3)}
                                              {element.provider === 'tj' &&
                                                segment.arrival.time.slice(-5)}{' '}
                                              {segmentDayDifference > 0 ? (
                                                <span className='text-secondary text-14'>
                                                  (
                                                  <span className='text-danger'>
                                                    +{segmentDayDifference}
                                                  </span>
                                                  )
                                                </span>
                                              ) : (
                                                <></>
                                              )}
                                            </div>
                                          </div>
                                          <div className='col-auto'>
                                            <div className='lh-14 fw-500'>
                                              {arrivalAirport} (
                                              {segment.arrival.airport.code})
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className='col-auto text-right md:text-left'>
                                    <div className='text-14 text-light-1'>
                                      {businessClass}
                                    </div>
                                    <div className='text-14 mt-15 md:mt-5'>
                                      {segment.flight.equipment.charAt(0) === '7' &&
                                        'Boeing ' + segment.flight.equipment}
                                      {segment.flight.equipment.charAt(0) === '3' &&
                                        'Airbus A' + segment.flight.equipment}
                                      {/* <br />
                                  Wi-Fi available
                                  <br />
                                  USB outlet */}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {segmentIndex + 1 < element.segments.length && (
                              <span className='ml-10 d-flex items-center gap-2'>
                                <FaRegClock className='text-danger text-20' /> Layover
                                Time - {Math.floor(layoverTime / 60)}h {layoverTime % 60}m
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {/* End collapase content */}
                  </div>
                  {/* End bg-white */}
                </div>
              );
          })}
    </>
  );
};

export default FlightProperties;

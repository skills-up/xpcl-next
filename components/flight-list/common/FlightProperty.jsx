import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaChevronCircleDown, FaRegClock } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {
  setEmailClients,
  setSelectedBookings,
} from '../../../features/flightSearch/flightSearchSlice';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import Pluralize from '../../../utils/pluralChecker';
import { FaChevronDown, FaF } from 'react-icons/fa6';

function FlightProperty({
  element,
  manip = [],
  setManip = null,
  manipIndex,
  isSelectedBooking = false,
  currentTab,
  showPrice = true,
  alreadyExpanded = false,
  key,
  showFF = false,
}) {
  const [expand, setExpand] = useState(false);
  const returnFlight = useSelector((state) => state.flightSearch.value.returnFlight);
  const travellerDOBS = useSelector((state) => state.flightSearch.value.travellerDOBS);
  const airports = useSelector((state) => state.apis.value.airports);
  const airlineOrgs = useSelector((state) => state.flightSearch.value.airlineOrgs);
  const selectedBookings = useSelector(
    (state) => state.flightSearch.value.selectedBookings
  );
  const dispatch = useDispatch();
  const [isSelected, setIsSelected] = useState(false);
  const [isEmailSelected, setIsEmailSelected] = useState(false);
  const emailClientMode = useSelector(
    (state) => state.flightSearch.value.emailClientMode
  );
  const [showMore, SetShowMore] = useState(false);
  const [selectFare, SetSelectFare] = useState(false);
  const emailClients = useSelector((state) => state.flightSearch.value.emailClients);
  const router = useRouter();
  const destinations = useSelector((state) => state.flightSearch.value.destinations);
  const [combinedStops, setCombinedStops] = useState({ f: 0, s: 0 });
  useEffect(() => {
    setExpand(false);
  }, [currentTab]);

  const [layoffSegment, setLayoffSegment] = useState(null);

  let getArray = (x) => {
    return x ? (Array.isArray(x) ? x : Object.values(x)) : [];
  };

  useEffect(() => {
    if (alreadyExpanded) {
      SetShowMore(true);
    }
  }, [alreadyExpanded]);

  // Not all airports have the same ending destination, so in case of combined, we are finding the end airport (used in layoffs)
  // and where the airport ends
  useEffect(() => {
    if (element && element.type === 'combined') {
      let counter = 0;
      let temp = { f: 0, s: 0 };
      let segCounter = 0;
      for (let segment of element.segments) {
        if (segment.segmentNo === 0) {
          counter += 1;
          if (counter === 2) {
            setLayoffSegment(segCounter);
          }
        }
        if (counter < 2) {
          temp.f += 1;
        } else {
          temp.s += 1;
        }
        segCounter += 1;
      }
      setCombinedStops({ f: temp.f - 1, s: temp.s - 1 });
    }
  }, [element]);

  useEffect(() => {
    if (showMore || selectFare) {
      setExpand(true);
    } else {
      setExpand(false);
    }
  }, [showMore, selectFare]);

  useEffect(() => {
    if (!isSelectedBooking) {
      if (emailClientMode) {
        for (let value of Object.values(emailClients)) {
          if (value) {
            if (value.selectId === element.selectId) {
              setIsEmailSelected(true);
              return;
            }
          }
        }
      } else {
        for (let value of Object.values(selectedBookings)) {
          if (value) {
            if (value.selectId === element.selectId) {
              setIsSelected(true);
              return;
            }
          }
        }
      }
      setIsEmailSelected(false);
      setIsSelected(false);
    }
  }, [selectedBookings, element, emailClients, emailClientMode, currentTab, manip]);

  return (
    <div className='js-accordion'>
      <div
        className='pt-20 pb-5 px-30 rounded-4 base-tr mt-10'
        style={{
          backgroundColor: emailClientMode
            ? isEmailSelected
              ? '#CBC3E3'
              : 'white'
            : isSelected
            ? 'rgb(230,230,230)'
            : 'white',
          cursor: emailClientMode ? 'pointer' : 'default',
        }}
        onClick={() => {
          if (emailClientMode) {
            for (let i = 0; i < emailClients.length; i++) {
              if (emailClients[i].selectId === element.selectId) {
                const prev = emailClients.slice(0);
                prev.splice(i, 1);
                dispatch(setEmailClients(prev));
                return;
              }
            }
            dispatch(setEmailClients([...emailClients, element]));
          }
        }}
      >
        <div className='row y-gap-15 justify-between lg:pr-0'>
          <div
            className='col d-flex flex-column'
            // style={{ minHeight: '200px' }}
          >
            <div className='row y-gap-10 x-gap-20 items-center'>
              <div className='col-sm-auto'>
                <img
                  style={{ maxWidth: '50px', maxHeight: '40px' }}
                  src={`/img/flights/${element.segments[0].flight.airline}.png`}
                  alt='image'
                />
              </div>
              <div className='col y-gap-10 row pr-0'>
                {/* Not Combined */}
                <div className='col-12 row pr-0 x-gap-10'>
                  <div className='col pr-0'>
                    <div className='row x-gap-20 items-end'>
                      <div className='col-auto'>
                        <div className='lh-15 fw-500'>
                          {element.provider === 'aa' &&
                            element.segments[0].departure.time.slice(-8, -3)}
                          {(element.provider === 'tj' || element.provider === 'ad') &&
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
                          {element.type === 'combined' ? (
                            combinedStops.f > 0 ? (
                              <>
                                {combinedStops.f}{' '}
                                {Pluralize('Stop', 'Stops', combinedStops.f)} (
                                {element.segments.map((segmentStop, stopIndex) => {
                                  if (stopIndex < combinedStops.f) {
                                    if (stopIndex === combinedStops.f - 1)
                                      return <>{segmentStop.arrival.airport.code}</>;
                                    else return <>{segmentStop.arrival.airport.code},</>;
                                  }
                                })}
                                )
                              </>
                            ) : (
                              'Nonstop'
                            )
                          ) : element.segments.length > 1 ? (
                            <>
                              {element.segments.length - 1}{' '}
                              {element.segments.length - 1 > 1 ? 'Stops' : 'Stop'} (
                              {element.segments.map((segmentStop, stopIndex) => {
                                if (stopIndex + 1 < element.segments.length) {
                                  if (stopIndex === 0) {
                                    return <>{segmentStop.arrival.airport.code}</>;
                                  } else {
                                    return <>,{segmentStop.arrival.airport.code}</>;
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
                        <div className='lh-15 fw-500' style={{ width: '77px' }}>
                          {element.provider === 'aa' &&
                            element.segments.at(-1).arrival.time.slice(-8, -3)}
                          {(element.provider === 'tj' || element.provider === 'ad') &&
                            (element.type === 'combined' && layoffSegment
                              ? element.segments[layoffSegment - 1]?.arrival?.time?.slice(
                                  -5
                                )
                              : element.segments.at(-1).arrival.time.slice(-5))}{' '}
                          {element.type === 'combined' ? (
                            element.legOneDayDifference > 0 ? (
                              <span className='text-secondary text-14'>
                                (
                                <span className='text-danger'>
                                  +{element.legOneDayDifference}
                                </span>
                                )
                              </span>
                            ) : (
                              <></>
                            )
                          ) : element.overallDayDifference > 0 ? (
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
                          {layoffSegment
                            ? element.segments[layoffSegment - 1]?.arrival?.airport?.code
                            : element.segments.at(-1).arrival.airport.code}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='col-md-auto'>
                    <div className='text-15 text-light-1 px-0' style={{ width: '75px' }}>
                      {/* Checking Days, Hours, Minutes */}
                      {element.firstLegDuration > 0 ? (
                        element.firstLegDuration >= 1440 ? (
                          <>
                            {Math.floor(element.firstLegDuration / 24 / 60)}d{' '}
                            {Math.floor((element.firstLegDuration / 60) % 24)}h{' '}
                            {element.firstLegDuration % 60}m
                          </>
                        ) : (
                          <>
                            {Math.floor(element.firstLegDuration / 60) > 0 ? (
                              <>{Math.floor(element.firstLegDuration / 60)}h</>
                            ) : (
                              <></>
                            )}{' '}
                            {element.firstLegDuration % 60}m
                          </>
                        )
                      ) : element.totalDuration >= 1440 ? (
                        <>
                          {Math.floor(element.totalDuration / 24 / 60)}d{' '}
                          {Math.floor((element.totalDuration / 60) % 24)}h{' '}
                          {element.totalDuration % 60}m
                        </>
                      ) : (
                        <>
                          {Math.floor(element.totalDuration / 60) > 0 ? (
                            <>{Math.floor(element.totalDuration / 60)}h</>
                          ) : (
                            <></>
                          )}{' '}
                          {element.totalDuration % 60}m
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {/* Combined */}
                {element.type === 'combined' && layoffSegment && (
                  <div className='col-12 row pr-0 x-gap-10'>
                    <div className='col pr-0'>
                      <div className='row x-gap-20 items-end'>
                        <div className='col-auto'>
                          <div className='lh-15 fw-500'>
                            {element.provider === 'aa' &&
                              element.segments[0].departure.time.slice(-8, -3)}
                            {(element.provider === 'tj' || element.provider === 'ad') &&
                              (element.type === 'combined' && layoffSegment
                                ? element.segments[layoffSegment]?.departure?.time?.slice(
                                    -5
                                  )
                                : element.segments[0].departure.time.slice(-5))}
                          </div>
                          <div className='text-15 lh-15 text-light-1'>
                            {element.segments[layoffSegment]?.departure?.airport?.code}
                          </div>
                        </div>
                        <div className='col text-center'>
                          <div className='flightLine'>
                            <div />
                            <div />
                          </div>
                          <div className='text-15 lh-15 text-light-1 mt-10'>
                            {element.type === 'combined' ? (
                              combinedStops.s > 0 ? (
                                <>
                                  {combinedStops.s}{' '}
                                  {Pluralize('Stop', 'Stops', combinedStops.s)} (
                                  {element.segments.map((segmentStop, stopIndex) => {
                                    if (
                                      stopIndex > combinedStops.f &&
                                      stopIndex < combinedStops.f + combinedStops.s + 1
                                    ) {
                                      if (stopIndex === combinedStops.f + combinedStops.s)
                                        return <>{segmentStop.arrival.airport.code}</>;
                                      else
                                        return <>{segmentStop.arrival.airport.code},</>;
                                    }
                                  })}
                                  )
                                </>
                              ) : (
                                'Nonstop'
                              )
                            ) : element.segments.length > 1 ? (
                              <>
                                {element.segments.length - 1}{' '}
                                {element.segments.length - 1 > 1 ? 'Stops' : 'Stop'} (
                                {element.segments.map((segmentStop, stopIndex) => {
                                  if (stopIndex + 1 < element.segments.length) {
                                    if (stopIndex === 0) {
                                      return <>{segmentStop.arrival.airport.code}</>;
                                    } else {
                                      return <>,{segmentStop.arrival.airport.code}</>;
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
                          <div className='lh-15 fw-500' style={{ width: '77px' }}>
                            {element.provider === 'aa' &&
                              element.segments.at(-1).arrival.time.slice(-8, -3)}
                            {(element.provider === 'tj' || element.provider === 'ad') &&
                              element.segments.at(-1).arrival.time.slice(-5)}{' '}
                            {element.type === 'combined' ? (
                              element.legTwoDayDifference > 0 ? (
                                <span className='text-secondary text-14'>
                                  (
                                  <span className='text-danger'>
                                    +{element.legTwoDayDifference}
                                  </span>
                                  )
                                </span>
                              ) : (
                                <></>
                              )
                            ) : element.overallDayDifference > 0 ? (
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
                      <div
                        className='text-15 text-light-1 px-0'
                        style={{ width: '75px' }}
                      >
                        {/* Checking Days, Hours, Minutes */}
                        {element.secondLegDuration > 0 ? (
                          element.secondLegDuration >= 1440 ? (
                            <>
                              {Math.floor(element.secondLegDuration / 24 / 60)}d{' '}
                              {Math.floor((element.secondLegDuration / 60) % 24)}h{' '}
                              {element.secondLegDuration % 60}m
                            </>
                          ) : (
                            <>
                              {Math.floor(element.secondLegDuration / 60) > 0 ? (
                                <>{Math.floor(element.secondLegDuration / 60)}h</>
                              ) : (
                                <></>
                              )}{' '}
                              {element.secondLegDuration % 60}m
                            </>
                          )
                        ) : element.totalDuration >= 1440 ? (
                          <>
                            {Math.floor(element.totalDuration / 24 / 60)}d{' '}
                            {Math.floor((element.totalDuration / 60) % 24)}h{' '}
                            {element.totalDuration % 60}m
                          </>
                        ) : (
                          <>
                            {Math.floor(element.totalDuration / 60) > 0 ? (
                              <>{Math.floor(element.totalDuration / 60)}h</>
                            ) : (
                              <></>
                            )}{' '}
                            {element.totalDuration % 60}m
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className='d-flex justify-start pb-5'>
              <span
                className='text-14 text-blue-1 fw-500 underline cursor-pointer'
                onClick={() => SetShowMore((prev) => !prev)}
              >
                {showMore ? 'Show Less' : 'Show More'}
              </span>
            </div>
          </div>
          {/* End .col */}
          {showPrice && (
            <div className='col-md-auto'>
              <div className='d-flex h-full pb-10'>
                <div className='pl-30 border-left-light h-full md:d-none' />
                <div>
                  {!isSelectedBooking && (
                    <button
                      onClick={async () => {
                        if (element.type !== 'combined') {
                          dispatch(
                            setSelectedBookings({
                              ...selectedBookings,
                              ...{ [element.type]: element, combined: null },
                            })
                          );
                          if (!returnFlight) router.push('/flight/book');
                        } else {
                          dispatch(
                            setSelectedBookings({
                              to: null,
                              from: null,
                              combined: element,
                            })
                          );
                          router.push('/flight/book');
                        }
                      }}
                      className='button -dark-1 px-30 h-40 bg-blue-1 text-white'
                    >
                      {element.type === 'combined'
                        ? 'Book Now'
                        : returnFlight
                        ? 'Select'
                        : 'Book Now'}
                      <div className='icon-arrow-top-right text-12 ml-10' />
                    </button>
                  )}
                  <div className='text-right md:text-left'>
                    <div className='text-18 lh-16 fw-500'>
                      <a
                        data-tooltip-id={'x_' + element.selectId}
                        data-tooltip-content={`${
                          element?.selectedFF?.prices?.ADULT?.fare > 0
                            ? `${
                                travellerDOBS.ADT
                              }x Adult @ ${element.selectedFF.prices.ADULT.fare.toLocaleString(
                                'en-IN',
                                {
                                  maximumFractionDigits: 0,
                                  style: 'currency',
                                  currency: 'INR',
                                }
                              )}`
                            : element?.selectedFF?.prices?.ADT > 0
                            ? `${
                                travellerDOBS.ADT
                              }x Adult @ ${element.selectedFF.prices.ADT.toLocaleString(
                                'en-IN',
                                {
                                  maximumFractionDigits: 0,
                                  style: 'currency',
                                  currency: 'INR',
                                }
                              )}`
                            : ''
                        }${
                          element?.selectedFF?.prices?.CHILD?.fare > 0
                            ? `\n${
                                travellerDOBS.CHD
                              }x Child @ ${element.selectedFF.prices.CHILD.fare.toLocaleString(
                                'en-IN',
                                {
                                  maximumFractionDigits: 0,
                                  style: 'currency',
                                  currency: 'INR',
                                }
                              )}`
                            : element?.selectedFF?.prices?.CHD > 0
                            ? `\n${
                                travellerDOBS.CHD
                              }x Child @ ${element.selectedFF.prices.CHD.toLocaleString(
                                'en-IN',
                                {
                                  maximumFractionDigits: 0,
                                  style: 'currency',
                                  currency: 'INR',
                                }
                              )}`
                            : ''
                        }${
                          element?.selectedFF?.prices?.INFANT?.fare > 0
                            ? `\n${
                                travellerDOBS.INF
                              }x Infant @ ${element.selectedFF.prices.INFANT.fare.toLocaleString(
                                'en-IN',
                                {
                                  maximumFractionDigits: 0,
                                  style: 'currency',
                                  currency: 'INR',
                                }
                              )}`
                            : element?.selectedFF?.prices?.INF > 0
                            ? `\n${
                                travellerDOBS.INF
                              }x Infant @ ${element.selectedFF.prices.INF.toLocaleString(
                                'en-IN',
                                {
                                  maximumFractionDigits: 0,
                                  style: 'currency',
                                  currency: 'INR',
                                }
                              )}`
                            : element?.provider === 'aa' && travellerDOBS?.INF
                            ? `\n${travellerDOBS.INF}x Infant @ ${(1500).toLocaleString(
                                'en-IN',
                                {
                                  maximumFractionDigits: 0,
                                  style: 'currency',
                                  currency: 'INR',
                                }
                              )}`
                            : ''
                        }`}
                        data-tooltip-place='top'
                        className={
                          !element.isOnlyFF &&
                          showFF &&
                          `d-flex items-center justify-end x-gap-5 cursor-pointer`
                        }
                        onClick={() => {
                          if (!element.isOnlyFF) SetSelectFare((prev) => !prev);
                        }}
                      >
                        <span>
                          {element.selectedFF?.total?.toLocaleString('en-IN', {
                            maximumFractionDigits: 0,
                            style: 'currency',
                            currency: 'INR',
                          })}
                        </span>
                        {!element.isOnlyFF && showFF && (
                          <span style={{ paddingBottom: '3px' }}>
                            <FaChevronDown
                              className='font-sm'
                              style={{
                                rotate: selectFare ? '180deg' : '0deg',
                              }}
                            />
                          </span>
                        )}
                      </a>
                      <ReactTooltip
                        id={'x_' + element.selectId}
                        render={({ content }) => (
                          <span style={{ display: 'block', textAlign: 'left' }}>
                            {content?.split('\n')?.map((el) => (
                              <>
                                {el}
                                <br />
                              </>
                            ))}
                          </span>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* End .col-md-auto */}
        </div>
        {/* EXPAND */}
        {expand && (
          <>
            {showMore && (
              <div>
                {element.segments.map((segment, segmentIndex) => {
                  // Duration
                  let duration = 0;
                  if (element.provider === 'aa')
                    duration =
                      (new Date(segment.arrival.timeUtc).getTime() -
                        new Date(segment.departure.timeUtc).getTime()) /
                      60000;
                  else if (element.provider === 'ad')
                    duration =
                      (new Date(segment.arrival.time).getTime() -
                        new Date(segment.departure.time).getTime()) /
                      60000;
                  else if (element.provider === 'tj') duration = segment.journey.duration;

                  let days, hours, minutes;
                  if (duration >= 1440) {
                    days = Math.floor(duration / 24 / 60);
                    hours = Math.floor((duration / 60) % 24);
                    minutes = duration % 60;
                  } else {
                    hours = Math.floor(duration / 60);
                    minutes = duration % 60;
                  }

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
                    businessClass = 'Economy';
                  } else if (element.provider === 'ad') {
                    const cabinClass = element.selectedFF.majCabin;
                    if (cabinClass === 'PREMIUM_ECONOMY')
                      businessClass = 'Premium Economy';
                    else
                      businessClass =
                        cabinClass.charAt(0).toUpperCase() +
                        cabinClass.slice(1).toLowerCase();
                  } else if (element.provider === 'tj') {
                    const cabinClass = element.selectedFF?.cabinClass;
                    if (cabinClass === 'PREMIUM_ECONOMY')
                      businessClass = 'Premium Economy';
                    else
                      businessClass =
                        cabinClass.charAt(0).toUpperCase() +
                        cabinClass.slice(1).toLowerCase();
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
                      <div className='border-light rounded-4 my-2'>
                        <div className='py-5 px-30'>
                          <div className='row justify-between items-center'>
                            <div className='col-auto'>
                              <div className='fw-500 text-dark-1'>
                                Depart • {departureDate.slice(0, 3)},{' '}
                                {departureDate.slice(3, 10)}
                              </div>
                            </div>
                            <div className='col-auto'>
                              <div className='text-14 text-light-1'>
                                {days > 0 ? (
                                  <>
                                    {days}d {hours}h {minutes}m
                                  </>
                                ) : (
                                  <>
                                    {hours > 0 ? <>{hours}h</> : <></>} {minutes}m
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className='py-10 px-30 border-top-light'>
                          <div className='row y-gap-10 justify-between'>
                            <div className='col-auto'>
                              <div className='d-flex items-center mb-5'>
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
                                        {(element.provider === 'tj' ||
                                          element.provider === 'ad') &&
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
                                    {days > 0 ? (
                                      <>
                                        {days}d {hours}h {minutes}m
                                      </>
                                    ) : (
                                      <>
                                        {hours > 0 ? <>{hours}h</> : <></>} {minutes}m
                                      </>
                                    )}
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
                                        {(element.provider === 'tj' ||
                                          element.provider === 'ad') &&
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
                                        {arrivalAirport} ({segment.arrival.airport.code})
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className='col-auto text-right md:text-left'>
                              <div className='text-14 text-light-1'>{businessClass}</div>
                              <div className='text-14 mt-15 md:mt-5'>
                                {segment?.flight?.equipment?.charAt(0) === '7' &&
                                  'Boeing ' + segment.flight.equipment}
                                {segment?.flight?.equipment?.charAt(0) === '3' &&
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
                      {segmentIndex + 1 < element.segments.length ? (
                        segmentIndex !== layoffSegment - 1 ? (
                          <span className='ml-10 d-flex items-center gap-2'>
                            <FaRegClock className='text-danger text-20' /> Layover Time -{' '}
                            {layoverTime >= 1440 ? (
                              <>
                                {Math.floor(layoverTime / 24 / 60)}d{' '}
                                {Math.floor((layoverTime / 60) % 24)}h {layoverTime % 60}m
                              </>
                            ) : (
                              <>
                                {Math.floor(layoverTime / 60) > 0 ? (
                                  <>{Math.floor(layoverTime / 60)}h</>
                                ) : (
                                  <></>
                                )}{' '}
                                {layoverTime % 60}m
                              </>
                            )}
                          </span>
                        ) : (
                          <hr className='my-3 d-block' />
                        )
                      ) : (
                        <></>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {selectFare && showFF && !element.isOnlyFF && (
              <div className={`row pb-20 pl-5 y-gap-20 ${showMore ? 'mt-20' : ''}`}>
                {getArray(element.prices).map((price, priceIndex) => {
                  let str = <></>;
                  let usedName = price.name;
                  if (element.provider === 'aa') {
                    if (price.name === 'EC') {
                      usedName = 'SAVER';
                      str = (
                        <>
                          <p>
                            <span className='fw-bold'>Seating: </span>Chargeable
                          </p>
                          <p>
                            <span className='fw-bold'>XL Seating: </span>Chargeable
                          </p>
                          <p>
                            <span className='fw-bold'>Meals: </span>Chargeable
                          </p>
                          <p>
                            <span className='fw-bold'>Changes: </span>{' '}
                            {(3350).toLocaleString('en-IN', {
                              maximumFractionDigits: 0,
                              style: 'currency',
                              currency: 'INR',
                            })}{' '}
                            + Tax
                          </p>
                          <p>
                            <span className='fw-bold'>Cancellations: </span>{' '}
                            {(3600).toLocaleString('en-IN', {
                              maximumFractionDigits: 0,
                              style: 'currency',
                              currency: 'INR',
                            })}{' '}
                            + Tax
                          </p>
                          <p>
                            <span className='fw-bold'>
                              Priority Check In / Boarding:{' '}
                            </span>
                            NA
                          </p>
                          <p>
                            <span className='fw-bold'>Baggage: </span>
                            15KG
                          </p>
                        </>
                      );
                    } else if (price.name === 'AV') {
                      usedName = 'FLEXI';
                      str = (
                        <>
                          <p>
                            <span className='fw-bold'>Seating: </span>Chargeable
                          </p>
                          <p>
                            <span className='fw-bold'>XL Seating: </span>Chargeable
                          </p>
                          <p>
                            <span className='fw-bold'>Meals: </span>Chargeable
                          </p>
                          <p>
                            <span className='fw-bold'>Changes: </span> Free
                          </p>
                          <p>
                            <span className='fw-bold'>Cancellations: </span>{' '}
                            {(3600).toLocaleString('en-IN', {
                              maximumFractionDigits: 0,
                              style: 'currency',
                              currency: 'INR',
                            })}{' '}
                            + Tax
                          </p>
                          <p>
                            <span className='fw-bold'>
                              Priority Check In / Boarding:{' '}
                            </span>
                            NA
                          </p>
                          <p>
                            <span className='fw-bold'>Baggage: </span>
                            15KG
                          </p>
                        </>
                      );
                    }
                  } else if (element.provider === 'tj') {
                    let carrier = element.segments[0].flight.airline; //SG 6E
                    if (price.name === 'PUBLISHED') {
                      usedName = 'SAVER';
                      str = (
                        <>
                          <p>
                            <span className='fw-bold'>Seating: </span>Chargeable
                          </p>
                          <p>
                            <span className='fw-bold'>XL Seating: </span>Chargeable
                          </p>
                          <p>
                            <span className='fw-bold'>Meals: </span>Chargeable
                          </p>
                          <p>
                            <span className='fw-bold'>Changes: </span>{' '}
                            {(3500).toLocaleString('en-IN', {
                              maximumFractionDigits: 0,
                              style: 'currency',
                              currency: 'INR',
                            })}{' '}
                            + Tax
                          </p>
                          <p>
                            <span className='fw-bold'>Cancellations: </span>{' '}
                            {(3500).toLocaleString('en-IN', {
                              maximumFractionDigits: 0,
                              style: 'currency',
                              currency: 'INR',
                            })}{' '}
                            + Tax
                          </p>
                          <p>
                            <span className='fw-bold'>
                              Priority Check In / Boarding:{' '}
                            </span>
                            Chargeable
                          </p>
                          <p>
                            <span className='fw-bold'>Baggage: </span>
                            15KG
                          </p>
                        </>
                      );
                    } else if (price.name === 'FLEXI_PLUS') {
                      usedName = 'FLEXI PLUS';
                      str = (
                        <>
                          <p>
                            <span className='fw-bold'>Seating: </span>Included
                          </p>
                          <p>
                            <span className='fw-bold'>XL Seating: </span>
                            {carrier === 'SG' ? 'Included' : '50% Discount on Seat Fee'}
                          </p>
                          <p>
                            <span className='fw-bold'>Meals: </span>Included
                          </p>
                          <p>
                            <span className='fw-bold'>Changes: </span>
                            {carrier === 'SG' ? (
                              <>
                                {(3500).toLocaleString('en-IN', {
                                  maximumFractionDigits: 0,
                                  style: 'currency',
                                  currency: 'INR',
                                })}{' '}
                                + Tax
                              </>
                            ) : (
                              'Free'
                            )}
                          </p>
                          <p>
                            <span className='fw-bold'>Cancellations: </span>{' '}
                            {(3500).toLocaleString('en-IN', {
                              maximumFractionDigits: 0,
                              style: 'currency',
                              currency: 'INR',
                            })}{' '}
                            + Tax
                          </p>
                          <p>
                            <span className='fw-bold'>
                              Priority Check In / Boarding:{' '}
                            </span>
                            {carrier === 'SG' ? 'Included' : 'Chargeable'}
                          </p>
                          <p>
                            <span className='fw-bold'>Baggage: </span>
                            15KG
                          </p>
                        </>
                      );
                    }
                  } else if (element.provider === 'ad') {
                    usedName = price.description;
                    let inc = (
                      <>
                        <p>Includes:</p>
                        <ul className='list-disc'>
                          {price?.INC && price.INC.map((i) => <li className='capitalize'>{i.toLowerCase()}</li>)}
                        </ul>
                      </>
                    );
                    let cha = (
                      <>
                        <p>Chargeable:</p>
                        <ul className='list-disc'>
                          {price?.CHA && price.CHA.map((i) => <li className='capitalize'>{i.toLowerCase()}</li>)}
                        </ul>
                      </>
                    );
                    str = (
                      <>
                        <span className='d-block capitalize'>{price.majCabin?.replace('_', ' ') || ''}</span>
                        {inc}
                        {cha}
                      </>
                    );
                  }
                  return (
                    <div className={'fare-family-card col-lg-4 col-md-6 border-light' + (price === element.selectedFF ? ' bg-blue-1-05': '')}>
                      <div className='fw-bold d-flex justify-content-between capitalize'>
                        {usedName.split('_').map((str) => (
                          <>{str.toLowerCase()} </>
                        ))}
                        <span>
                          {price.total.toLocaleString('en-IN', {
                            maximumFractionDigits: 0,
                            style: 'currency',
                            currency: 'INR',
                          })}
                        </span>
                      </div>
                      <span>{str}</span>
                      <button
                        onClick={async () => {
                          if (setManip) {
                            element.selectedFF = price;
                            setManip((prev) => {
                              prev[manipIndex].selectedFF = price;
                              return [...prev];
                            });
                          }
                        }}
                        className='button -dark-1 px-30 h-40 bg-blue-1 text-white my-2'
                        disabled={price === element.selectedFF}
                      >
                        Select
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        {/* End collapase content */}
      </div>
      {/* End bg-white */}
    </div>
  );
}
export default FlightProperty;

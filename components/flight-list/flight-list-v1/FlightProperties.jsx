import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const FlightProperties = () => {
  const searchData = useSelector((state) => state.flightSearch.value.searchData);
  const [manip, setManip] = useState([]);
  const [currentTab, setCurrentTab] = useState('To');
  const airports = useSelector((state) => state.apis.value.airports);
  const travellerDOBS = useSelector((state) => state.flightSearch.value.travellerDOBS);

  /* TODO
  - TABS + Display according to tabs
  - Pagination
  - Date Change Take Care +1 or +2 incase landing is on the other day
  */

  // Manipulating Data
  useEffect(() => {
    if (searchData) {
      let temp = [];
      let counter = 1;
      for (let [key, value] of Object.entries(searchData)) {
        if (value) {
          for (let [secondKey, secondValue] of Object.entries(value)) {
            if (secondValue && secondValue?.length > 0) {
              for (let val of secondValue) {
                temp.push({
                  ...val,
                  ...{ provider: key, selectId: `collapse_${counter}`, type: secondKey },
                });
                counter += 1;
              }
            }
          }
        }
      }
      console.log(temp);
      setManip(temp);
    }
  }, [searchData]);

  return (
    <>
      {manip &&
        manip.length > 0 &&
        manip.map((element, index) => {
          // Pricing
          let total = 0;
          let infantPrice = 0;
          let childPrice = 0;
          let adultPrice = 0;
          if (element.provider === 'aa') {
            infantPrice = element.prices.prices?.CHD?.fare * travellerDOBS.INF;
            childPrice = element.prices.prices?.CHD?.fare * travellerDOBS.CHD;
            adultPrice = element.prices.prices?.ADT?.fare * travellerDOBS.ADT;
            total = infantPrice + childPrice + adultPrice;
          } else if (element.provider === 'tj') {
            infantPrice = element.prices.prices?.INFANT?.fare * travellerDOBS.INF;
            childPrice = element.prices.prices?.CHILD?.fare * travellerDOBS.CHD;
            adultPrice = element.prices.prices?.ADULT?.fare * travellerDOBS.ADT;
            total = infantPrice + childPrice + adultPrice;
          }
          return (
            <div className='js-accordion' key={index}>
              <div className='py-30 px-30 bg-white rounded-4 base-tr mt-30'>
                <div className='row y-gap-30 justify-between'>
                  <div className='col'>
                    {element.segments.map((segment) => {
                      let duration;
                      if (segment.journey) {
                        duration = segment.journey.duration;
                      } else {
                        duration =
                          (new Date(segment.arrival.time).getTime() -
                            new Date(segment.departure.time).getTime()) /
                          60000;
                      }
                      let hours = Math.floor(duration / 60);
                      let minutes = duration % 60;
                      return (
                        <div className='row y-gap-10 items-center'>
                          <div className='col-sm-auto'>
                            <img
                              className='size-40'
                              src='/img/flightIcons/1.png'
                              alt='image'
                            />
                          </div>
                          <div className='col'>
                            <div className='row x-gap-20 items-end'>
                              <div className='col-auto'>
                                <div className='lh-15 fw-500'>
                                  {element.provider === 'aa' &&
                                    segment.departure.time.slice(-8, -3)}
                                  {element.provider === 'tj' &&
                                    segment.departure.time.slice(-5)}
                                </div>
                                <div className='text-15 lh-15 text-light-1'>
                                  {segment.departure.airport.code}
                                </div>
                              </div>
                              <div className='col text-center'>
                                <div className='flightLine'>
                                  <div />
                                  <div />
                                </div>
                                {element.segments.length === 1 && (
                                  <div className='text-15 lh-15 text-light-1 mt-10'>
                                    Nonstop
                                  </div>
                                )}
                              </div>
                              <div className='col-auto'>
                                <div className='lh-15 fw-500'>
                                  {element.provider === 'aa' &&
                                    segment.arrival.time.slice(-8, -3)}
                                  {element.provider === 'tj' &&
                                    segment.arrival.time.slice(-5)}
                                </div>
                                <div className='text-15 lh-15 text-light-1'>
                                  {segment.arrival.airport.code}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className='col-md-auto'>
                            <div className='text-15 text-light-1 px-20 md:px-0'>
                              {hours}h {minutes}m
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                  </div>
                  {/* End .col */}
                  <div className='col-md-auto'>
                    <div className='d-flex items-center h-full'>
                      <div className='pl-30 border-left-light h-full md:d-none' />
                      <div>
                        <div className='text-right md:text-left mb-10'>
                          <div className='text-18 lh-16 fw-500'>
                            INR{' '}
                            {total.toLocaleString('en-IN', {
                              maximumFractionDigits: 2,
                              style: 'currency',
                              currency: 'INR',
                            })}
                          </div>
                          {infantPrice > 0 && (
                            <div className='text-15 lh-16 text-light-1'>
                              {travellerDOBS.INF}x Infant -{' '}
                              {infantPrice.toLocaleString('en-IN', {
                                maximumFractionDigits: 2,
                                style: 'currency',
                                currency: 'INR',
                              })}
                            </div>
                          )}
                          {childPrice > 0 && (
                            <div className='text-15 lh-16 text-light-1'>
                              {travellerDOBS.CHD}x Child -{' '}
                              {childPrice.toLocaleString('en-IN', {
                                maximumFractionDigits: 2,
                                style: 'currency',
                                currency: 'INR',
                              })}
                            </div>
                          )}
                          {adultPrice > 0 && (
                            <div className='text-15 lh-16 text-light-1'>
                              {travellerDOBS.ADT}x Adult -{' '}
                              {adultPrice.toLocaleString('en-IN', {
                                maximumFractionDigits: 2,
                                style: 'currency',
                                currency: 'INR',
                              })}
                            </div>
                          )}
                        </div>
                        <div className='accordion__button'>
                          <button
                            className='button -dark-1 px-30 h-50 bg-blue-1 text-white'
                            data-bs-toggle='collapse'
                            data-bs-target={`#${element.selectId}`}
                          >
                            View Deal <div className='icon-arrow-top-right ml-15' />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* End .col-md-auto */}
                </div>
                {/* End .row */}
                <div className=' collapse' id={element.selectId}>
                  {element.segments.map((segment) => {
                    let duration;
                    if (segment.journey) {
                      duration = segment.journey.duration;
                    } else {
                      duration =
                        (new Date(segment.arrival.time).getTime() -
                          new Date(segment.departure.time).getTime()) /
                        60000;
                    }
                    let hours = Math.floor(duration / 60);
                    let minutes = duration % 60;

                    const departureDate = new Date(segment.departure.time).toString();

                    let departureAirport;
                    let arrivalAirport;
                    for (let airport of airports) {
                      if (segment.departure.airport.code === airport.iata_code)
                        departureAirport = airport.name;
                      if (segment.arrival.airport.code === airport.iata_code)
                        arrivalAirport = airport.name;
                    }

                    return (
                      <div className='border-light rounded-4 mt-30'>
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
                                  <img src='/img/flights/1.png' alt='image' />
                                </div>
                                <div className='text-14 text-light-1'>
                                  Pegasus Airlines {segment.flight.number}
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
                                          segment.arrival.time.slice(-5)}
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
                              <div className='text-14 text-light-1'>Economy</div>
                              <div className='text-14 mt-15 md:mt-5'>
                                Airbus A320neo (Narrow-body jet)
                                <br />
                                Wi-Fi available
                                <br />
                                USB outlet
                              </div>
                            </div>
                          </div>
                        </div>
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

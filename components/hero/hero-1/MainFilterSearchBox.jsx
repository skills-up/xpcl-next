import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import AirportSearch from '../../flight-list/common/AirportSearch';
import GuestSearch from '../../flight-list/flight-list-v1/GuestSearch';
import LocationSearch from '../../hotel-list/common/LocationSearch';
import GuestSearchHotel from '../../hotel-list/common/GuestSearch';
import { useDispatch, useSelector } from 'react-redux';
import { sendToast } from '../../../utils/toastify';
import checkAirportCache from '../../../utils/airportCacheValidity';
import { hotelSearchData } from '../../../data/hotelSearchData';

const MainFilterSearchBox = () => {
  const tabs = ['Flights', 'Hotels'];
  const [tab, setTab] = useState('Flights');
  const router = useRouter();
  // Hotel
  const [location, setLocation] = useState(null);
  const [locationOptions, setLocationOptions] = useState([]);
  const [date, setDate] = useState([new DateObject(), new DateObject().add(1, 'days')]);
  const [roomsData, setRoomsData] = useState([{ adults: 1, child: [] }]);

  useEffect(() => {
    if (hotelSearchData) setLocationOptions(hotelSearchData);
  }, [hotelSearchData]);

  const hotelSearch = async () => {
    if (!location?.value) {
      sendToast('error', 'Please select Location', 4000);
      return;
    }
    for (let room of roomsData) {
      if (room.adults === 0) {
        sendToast('error', 'Each room should have an adult', 4000);
        return;
      }
      if (room.adults + room.child.length > 5) {
        sendToast('error', 'Each room can have a maximum of 5 guests', 4000);
        return;
      }
    }
    const data = encodeURIComponent(
      JSON.stringify({
        roomsData,
        location,
        date,
      })
    );
    router.push({
      pathname: 'hotel/hotel-list-v1',
      query: {
        data,
      },
    });
  };

  // Airlines
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [preferredCabin, setPrefferedCabin] = useState({ value: 'Economy' });
  const [departDate, setDepartDate] = useState(new DateObject());
  const [returnDate, setReturnDate] = useState(new DateObject());
  const [returnFlight, setReturnFlight] = useState(true);
  const [airportOptions, setAirportOptions] = useState([]);
  const [guestCounts, setGuestCounts] = useState({
    Adults: 1,
    Children: 0,
    Infants: 0,
  });
  const airports = useSelector((state) => state.apis.value.airports);
  const token = useSelector((state) => state.auth.value.token);
  const dispatch = useDispatch();

  useEffect(() => {
    // dispatch(setInitialState());
    if (token !== '') {
      checkAirportCache(dispatch);
      getFlightData();
    }
  }, []);

  const getFlightData = async () => {
    if (airports && airports?.length > 0) setAirportOptions(airports.map((e) => e));
  };

  const flightSearch = async () => {
    if (!to?.value) {
      sendToast('error', 'Please select your destination', 4000);
      return;
    }
    if (!from?.value) {
      sendToast('error', 'Please select your departure destination', 4000);
      return;
    }
    if (!departDate) {
      sendToast('error', 'Please select your departure date', 4000);
      return;
    }
    if (returnFlight && !returnDate) {
      sendToast('error', 'Please select your return date', 4000);
      return;
    }
    if (!guestCounts || guestCounts?.Adults === 0) {
      sendToast('error', 'One adult passenger is mandatory', 4000);
      return;
    }
    const data = encodeURIComponent(
      JSON.stringify({
        to,
        from,
        guestCounts,
        preferredCabin,
        returnFlight,
        departDate,
        returnDate,
      })
    );
    router.push({
      pathname: 'flight/flight-list-v1',
      query: {
        data,
      },
    });
  };

  return (
    <>
      <div className='tabs__controls d-flex x-gap-30 y-gap-20 justify-center sm:justify-start js-tabs-controls'>
        {tabs?.map((t, index) => (
          <button
            key={index}
            className={`tabs__button text-15 fw-500 text-white pb-4 js-tabs-button ${
              t === tab ? 'is-tab-el-active' : ''
            }`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Hotel */}
      {tab === 'Hotels' && (
        <div className='position-relative mt-30 md:mt-20 js-tabs-content'>
          <div className='mainSearch -col-3-big2 bg-white px-10 py-10 lg:px-20 lg:pt-5 lg:pb-20 rounded-100 border-light'>
            <div className='button-grid items-center'>
              <div className='searchMenu-loc px-30 lg:py-20 lg:px-0 js-form-dd js-liverSearch'>
                <h4 className='text-15 fw-500 ls-2 lh-16'>Location</h4>
                <LocationSearch
                  value={location}
                  setValue={setLocation}
                  options={hotelSearchData}
                  locations={[locationOptions, setLocationOptions]}
                  placeholder='Search City or Location'
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      border: 'none',
                      boxShadow: 'none',
                      minHeight: '20px !important',
                      ':hover': {
                        border: 'none',
                        boxShadow: 'none',
                      },
                    }),
                    valueContainer: (styles) => ({
                      ...styles,
                      padding: 0,
                      height: '25px',
                    }),
                    indicatorsContainer: (styles) => ({
                      ...styles,
                      display: 'none',
                    }),
                    input: (styles) => ({
                      ...styles,
                      margin: '0',
                      padding: '0',
                      lineHeight: '1rem',
                    }),
                  }}
                />
              </div>
              {/* End Location */}

              <div className='searchMenu-date px-30 lg:py-20 lg:px-0 js-form-dd js-calendar'>
                <div>
                  <h4 className='text-15 fw-500 ls-2 lh-16'>Check in - Check out</h4>
                  <DatePicker
                    range
                    rangeHover
                    style={{ fontSize: '1rem' }}
                    inputClass='custom_input-picker'
                    containerClassName='custom_container-picker'
                    value={date}
                    onChange={(i) => {
                      setDate(i);
                    }}
                    numberOfMonths={2}
                    offsetY={10}
                    format='DD MMM YY'
                    minDate={new DateObject()}
                  />
                </div>
              </div>
              {/* End check-in-out */}

              <GuestSearchHotel guestRoomsData={[roomsData, setRoomsData]} />
              {/* End guest */}

              <div className='button-item'>
                <button
                  className='mainSearch__submit button -dark-1 h-60 px-35 col-12 rounded-100 bg-blue-1 text-white'
                  onClick={hotelSearch}
                >
                  <i className='icon-search text-20 mr-10' />
                  Search
                </button>
              </div>
              {/* End search button_item */}
            </div>
          </div>
          {/* End .mainSearch */}
        </div>
      )}

      {/* Airline */}
      {tab === 'Flights' && (
        <div className='position-relative mt-30 md:mt-20 js-tabs-content'>
          <div className='mainSearch -col-6-big bg-white px-10 py-10 lg:px-20 lg:pt-5 lg:pb-20 rounded-100 border-light'>
            <div className='button-grid items-center'>
              <div className='searchMenu-flight pl-30 pr-10 lg:py-10 lg:px-0 js-form-dd js-liverSearch'>
                <h4 className='text-15 fw-500 ls-2 lh-16'>From</h4>
                <AirportSearch
                  airports={[airportOptions, setAirportOptions]}
                  value={from}
                  setValue={setFrom}
                  options={airports}
                  className=''
                  placeholder='Departing'
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      border: 'none',
                      boxShadow: 'none',
                      minHeight: '20px !important',
                      ':hover': {
                        border: 'none',
                        boxShadow: 'none',
                      },
                    }),
                    valueContainer: (styles) => ({
                      ...styles,
                      padding: 0,
                      height: '25px',
                    }),
                    indicatorsContainer: (styles) => ({
                      ...styles,
                      display: 'none',
                    }),
                    input: (styles) => ({
                      ...styles,
                      margin: '0',
                      padding: '0',
                      lineHeight: '1rem',
                    }),
                  }}
                />
              </div>
              <div className='searchMenu-flight px-10 lg:py-10 lg:px-0 js-form-dd js-liverSearch'>
                <h4 className='text-15 fw-500 ls-2 lh-16'>To</h4>
                <AirportSearch
                  value={to}
                  airports={[airportOptions, setAirportOptions]}
                  setValue={setTo}
                  options={airports}
                  className=''
                  placeholder='Arrival'
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      border: 'none',
                      boxShadow: 'none',
                      minHeight: '20px !important',
                      ':hover': {
                        border: 'none',
                        boxShadow: 'none',
                      },
                    }),
                    valueContainer: (styles) => ({
                      ...styles,
                      padding: 0,
                      height: '25px',
                    }),
                    indicatorsContainer: (styles) => ({
                      ...styles,
                      display: 'none',
                    }),
                    input: (styles) => ({
                      ...styles,
                      margin: '0',
                      padding: '0',
                      lineHeight: '1rem',
                    }),
                  }}
                />
              </div>
              {/* End Location */}
              <div className='searchMenu-flight px-10 lg:py-10 lg:px-0 js-form-dd js-liverSearch'>
                <h4 className='text-15 fw-500 ls-2 lh-16'>Passengers</h4>
                <GuestSearch
                  guests={[guestCounts, setGuestCounts]}
                  cabins={[preferredCabin, setPrefferedCabin]}
                />
              </div>
              <div className='searchMenu-flight px-10 lg:py-10 lg:px-0 js-form-dd js-liverSearch'>
                <h4 className='text-15 fw-500 ls-2 lh-16'>Trip</h4>
                <div className='dropdown js-dropdown'>
                  <div
                    className=' d-flex text-secondary items-center text-15'
                    data-bs-toggle='dropdown'
                    data-bs-auto-close='true'
                    data-bs-offset='0,0'
                    style={{ lineHeight: '1.5rem' }}
                  >
                    <span className='js-dropdown-title text-16 d-flex items-center gap-1'>
                      {returnFlight ? 'Round Trip' : 'One Way'}
                    </span>
                    {/* <i className='icon icon-chevron-sm-down text-7 ml-10' /> */}
                  </div>
                  <div className='toggle-element -dropdown js-click-dropdown dropdown-menu'>
                    <div className='text-14 y-gap-15 js-dropdown-list'>
                      <div>
                        <div>
                          <div
                            role='button'
                            className={`${
                              !returnFlight ? 'text-blue-1 ' : ''
                            }d-block js-dropdown-link`}
                            onClick={() => {
                              setReturnFlight(false);
                              setReturnDate(null);
                            }}
                          >
                            One Way
                          </div>
                        </div>
                        <div
                          role='button'
                          className={`mt-10 ${
                            returnFlight ? 'text-blue-1 ' : ''
                          }d-block js-dropdown-link`}
                          onClick={() => {
                            setReturnFlight(true);
                            setReturnDate(departDate);
                          }}
                        >
                          Round Trip
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='searchMenu-flight px-10 lg:py-10 lg:px-0 js-form-dd js-calendar'>
                <h4 className='text-15 fw-500 ls-2 lh-16'>Depart Date</h4>
                <DatePicker
                  style={{ fontSize: '1rem', marginBottom: '0.1rem' }}
                  inputClass='custom_input-picker '
                  containerClassName='custom_container-picker'
                  value={departDate}
                  onChange={(i) => {
                    setDepartDate(i);
                    if (returnDate?.valueOf() < i?.valueOf()) setReturnDate(i);
                  }}
                  numberOfMonths={1}
                  offsetY={10}
                  format='DD MMM YYYY'
                  minDate={new DateObject()}
                />
              </div>
              <div className='searchMenu-flight px-10 lg:py-10 lg:px-0 js-form-dd js-calendar'>
                <h4 className='text-15 fw-500 ls-2 lh-16'>Return Date</h4>
                <div className='text-center'>
                  <DatePicker
                    style={{ fontSize: '1rem', marginBottom: '0.1rem' }}
                    inputClass='custom_input-picker'
                    containerClassName='custom_container-picker'
                    value={returnDate}
                    onChange={setReturnDate}
                    numberOfMonths={1}
                    offsetY={10}
                    format='DD MMM YYYY'
                    minDate={departDate}
                  />
                </div>
              </div>
              {/* End check-in-out */}

              <div className='button-item'>
                <button
                  className='mainSearch__submit button -dark-1 h-60 px-35 col-12 rounded-100 bg-blue-1 text-white'
                  onClick={flightSearch}
                >
                  <i className='icon-search text-20 mr-10' />
                  Search
                </button>
              </div>
              {/* End search button_item */}
            </div>
          </div>
        </div>
      )}

      {/* End serarchbox tab-content */}
    </>
  );
};

export default MainFilterSearchBox;

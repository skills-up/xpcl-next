import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { MdFlightLand, MdFlightTakeoff } from 'react-icons/md';
import { RiArrowLeftRightFill, RiArrowRightLine } from 'react-icons/ri';
import { SlCalender } from 'react-icons/sl';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { useDispatch, useSelector } from 'react-redux';
import LoadingBar from 'react-top-loading-bar';
import { customAPICall, getList } from '../../../api/xplorzApi';
import {
  setAirlineOrgs,
  setClientTravellers as setClientTravellersRedux,
  setDestinations,
  setInitialSearchData,
  setInitialState,
  setReturnFlight as setReturnFlightRedux,
  setSearchData,
  setTravellerDOBS,
  setTravellers as setTravellersRedux,
} from '../../../features/flightSearch/flightSearchSlice';
import checkAirportCache from '../../../utils/airportCacheValidity';
import { checkUser } from '../../../utils/checkTokenValidity';
import { sendToast } from '../../../utils/toastify';
import Seo from '../../common/Seo';
import AirportSearch from '../common/AirportSearch';
import GuestSearch from './GuestSearch';

const MainFilterSearchBox = () => {
  const [directFlight, setDirectFlight] = useState(false);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [preferredCabin, setPrefferedCabin] = useState({ value: 'Economy' });
  const [travellers, setTravellers] = useState([]);
  const [preferredAirlines, setPreferredAirlines] = useState([]);
  const [departDate, setDepartDate] = useState(new DateObject());
  const [returnDate, setReturnDate] = useState(new DateObject());
  const [returnFlight, setReturnFlight] = useState(true);
  const [clientTravellers, setClientTravellers] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [airportOptions, setAirportOptions] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isSearched, setIsSearched] = useState(false);
  const [guestCounts, setGuestCounts] = useState({
    Adults: 1,
    Children: 0,
    Infants: 0,
  });
  const [SEO, setSEO] = useState('Flight Search');

  const [autoSearch, setAutoSearch] = useState(false);

  const destinations = useSelector((state) => state.flightSearch.value.destinations);
  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector((state) => state.auth.value.token);
  const airports = useSelector((state) => state.apis.value.airports);
  const client_id = useSelector((state) => state.auth.value.currentOrganization);
  const travellerDOBS = useSelector((state) => state.flightSearch.value.travellerDOBS);

  useEffect(() => {
    if (to && from && router.query?.data && !autoSearch) {
      search();
      setAutoSearch(true);
    }
  }, [to, from]);

  useEffect(() => {
    dispatch(setInitialState());
    if (router.isReady)
      if (token !== '') {
        checkUser(router, dispatch);
        checkAirportCache(dispatch);
        getData();
      } else {
        sendToast('error', 'You must be logged in in order to view this page', 8000);
        router.push('/');
      }
  }, [router.isReady]);

  const getData = async () => {
    if (airports && airports?.length > 0) setAirportOptions(airports.map((e) => e));
    const clientTravellers = await getList('client-travellers', {
      client_id,
    });
    const airlines = await getList('organizations', { is_airline: 1 });
    if (clientTravellers?.success && airlines?.success) {
      // if (airlines?.success) {
      dispatch(setAirlineOrgs({ airlineOrgs: airlines.data }));
      dispatch(setClientTravellersRedux({ clientTravellers: clientTravellers.data }));
      // setClientTravellers(
      //   clientTravellers.data.map((element) => ({
      //     value: element.id,
      //     label: element.traveller_name,
      //     traveller_id: element.traveller_id,
      //   }))
      // );
      setAirlines(
        airlines.data.map((element) => ({
          value: element.id,
          label: element.name,
          code: element.code,
        }))
      );
      if (router.query?.data) {
        try {
          const data = await JSON.parse(decodeURIComponent(router.query.data));
          setGuestCounts(data.guestCounts);
          setPrefferedCabin(data.preferredCabin);
          setReturnFlight(data.returnFlight);
          if (data.departDate) setDepartDate(new DateObject({ date: data.departDate }));
          if (data.returnDate) setReturnDate(new DateObject({ date: data.returnDate }));
          else setReturnDate(null);
          setTo(data.to);
          setFrom(data.from);
        } catch (err) {}
      }
    } else {
      sendToast('error', 'Error getting data', 4000);
    }
  };

  const searchF = () => {
    setIsSearched(false);
  };

  const search = async () => {
    setIsSearched(true);
    // Checking if all mandatory fields are filled
    if (!to?.value) {
      sendToast('error', 'Please select your destination', 4000);
      searchF();
      return;
    }
    if (!from?.value) {
      sendToast('error', 'Please select your departure destination', 4000);
      searchF();
      return;
    }
    if (!departDate) {
      sendToast('error', 'Please select your departure date', 4000);
      searchF();
      return;
    }
    if (returnFlight && !returnDate) {
      sendToast('error', 'Please select your return date', 4000);
      searchF();
      return;
    }
    // if (!travellers || travellers?.length === 0) {
    //   sendToast('error', 'Please select travellers', 4000);
    //   searchF();
    //   return;
    // }
    if (!guestCounts || guestCounts?.Adults === 0) {
      sendToast('error', 'One adult passenger is mandatory', 4000);
      searchF();
      return;
    }
    // Getting Traveller DOBS
    let pax = {
      ADT: guestCounts.Adults,
      CHD: guestCounts.Children || undefined,
      INF: guestCounts.Infants || undefined,
    };
    // const traveller_ids = travellers.map((el) => el.traveller_id);
    // const travellerDetails = await getList('travellers', { traveller_ids });
    // if (travellerDetails?.success) {
    //   let currentTime = +Date.now();
    //   for (let traveller of travellerDetails.data) {
    //     if (traveller?.passport_dob) {
    //       const age = (
    //         (currentTime -
    //           +new DateObject({
    //             date: traveller.passport_dob,
    //             format: 'YYYY-MM-DD',
    //           })
    //             .toDate()
    //             .getTime()) /
    //         31536000000
    //       ).toFixed(2);
    //       // If below 2 years of age, infant
    //       if (age < 2) INF += 1;
    //       // If above 2 but below 12, child
    //       if (age >= 2 && age < 12) CHD += 1;
    //       // If above 12 years, consider adult
    //       if (age >= 12) ADT += 1;
    //     } else {
    //       ADT += 1;
    //     }
    //   }
    //   if (ADT > 0) pax['ADT'] = ADT;
    //   else {
    //     sendToast('error', 'There must be an Adult traveller', 4000);
    //     searchF();
    //     return;
    //   }
    //   if (CHD > 0) pax['CHD'] = CHD;
    //   if (INF > 0) pax['INF'] = INF;
    // } else {
    //   sendToast('error', 'Error getting traveller details', 4000);
    //   searchF();
    //   return;
    // }
    // Resetting Search Data
    dispatch(setInitialSearchData());
    // Checking for domestic
    let domestic = true;
    if (from?.label && to?.label) {
      if (
        to?.label?.split('|')?.at(-1) !== 'India' ||
        from?.label?.split('|')?.at(-1) !== 'India'
      ) {
        domestic = false;
      }
    }
    // Formulating Request
    let request = {
      pax,
      directOnly: directFlight,
      preferredCarriers: preferredAirlines.map((el) => el?.code).filter((el) => el),
      sectors: [
        {
          from: from?.value,
          to: to?.value,
          date: departDate.format('YYYY-MM-DD'),
        },
      ],
    };
    if (preferredCabin?.value) {
      if (preferredCabin.value === 'Premium Economy')
        request['cabinType'] = 'PREMIUM_ECONOMY';
      else request['cabinType'] = preferredCabin.value.toUpperCase();
    }
    if (returnFlight && !domestic) {
      request.sectors.push({
        from: to?.value,
        to: from?.value,
        date: returnDate.format('YYYY-MM-DD'),
      });
    }
    // Return Request
    let returnRequest = {
      ...request,
      sectors: [
        {
          from: to?.value,
          to: from?.value,
          date: returnDate?.format('YYYY-MM-DD'),
        },
      ],
    };
    let tempSearchData = { aa: null, tj: null, ad: null };
    let callsCounter = 2;
    if (returnFlight && domestic) {
      callsCounter = 4;
    }
    let currentCalls = 0;
    // Redux Values Update
    dispatch(
      setTravellerDOBS({
        ADT: guestCounts.Adults,
        CHD: guestCounts.Children,
        INF: guestCounts.Infants,
      })
    );
    dispatch(setReturnFlightRedux({ returnFlight }));
    dispatch(setTravellersRedux({ travellers }));
    dispatch(
      setDestinations({
        to,
        from,
        departDate: departDate.format('YYYY-MM-DD'),
        returnDate: returnFlight ? returnDate.format('YYYY-MM-DD') : null,
      })
    );
    // Akasa
    // To
    customAPICall('aa/v1/search', 'post', request, {}, true)
      .then(async (res) => {
        if (res?.success) {
          if (returnFlight && domestic) {
            if (tempSearchData?.aa?.from) {
              res.data.from = tempSearchData.aa.from;
            }
          }
          tempSearchData = { ...tempSearchData, aa: res.data };
          updateSEO();
        }
      })
      .catch((err) => console.error(err))
      .then(() => dispatchCalls(tempSearchData, callsCounter, (currentCalls += 1)));
    // From
    if (returnFlight && domestic) {
      customAPICall('aa/v1/search', 'post', returnRequest, {}, true)
        .then(async (res) => {
          if (res?.success) {
            res.data.from = res.data.to;
            res.data.to = null;
            if (tempSearchData?.aa?.to) {
              res.data.to = tempSearchData.aa.to;
            }
            tempSearchData = { ...tempSearchData, aa: res.data };
            updateSEO();
          }
        })
        .catch((err) => console.error(err))
        .then(() => dispatchCalls(tempSearchData, callsCounter, (currentCalls += 1)));
    }
    // Tripjack
    // To
    customAPICall('tj/v1/search', 'post', request, {}, true)
      .then(async (res) => {
        if (res?.success) {
          if (returnFlight && domestic) {
            if (tempSearchData?.tj?.from) {
              res.data.from = tempSearchData.tj.from;
            }
          }
          tempSearchData = { ...tempSearchData, tj: res.data };
          updateSEO();
        }
      })
      .catch((err) => console.error(err))
      .then(() => dispatchCalls(tempSearchData, callsCounter, (currentCalls += 1)));
    // From
    if (returnFlight && domestic) {
      customAPICall('tj/v1/search', 'post', returnRequest, {}, true)
        .then(async (res) => {
          if (res?.success) {
            res.data.from = res.data.to;
            res.data.to = null;
            if (tempSearchData?.tj?.to) {
              res.data.to = tempSearchData.tj.to;
            }
            tempSearchData = { ...tempSearchData, tj: res.data };
            updateSEO();
          }
        })
        .catch((err) => console.error(err))
        .then(() => dispatchCalls(tempSearchData, callsCounter, (currentCalls += 1)));
    }
  };

  const dispatchCalls = async (searchData, callsCounter, currentCalls) => {
    dispatch(setSearchData(searchData));
    let percentage = (currentCalls / callsCounter) * 100;
    if (percentage === 100) {
      searchF();
      const el = document.getElementById('flight-properties');
      if (el) {
        setTimeout(() => el.scrollIntoView(), 750);
      }
    }
    setProgress(percentage);
  };

  const updateSEO = () => {
    setSEO(
      `Flight Search Results | ${
        returnFlight
          ? to?.label?.split('|')?.at(1) +
            ' - ' +
            from?.label?.split('|')?.at(1) +
            ' - ' +
            to?.label?.split('|')?.at(1) +
            ' Roundtrip'
          : from?.label?.split('|')?.at(1) +
            ' - ' +
            to?.label?.split('|')?.at(1) +
            ', ' +
            departDate?.format('DD MMMM')
      }`
    );
  };

  const searchData = useSelector((state) => state.flightSearch.value.searchData);

  return (
    <div className=''>
      <Seo pageTitle={SEO} />
      {/* <div className='row y-gap-20 items-center'>
        <FilterSelect />
      </div> */}
      {/* End .row */}
      <LoadingBar
        height={3}
        color='#3554d1'
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
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
              disabled={isSearched}
              onClick={search}
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
  );
};

export default MainFilterSearchBox;

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

  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector((state) => state.auth.value.token);
  console.log('token', token);
  const airports = useSelector((state) => state.apis.value.airports);
  const client_id = useSelector((state) => state.auth.value.currentOrganization);
  const travellerDOBS = useSelector((state) => state.flightSearch.value.travellerDOBS);

  useEffect(() => {
    // dispatch(setInitialState());
    if (token !== '') {
      checkUser(router, dispatch);
      checkAirportCache(dispatch);
      getData();
    } else {
      sendToast('error', 'You must be logged in in order to view this page', 8000);
      router.push('/');
    }
  }, []);

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
          from: from?.iata,
          to: to?.iata,
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
        from: to?.iata,
        to: from?.iata,
        date: returnDate.format('YYYY-MM-DD'),
      });
    }
    // Return Request
    let returnRequest = {
      ...request,
      sectors: [
        {
          from: to?.iata,
          to: from?.iata,
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
  useEffect(() => console.log('sd', searchData), [searchData]);

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
      <div className='border-light rounded-4 pr-20 py-20 lg:px-10 lg:pt-5 lg:pb-20 mt-15'>
        <div className='flight-search pl-20 lg:pl-0'>
          {/* Round Trip */}
          <div className='row items-center y-gap-10'>
            <div className='col-xxl-3 col-xl-5 col-6 ml-6 d-flex items-center'>
              <div className='dropdown js-dropdown'>
                <div
                  className='dropdown__button d-flex items-center text-15'
                  data-bs-toggle='dropdown'
                  data-bs-auto-close='true'
                  data-bs-offset='0,0'
                >
                  <span className='js-dropdown-title text-16 d-flex items-center gap-1'>
                    {returnFlight ? (
                      <RiArrowLeftRightFill className='text-25' />
                    ) : (
                      <RiArrowRightLine className='text-25' />
                    )}{' '}
                    {returnFlight ? 'Round Trip' : 'One Way'}
                  </span>
                  <i className='icon icon-chevron-sm-down text-7 ml-10' />
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
                          onClick={() => setReturnFlight(false)}
                        >
                          One Way
                        </div>
                      </div>
                      <div
                        role='button'
                        className={`mt-10 ${
                          returnFlight ? 'text-blue-1 ' : ''
                        }d-block js-dropdown-link`}
                        onClick={() => setReturnFlight(true)}
                      >
                        Round Trip
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-auto d-flex justify-center items-center'>
              <GuestSearch
                guests={[guestCounts, setGuestCounts]}
                cabins={[preferredCabin, setPrefferedCabin]}
              />
            </div>
          </div>
          {/* <div className='d-flex items-center gap-2 justify-center mt-30 lg:mt-0'>
            <label>One Way</label>
            <ReactSwitch
              onChange={() => setReturnFlight((prev) => !prev)}
              checked={returnFlight}
              uncheckedIcon={false}
              checkedIcon={false}
              offColor='#080'
            />
            <label>Return Trip</label>
          </div> */}
          {/* <div className='flight-search-select'>
            <label>Preferred Cabin</label>
            <Select
              options={cabinOptions.map((el) => ({ label: el, value: el }))}
              value={preferredCabin}
              placeholder='Search..'
              onChange={(id) => setPrefferedCabin(id)}
            />
          </div> */}
          {/* <div className='flight-search-select'>
            <label>
              Travellers<span className='text-danger'>*</span>
            </label>
            <Select
              options={clientTravellers}
              value={travellers}
              isMulti
              placeholder='Search..'
              onChange={(values) => setTravellers(values)}
            />
          </div> */}
          {/* <div className='flight-search-select'>
            <label>Airlines</label>
            <Select
              options={airlines}
              value={preferredAirlines}
              isMulti
              placeholder='Search..'
              onChange={(values) => setPreferredAirlines(values)}
            />
          </div> */}
          <div className='row'>
            <div className='flight-search-select col-lg-6 col-12 d-flex'>
              <div className='col-lg-6 col-12 border-light px-2 d-flex items-center gap-1'>
                <MdFlightTakeoff className='text-25 col-1' />
                <AirportSearch
                  airports={[airportOptions, setAirportOptions]}
                  value={from}
                  setValue={setFrom}
                  options={airports}
                  className='col-11'
                  placeholder='From'
                />
              </div>
              <div className='col-lg-6 col-12 border-light px-2 d-flex items-center gap-1'>
                <MdFlightLand className='text-25 col-1' />
                <AirportSearch
                  value={to}
                  airports={[airportOptions, setAirportOptions]}
                  setValue={setTo}
                  options={airports}
                  className='col-11'
                  placeholder='To'
                />
              </div>
              {/* <TbArrowsExchange2 className='exchange-icon' /> */}
            </div>
            <div className='col-lg-6 col-12 d-flex'>
              {/* End Location Flying To */}
              <div
                className='flight-date-picker col-lg-7 col-6'
                style={{ border: '1px solid lightgray' }}
              >
                <div className='text-center'>
                  {!departDate && (
                    <label className='d-flex gap-2 items-center'>
                      <SlCalender className='text-20 mb-1' /> Depart
                    </label>
                  )}
                  <DatePicker
                    style={{ fontSize: '1rem' }}
                    inputClass='custom_input-picker text-center'
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
                {returnFlight && <hr />}
                {/* End Depart */}
                {returnFlight && (
                  <div className='text-center'>
                    {!returnDate && (
                      <label className='d-flex gap-2 items-center'>
                        <SlCalender className='text-20 mb-1' /> Return
                      </label>
                    )}
                    <DatePicker
                      style={{ fontSize: '1rem' }}
                      inputClass='custom_input-picker text-center'
                      containerClassName='custom_container-picker'
                      value={returnDate}
                      onChange={setReturnDate}
                      numberOfMonths={1}
                      offsetY={10}
                      format='DD MMM YYYY'
                      minDate={departDate}
                    />
                  </div>
                )}
              </div>
              {/* End Return */}
              {/* <div>
            <div className='pl-5 d-flex mt-30 gap-2 justify-center lg:mt-0 items-center'>
              <label>Direct Flight</label>
              <ReactSwitch
                onChange={() => setDirectFlight((prev) => !prev)}
                checked={directFlight}
              />
            </div>
            </div> */}
              {/* End guest */}

              {/* End search button_item */}
              <button
                disabled={isSearched}
                className='mainSearch__submit button -blue-1 py-15 h-60 col-lg-5 col-6 rounded-4 bg-dark-3 text-white d-flex items-center'
                onClick={search}
              >
                <i className='icon-search text-18 mr-10 mb-1' />
                <span className='text-18'>Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* End .mainSearch */}
    </div>
  );
};

export default MainFilterSearchBox;

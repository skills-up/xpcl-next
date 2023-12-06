import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
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
} from '../../../features/flightSearch/flightSearchSlice';
import checkAirportCache from '../../../utils/airportCacheValidity';
import { checkUser } from '../../../utils/checkTokenValidity';
import { sendToast } from '../../../utils/toastify';
import Seo from '../../common/Seo';
import AirportSearch from '../common/AirportSearch';
import GuestSearch from './GuestSearch';

const MainFilterSearchBox = () => {
  // const [directFlight, setDirectFlight] = useState(false);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [preferredCabin, setPrefferedCabin] = useState({ value: 'Any' });
  // const [travellers, setTravellers] = useState([]);
  // const [preferredAirlines, setPreferredAirlines] = useState([]);
  const [departDate, setDepartDate] = useState(new DateObject());
  const [returnDate, setReturnDate] = useState(new DateObject());
  const [returnFlight, setReturnFlight] = useState(true);
  // const [clientTravellers, setClientTravellers] = useState([]);
  // const [airlines, setAirlines] = useState([]);
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

  // const destinations = useSelector((state) => state.flightSearch.value.destinations);
  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector((state) => state.auth.value.token);
  const airports = useSelector((state) => state.apis.value.airports);
  const client_id = useSelector((state) => state.auth.value.currentOrganization);
  // const travellerDOBS = useSelector((state) => state.flightSearch.value.travellerDOBS);

  // Preferred Carriers for TJ
  const preferredCarriersTJ = ['6E', 'SG'];

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
      // setAirlines(
      //   airlines.data.map((element) => ({
      //     value: element.id,
      //     label: element.name,
      //     code: element.code,
      //   }))
      // );
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

  const amadeusDataManipulation = async (data) => {
    const finalRecos = [];
    for (let [k, v] of Object.entries(data.recommendations)) {
      const segs = [];
      let prices = [];
      const segments = data.segments[k];
      // Segments
      for (let leg of segments) {
        let counter = 0;
        for (let flight of leg?.flights) {
          let layover = flight?.layover;
          let layoverInMinutes = 0;
          if (layover) {
            let splitArr = layover.split(' ');
            let size = splitArr.length;
            if (size === 1) {
              splitArr[0] = splitArr[0].replace('m', '');
              layoverInMinutes += +splitArr[0];
            } else if (size === 2) {
              splitArr[0] = splitArr[0].replace('h', '');
              layoverInMinutes += +splitArr[0] * 60;
              splitArr[1] = splitArr[1].replace('m', '');
              layoverInMinutes += +splitArr[1];
            } else if (size === 3) {
              splitArr[0] = splitArr[0].replace('d', '');
              layoverInMinutes += +splitArr[0] * 60 * 24;
              splitArr[1] = splitArr[1].replace('h', '');
              layoverInMinutes += +splitArr[1] * 60;
              splitArr[2] = splitArr[2].replace('m', '');
              layoverInMinutes += +splitArr[2];
            }
          }
          let tempSeg = {
            flight: {
              airline: flight.carrier,
              number: flight.flight,
              equipment: flight.equipment,
            },
            departure: {
              time: flight.depart.date + 'T' + flight.depart.time,
              airport: {
                code: flight.depart.location,
                terminal: flight.depart.terminal,
              },
            },
            arrival: {
              time: flight.arrive.date + 'T' + flight.arrive.time,
              airport: {
                code: flight.arrive.location,
                terminal: flight.arrive.terminal,
              },
            },
            segmentNo: counter++,
            journey: {
              layoverMins: layoverInMinutes,
            },
          };
          segs.push(tempSeg);
        }
      }
      // Prices
      for (let [ffRef, vData] of Object.entries(v)) {
        const ffData = ffRef !== '_' ? data.fareFamilies[ffRef] : {};
        const baggage = data.baggages[vData.bagRef];
        prices.push({ ...vData, ...ffData, ...baggage });
      }
      finalRecos.push({ segments: segs, prices });
    }
    console.log('finalRecos', finalRecos);
    return finalRecos;
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
      // directOnly: directFlight,
      // preferredCarriers: preferredAirlines.map((el) => el?.code).filter((el) => el),
      sectors: [
        {
          from: from?.value,
          to: to?.value,
          date: departDate.format('YYYY-MM-DD'),
        },
      ],
    };
    if ((preferredCabin?.value || 'Any') !== 'Any') {
      request['cabinType'] = preferredCabin.value.toUpperCase().replaceAll(' ', '_');
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
    let callsCounter = 3;
    if (returnFlight && domestic) {
      callsCounter = 6;
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
    // dispatch(setTravellersRedux({ travellers }));
    dispatch(
      setDestinations({
        to,
        from,
        departDate: departDate.format('YYYY-MM-DD'),
        returnDate: returnFlight ? returnDate.format('YYYY-MM-DD') : null,
      })
    );
    // To
    // Akasa
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
    // Tripjack
    customAPICall(
      'tj/v1/search',
      'post',
      { ...request, preferredCarriers: preferredCarriersTJ },
      {},
      true
    )
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
    // Amadeus
    customAPICall('flights/search', 'post', request, {}, false)
      .then(async (res) => {
        if (res?.success) {
          res.data = await amadeusDataManipulation(res.data);
          let body = { to: null, from: null, combined: null };
          if (domestic) {
            body.to = res.data;
          } else {
            body.combined = res.data;
          }
          if (returnFlight && domestic) {
            if (tempSearchData?.ad?.from) {
              body.from = tempSearchData.ad.from;
            }
          }
          tempSearchData = { ...tempSearchData, ad: body };
          updateSEO();
        }
      })
      .catch((err) => console.error(err))
      .then(() => dispatchCalls(tempSearchData, callsCounter, (currentCalls += 1)));
    // From
    if (returnFlight && domestic) {
      // Akasa
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
      // TripJack
      customAPICall(
        'tj/v1/search',
        'post',
        { ...returnRequest, preferredCarriers: preferredCarriersTJ },
        {},
        true
      )
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
      // Amadeus
      customAPICall('flights/search', 'post', returnRequest, {}, false)
        .then(async (res) => {
          if (res?.success) {
            res.data = await amadeusDataManipulation(res.data);
            let body = { to: null, from: null, combined: null };
            body.from = res.data;
            if (tempSearchData?.ad?.to) {
              body.to = tempSearchData.ad.to;
            }
            tempSearchData = { ...tempSearchData, ad: body };
            updateSEO();
          }
        })
        .catch((err) => console.error(err))
        .then(() => dispatchCalls(tempSearchData, callsCounter, (currentCalls += 1)));
    }
  };

  const dispatchCalls = async (searchData, callsCounter, currentCalls) => {
    dispatch(setSearchData(searchData));
    console.log('searchData', searchData);
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

  // const searchData = useSelector((state) => state.flightSearch.value.searchData);

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

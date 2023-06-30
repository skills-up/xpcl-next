import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { useDispatch, useSelector } from 'react-redux';
import WindowedSelect from 'react-windowed-select';
import checkAirportCache from '../../../utils/airportCacheValidity';
import { sendToast } from '../../../utils/toastify';
import ReactSwitch from 'react-switch';
import FilterSelect from '../flight-list-v1/FilterSelect';
import Select from 'react-select';
import { customAPICall, getList } from '../../../api/xplorzApi';
import { checkUser } from '../../../utils/checkTokenValidity';
import {
  setAirlineOrgs,
  setReturnFlight as setReturnFlightRedux,
  setSearchData,
  setTravellerDOBS,
  setTravellers as setTravellersRedux,
  setClientTravellers as setClientTravellersRedux,
  setInitialSearchData,
  setSelectedBookings,
  setDestinations,
} from '../../../features/flightSearch/flightSearchSlice';

const MainFilterSearchBox = () => {
  const [directFlight, setDirectFlight] = useState(true);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [preferredCabin, setPrefferedCabin] = useState(null);
  const [travellers, setTravellers] = useState([]);
  const [preferredAirlines, setPreferredAirlines] = useState([]);
  const [departDate, setDepartDate] = useState(new DateObject());
  const [returnDate, setReturnDate] = useState(new DateObject());
  const [returnFlight, setReturnFlight] = useState(true);
  const cabinOptions = ['Economy', 'Premium Economy', 'Business', 'First'];
  const [clientTravellers, setClientTravellers] = useState([]);
  const [airlines, setAirlines] = useState([]);

  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector((state) => state.auth.value.token);
  console.log('token', token);
  const airports = useSelector((state) => state.apis.value.airports);
  const client_id = useSelector((state) => state.auth.value.currentOrganization);
  // console.log('token', token);

  useEffect(() => {
    if (token !== '') {
      checkUser(router, dispatch);
      checkAirportCache(dispatch);
      getData();
    } else {
      sendToast('error', 'You must be logged in in order to view this page', 8000);
      router.push('/login');
    }
  }, []);

  const getData = async () => {
    const clientTravellers = await getList('client-travellers', {
      client_id,
    });
    const airlines = await getList('organizations', { is_airline: 1 });
    if (clientTravellers?.success && airlines?.success) {
      dispatch(setAirlineOrgs({ airlineOrgs: airlines.data }));
      dispatch(setClientTravellersRedux({ clientTravellers: clientTravellers.data }));
      setClientTravellers(
        clientTravellers.data.map((element) => ({
          value: element.id,
          label: element.traveller_name,
          traveller_id: element.traveller_id,
        }))
      );
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

  const search = async () => {
    // Checking if all mandatory fields are filled
    if (!to?.value) {
      sendToast('error', 'Please select your destination', 4000);
      return;
    }
    if (!from?.value) {
      sendToast('error', 'Please select your departure destination', 4000);
      return;
    }
    if (!travellers || travellers?.length === 0) {
      sendToast('error', 'Please select travellers', 4000);
      return;
    }
    // Getting Traveller DOBS
    let pax = {};
    const traveller_ids = travellers.map((el) => el.traveller_id);
    const travellerDetails = await getList('travellers', { traveller_ids });
    let ADT = 0;
    let CHD = 0;
    let INF = 0;
    if (travellerDetails?.success) {
      let currentTime = +Date.now();
      for (let traveller of travellerDetails.data) {
        if (traveller?.passport_dob) {
          const age = (
            (currentTime -
              +new DateObject({
                date: traveller.passport_dob,
                format: 'YYYY-MM-DD',
              })
                .toDate()
                .getTime()) /
            31536000000
          ).toFixed(2);
          // If below 2 years of age, infant
          if (age < 2) INF += 1;
          // If above 2 but below 12, child
          if (age >= 2 && age < 12) CHD += 1;
          // If above 12 years, consider adult
          if (age >= 12) ADT += 1;
        } else {
          ADT += 1;
        }
      }
      if (ADT > 0) pax['ADT'] = ADT;
      else {
        sendToast('error', 'There must be an Adult traveller', 4000);
        return;
      }
      if (CHD > 0) pax['CHD'] = CHD;
      if (INF > 0) pax['INF'] = INF;
    } else {
      sendToast('error', 'Error getting traveller details', 4000);
      return;
    }
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
          date: returnDate.format('YYYY-MM-DD'),
        },
      ],
    };
    let tempSearchData = { aa: null, tj: null, ad: null };
    let callsCounter = 2;
    if (returnFlight && domestic) {
      callsCounter = 4;
    }
    let currentCalls = 0;
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
        }
      })
      .catch((err) => console.error(err))
      .then(() =>
        dispatchCalls(tempSearchData, callsCounter, (currentCalls += 1), ADT, CHD, INF)
      );
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
          }
        })
        .catch((err) => console.error(err))
        .then(() =>
          dispatchCalls(tempSearchData, callsCounter, (currentCalls += 1), ADT, CHD, INF)
        );
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
        }
      })
      .catch((err) => console.error(err))
      .then(() =>
        dispatchCalls(tempSearchData, callsCounter, (currentCalls += 1), ADT, CHD, INF)
      );
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
          }
        })
        .catch((err) => console.error(err))
        .then(() =>
          dispatchCalls(tempSearchData, callsCounter, (currentCalls += 1), ADT, CHD, INF)
        );
    }
  };

  const dispatchCalls = async (searchData, totalCalls, currentCalls, ADT, CHD, INF) => {
    dispatch(setSearchData(searchData));
    if (currentCalls === totalCalls) {
      dispatch(setTravellerDOBS({ ADT, CHD, INF }));
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
    }
  };

  const searchData = useSelector((state) => state.flightSearch.value.searchData);
  useEffect(() => console.log('sd', searchData), [searchData]);

  return (
    <>
      {/* <div className='row y-gap-20 items-center'>
        <FilterSelect />
      </div> */}
      {/* End .row */}

      <div className='border-light rounded-4 pr-20 py-20 lg:px-20 lg:pt-5 lg:pb-20 mt-15'>
        <div className='flight-search pl-20 lg:pl-0'>
          <div className='d-flex items-center gap-2 justify-center'>
            <label>One Way</label>
            <ReactSwitch
              onChange={() => setReturnFlight((prev) => !prev)}
              checked={returnFlight}
            />
            <label>Return Trip</label>
          </div>
          <div className='flight-search-select'>
            <label>Preferred Cabin</label>
            <Select
              options={cabinOptions.map((el) => ({ label: el, value: el }))}
              value={preferredCabin}
              placeholder='Search..'
              onChange={(id) => setPrefferedCabin(id)}
            />
          </div>
          <div className='flight-search-select'>
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
          </div>
          <div className='flight-search-select'>
            <label>Airlines</label>
            <Select
              options={airlines}
              value={preferredAirlines}
              isMulti
              placeholder='Search..'
              onChange={(values) => setPreferredAirlines(values)}
            />
          </div>
          <div className='flight-search-select'>
            <label>
              From<span className='text-danger'>*</span>
            </label>
            <WindowedSelect
              options={airports.map((airport) => ({
                value: airport.id,
                label: `|${airport.iata_code}|${airport.city}|${airport.name}|${airport.country_name}`,
                iata: airport.iata_code,
              }))}
              formatOptionLabel={(opt) => {
                const [_, iata_code, city, name, country_name] = opt.label.split('|');
                return (
                  <div key={iata_code}>
                    <div
                      className='d-flex justify-between align-items-center'
                      style={{ fontSize: '1rem' }}
                    >
                      <span>
                        {city} (<strong>{iata_code}</strong>)
                      </span>
                      <div
                        style={{
                          fontSize: 'small',
                          fontStyle: 'italic',
                        }}
                      >
                        {country_name}
                      </div>
                    </div>
                    <small>{name}</small>
                  </div>
                );
              }}
              value={from}
              onChange={(id) => setFrom(id)}
            />
          </div>
          {/* End Location Flying From */}

          <div className='flight-search-select'>
            <label>
              To<span className='text-danger'>*</span>
            </label>
            <WindowedSelect
              options={airports.map((airport) => ({
                value: airport.id,
                label: `|${airport.iata_code}|${airport.city}|${airport.name}|${airport.country_name}`,
                iata: airport.iata_code,
              }))}
              formatOptionLabel={(opt) => {
                const [_, iata_code, city, name, country_name] = opt.label.split('|');
                return (
                  <div key={iata_code}>
                    <div
                      className='d-flex justify-between align-items-center'
                      style={{ fontSize: '1rem' }}
                    >
                      <span>
                        {city} (<strong>{iata_code}</strong>)
                      </span>
                      <div
                        style={{
                          fontSize: 'small',
                          fontStyle: 'italic',
                        }}
                      >
                        {country_name}
                      </div>
                    </div>
                    <small>{name}</small>
                  </div>
                );
              }}
              value={to}
              onChange={(id) => setTo(id)}
            />
          </div>
          {/* End Location Flying To */}

          <div className='flight-search-select pt-5 pl-30 d-flex gap-1 lg:pl-5 items-center justify-center'>
            <div>
              <label>
                Depart Date<span className='text-danger'>*</span>
              </label>
              <DatePicker
                style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                inputClass='custom_input-picker'
                containerClassName='custom_container-picker'
                value={departDate}
                onChange={(i) => {
                  setDepartDate(i);
                  if (returnDate.valueOf() < i.valueOf()) setReturnDate(i);
                }}
                numberOfMonths={1}
                offsetY={10}
                format='DD MMMM YYYY'
                minDate={new DateObject()}
              />
            </div>
            {/* End Depart */}
            {returnFlight && (
              <div>
                <label>
                  Return Date<span className='text-danger'>*</span>
                </label>
                <DatePicker
                  style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                  inputClass='custom_input-picker'
                  containerClassName='custom_container-picker'
                  value={returnDate}
                  onChange={setReturnDate}
                  numberOfMonths={1}
                  offsetY={10}
                  format='DD MMMM YYYY'
                  minDate={departDate}
                />
              </div>
            )}
          </div>

          {/* End Return */}

          <div>
            <div className='pl-5 d-flex gap-2 items-center'>
              <label>Direct Flight</label>
              <ReactSwitch
                onChange={() => setDirectFlight((prev) => !prev)}
                checked={directFlight}
              />
            </div>
          </div>
          {/* End guest */}
        </div>

        {/* End search button_item */}
        <div className='button-item pl-20 mt-20 lg:pl-0'>
          <button
            className='d-block mainSearch__submit button -blue-1 py-15 h-60 col-12 rounded-4 bg-dark-3 text-white'
            onClick={search}
          >
            <i className='icon-search text-20 mr-10' />
            Search
          </button>
        </div>
      </div>
      {/* End .mainSearch */}
    </>
  );
};

export default MainFilterSearchBox;

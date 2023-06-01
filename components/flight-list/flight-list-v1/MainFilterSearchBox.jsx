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
  setReturnFlight,
  setSearchData,
  setTravellerDOBS,
  setTravellers as setTravellersRedux,
  setInitialSearchData,
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

  const cabinOptions = ['Economy', 'Premium Economy', 'Business', 'First'];
  const [clientTravellers, setClientTravellers] = useState([]);
  const [airlines, setAirlines] = useState([]);

  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector((state) => state.auth.value.token);
  const airports = useSelector((state) => state.apis.value.airports);
  const client_id = useSelector((state) => state.auth.value.currentOrganization);
  const returnFlight = useSelector((state) => state.flightSearch.value.returnFlight);

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
    // Redux Calls
    dispatch(setInitialSearchData());
    // Getting Traveller DOBS
    let pax = {};
    const traveller_ids = travellers.map((el) => el.traveller_id);
    const travellerDetails = await getList('travellers', { traveller_ids });
    if (travellerDetails?.success) {
      let ADT = 0;
      let CHD = 0;
      let INF = 0;
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
      if (CHD > 0) pax['CHD'] = CHD;
      if (INF > 0) pax['INF'] = INF;
      dispatch(setTravellerDOBS({ ADT, CHD, INF }));
    } else {
      sendToast('error', 'Error getting traveller details', 4000);
    }
    // Formulating Request
    let request = {
      pax,
      cabinType: preferredCabin?.value
        ? preferredCabin.value === 'Premium Economy'
          ? 'PREMIUM_ECONOMY'
          : preferredCabin?.value?.toUpperCase()
        : null,
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
    if (returnFlight) {
      request.sectors.push({
        to: from?.iata,
        from: to?.iata,
        date: returnDate.format('YYYY-MM-DD'),
      });
    }
    console.log(request);

    // Akasa
    customAPICall('aa/v1/search', 'post', request, {}, true)
      .then((res) => {
        console.log(res.data);
        if (res?.success) {
          dispatch(setSearchData({ aa: res.data }));
          dispatch(setTravellers({ travellers: values }));
        }
      })
      .catch((err) => console.error(err));
    // Tripjack
    customAPICall('tj/v1/search', 'post', request, {}, true)
      .then((res) => {
        console.log('dat', res.data);
        if (res?.success) {
          dispatch(setSearchData({ tj: res.data }));
          dispatch(setTravellers({ travellers: values }));
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <div className='row y-gap-20 items-center'>
        <FilterSelect />
      </div>
      {/* End .row */}

      <div className='mainSearch d-flex flex-column -col-5 border-light rounded-4 pr-20 py-20 lg:px-20 lg:pt-5 lg:pb-20 mt-15'>
        <div className='d-flex items-center mb-20 justify-center'>
          <div className='searchMenu-date py-10 pl-30 lg:py-20 lg:pl-0 js-form-dd js-calendar'>
            <div className='d-flex items-center gap-2'>
              <label>One Way</label>
              <ReactSwitch
                onChange={() =>
                  dispatch(setReturnFlight({ returnFlight: !returnFlight }))
                }
                checked={returnFlight}
              />
              <label>Return Trip</label>
            </div>
          </div>
          <div className='searchMenu-date pl-30 lg:py-20 lg:pl-0 lg:pr-0 js-form-dd js-calendar w-300'>
            <label>Preferred Cabin</label>
            <Select
              options={cabinOptions.map((el) => ({ label: el, value: el }))}
              value={preferredCabin}
              placeholder='Search..'
              onChange={(id) => setPrefferedCabin(id)}
            />
          </div>
          <div className='searchMenu-date pl-30 lg:py-20 lg:pl-0 lg:pr-0 js-form-dd js-calendar w-300'>
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
          <div className='searchMenu-date pl-30 lg:py-20 lg:pl-0 lg:pr-0 js-form-dd js-calendar w-300'>
            <label>Airlines</label>
            <Select
              options={airlines}
              value={preferredAirlines}
              isMulti
              placeholder='Search..'
              onChange={(values) => setPreferredAirlines(values)}
            />
          </div>
        </div>
        <div className='button-grid items-center'>
          <div className='searchMenu-date pl-30 pr-20 lg:py-20 lg:pl-0 lg:pr-0 js-form-dd js-calendar w-350'>
            <label>
              From<span className='text-danger'>*</span>
            </label>
            <WindowedSelect
              options={airports.map((airport) => ({
                value: airport.id,
                label: `${airport.iata_code}|${airport.city}|${airport.name}|${airport.country_name}`,
                iata: airport.iata_code,
              }))}
              formatOptionLabel={(opt) => {
                const [iata_code, city, name, country_name] = opt.label.split('|');
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

          <div className='searchMenu-date pl-30 pr-20 lg:py-20 lg:pl-0 lg:pr-0 js-form-dd js-calendar w-350'>
            <label>
              To<span className='text-danger'>*</span>
            </label>
            <WindowedSelect
              options={airports.map((airport) => ({
                value: airport.id,
                label: `${airport.iata_code}|${airport.city}|${airport.name}|${airport.country_name}`,
                iata: airport.iata_code,
              }))}
              formatOptionLabel={(opt) => {
                const [iata_code, city, name, country_name] = opt.label.split('|');
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

          <div className='searchMenu-date py-10 pl-30 lg:py-20 lg:pl-0 js-form-dd js-calendar'>
            <label>
              Depart Date<span className='text-danger'>*</span>
            </label>
            <DatePicker
              style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
              inputClass='custom_input-picker'
              containerClassName='custom_container-picker'
              value={departDate}
              onChange={setDepartDate}
              numberOfMonths={1}
              offsetY={10}
              format='DD MMMM YYYY'
            />
          </div>
          {/* End Depart */}

          {returnFlight && (
            <div className='searchMenu-date py-10 pl-30 lg:py-20 lg:pl-0 js-form-dd js-calendar'>
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
              />
            </div>
          )}
          {/* End Return */}

          <div className='searchMenu-date py-10 pl-30 lg:py-20 lg:pl-0 js-form-dd js-calendar'>
            <div className='d-flex flex-column items-center'>
              <label>Direct Flight</label>
              <ReactSwitch
                onChange={() => setDirectFlight((prev) => !prev)}
                checked={directFlight}
              />
            </div>
          </div>
          {/* End guest */}

          {/* End search button_item */}
        </div>
        <div className='button-item pl-20 mt-20'>
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

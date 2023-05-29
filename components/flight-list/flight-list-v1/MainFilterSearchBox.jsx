import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { useDispatch, useSelector } from 'react-redux';
import WindowedSelect from 'react-windowed-select';
import checkAirportCache from '../../../utils/airplaneCacheValidity';
import { sendToast } from '../../../utils/toastify';
import ReactSwitch from 'react-switch';
import FilterSelect from '../flight-list-v1/FilterSelect';
import Select from 'react-select';
import { customAPICall, getList } from '../../../api/xplorzApi';

const MainFilterSearchBox = () => {
  const [returnFlight, setReturnFlight] = useState(true);
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

  useEffect(() => {
    if (token !== '') {
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
      setClientTravellers(
        clientTravellers.data.map((element) => ({
          value: element.id,
          label: element.traveller_name,
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
    let request = {
      pax: { ADT: 2 },
      cabinType: preferredCabin?.value,
      directOnly: directFlight,
      preferredCarriers: preferredAirlines.map((el) => el?.code),
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
    // Akasa
    customAPICall('aa/v1/search', 'post', request, {}, true)
      .then((res) => console.log(res))
      .catch((err) => console.error(err));
    // Tripjack
    customAPICall('tj/v1/search', 'post', request, {}, true)
      .then((res) => console.log(res))
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
              <label>Single Trip</label>
              <ReactSwitch
                onChange={() => setReturnFlight((prev) => !prev)}
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
            <label>Travellers</label>
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
            <label>From</label>
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
            <label>To</label>
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

          <div className='searchMenu-date py-10 pl-30 lg:py-20 lg:pl-0 js-form-dd js-calendar'>
            <label>
              Depart Date<span className='text-danger'>*</span>
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

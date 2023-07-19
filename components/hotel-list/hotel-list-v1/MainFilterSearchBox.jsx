import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { useDispatch } from 'react-redux';
import ReactSwitch from 'react-switch';
import Select from 'react-select';
import WindowedSelect from 'react-windowed-select';
import { getList } from '../../../api/xplorzApi';

const MainFilterSearchBox = () => {
  const dispatch = useDispatch();
  const [location, setLocation] = useState(null);
  const [date, setDate] = useState([new DateObject(), new DateObject().add(1, 'days')]);
  const [rooms, setRooms] = useState([]);
  const [ratingParam, setRatingParam] = useState({ value: 'Any', label: 'Any' });
  const [isSub, setIsSub] = useState(false);
  const [subLocation, setSubLocation] = useState([]);
  const [clientTravellers, setClientTravellers] = useState([]);

  const ratingOptions = ['1+', '2+', '3+', '4+', '5', 'Any'];

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const clientTravellers = getList('client-travellers');
    if (clientTravellers?.success) {
      setClientTravellers(clientTravellers.data);
    }
  };

  const onSearch = async (e) => {
    e.preventDefault();
    // const response = await customAPICall(
    //   'tj/v1/htl/search',
    //   'post',
    //   {
    //     cityId: '740051',
    //     countryCode: '106',
    //     checkIn: '2023-07-20',
    //     checkOut: '2023-07-22',
    //     rooms: [{ adults: 1, childAge: [] }],
    //   },
    //   {},
    //   true
    // );
    // if (response?.success) {
    //   dispatch(setSearchData(response.data));
    // }
  };

  return (
    <>
      <div className='border-light rounded-4 pr-20 py-20 lg:px-20 lg:pt-5 lg:pb-20 mt-15'>
        <div className='hotel-search pl-20 lg:pl-0'>
          <div className='hotel-search-select'>
            <label>
              Location<span className='text-danger'>*</span>
            </label>
            {/* <WindowedSelect
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
            /> */}
          </div>
          {/* End Location Flying From */}

          <div className='hotel-search-select pt-5 pl-30 d-flex gap-1 lg:pl-5 items-center justify-center'>
            <div>
              <label>
                Check In - Check Out<span className='text-danger'>*</span>
              </label>
              <DatePicker
                range
                rangeHover
                style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                inputClass='custom_input-picker'
                containerClassName='custom_container-picker'
                value={date}
                onChange={(i) => {
                  setDate(i);
                }}
                numberOfMonths={2}
                offsetY={10}
                format='DD MMMM YYYY'
                minDate={new DateObject()}
              />
            </div>
            {/* End Depart */}
          </div>

          {/* End Return */}
          <div className='d-flex items-center gap-2 justify-center'>
            <label>Enable Sub-Region Search</label>
            <ReactSwitch onChange={() => setIsSub((prev) => !prev)} checked={isSub} />
          </div>
          <div className='hotel-search-select'>
            <label>Minimum Rating </label>
            <Select
              options={ratingOptions.map((el) => ({ label: el, value: el }))}
              value={ratingParam}
              placeholder='Select'
              onChange={(id) => setRatingParam(id)}
            />
          </div>
          {/* End guest */}
        </div>

        {/* End search button_item */}
        <div className='button-item pl-20 mt-20 lg:pl-0'>
          <button
            className='d-block mainSearch__submit button -blue-1 py-15 h-60 col-12 rounded-4 bg-dark-3 text-white'
            onClick={onSearch}
          >
            <i className='icon-search text-20 mr-10' />
            Search
          </button>
        </div>
      </div>
    </>
  );
};

export default MainFilterSearchBox;

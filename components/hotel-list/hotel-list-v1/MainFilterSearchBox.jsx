import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { useDispatch } from 'react-redux';
import ReactSwitch from 'react-switch';
import Select from 'react-select';
import WindowedSelect, { createFilter } from 'react-windowed-select';
import { customAPICall, getList } from '../../../api/xplorzApi';
import {
  setAge,
  setCheckInDate,
  setCheckOutDate,
  setInitialState,
  setSearchData,
  setRooms as setRoomsRedux,
} from '../../../features/hotelSearch/hotelSearchSlice';
import { hotelSearchData } from '../../../data/hotelSearchData';
import { BiPlusMedical, BiTrash } from 'react-icons/bi';
import { sendToast } from '../../../utils/toastify';
import LoadingBar from 'react-top-loading-bar';
import GuestSearch from '../../hotel-single/filter-box/GuestSearch';

const MainFilterSearchBox = () => {
  const [progress, setProgress] = useState(0);
  const dispatch = useDispatch();
  const [location, setLocation] = useState(null);
  const [date, setDate] = useState([new DateObject(), new DateObject().add(1, 'days')]);
  const [rooms, setRooms] = useState([{ adult: 0, child: [] }]);
  const [ratingParam, setRatingParam] = useState([]);
  const [clientTravellers, setClientTravellers] = useState([]);

  const ratingOptions = ['1', '2', '3', '4', '5'];

  useEffect(() => console.log('Rooms', rooms), [rooms]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const clientTravellers = await getList('client-travellers');
    if (clientTravellers?.success) {
      setClientTravellers(clientTravellers.data);
    }
  };

  const onSearch = async (e) => {
    e.preventDefault();
    // Resetting Values
    dispatch(setInitialState());
    // Checks
    if (!location?.value) {
      sendToast('error', 'Please select Locaiton', 4000);
      return;
    }
    // Getting Travellers Ages
    let roomsTemp = [];
    // let traveller_ids = [];
    // for (let room of rooms) {
    //   for (let traveller of room.travellers) {
    //     traveller_ids.push(traveller.value);
    //   }
    // }
    // if (traveller_ids.length === 0) {
    //   sendToast('error', 'Please select at least one Traveller');
    //   return;
    // }
    // const travellers = await getList('travellers', { traveller_ids });
    // if (!travellers?.success) {
    //   sendToast('error', 'Error fetching Traveller details');
    //   return;
    // }
    // let currentTime = Date.now();
    for (let room of rooms) {
      // if (!room.travellers || room.travellers.length === 0) {
      //   sendToast('error', 'Each room should have a traveller..', 4000);
      //   return;
      // }
      // let temp = { adults: 0, childAge: [] };
      // for (let travl of room.travellers) {
      //   for (let traveller of travellers.data) {
      //     if (travl.value === traveller.id) {
      //       // Getting Age
      //       if (traveller?.passport_dob) {
      //         const age = (
      //           (currentTime -
      //             +new DateObject({
      //               date: traveller.passport_dob,
      //               format: 'YYYY-MM-DD',
      //             })
      //               .toDate()
      //               .getTime()) /
      //           31536000000
      //         ).toFixed(2);
      //         // If below 12, child
      //         if (age < 12) temp.childAge.push(Math.floor(age));
      //         // If above 12 years, consider adult
      //         if (age >= 12) temp.adults += 1;
      //       } else {
      //         temp.adults += 1;
      //       }
      //     }
      //   }
      // }
      // if (temp.adults === 0 && room.travellers.length > 0) {
      //   sendToast('error', 'Each room should have an adult', 4000);
      //   return;
      // }
      if (room.adult === 0) {
        sendToast('error', 'Each room should have an adult', 4000);
        return;
      }
      roomsTemp.push({
        adults: room.adult,
        childAge: room.child,
      });
    }
    setProgress(30);
    // Search Call
    const response = await customAPICall(
      'tj/v1/htl/search',
      'post',
      {
        cityId: location.value,
        checkIn: date[0].format('YYYY-MM-DD'),
        checkOut: date[1]?.format('YYYY-MM-DD') || date[0].format('YYYY-MM-DD'),
        rooms: roomsTemp,
        ratings: ratingParam.length > 0 ? ratingParam.map((el) => +el.value) : undefined,
      },
      {},
      true
    );
    setProgress(70);
    let totalAdult = 0;
    if (response?.success) {
      let totalChildren = 0;
      for (let info of response.data.searchQuery.roomInfo) {
        totalAdult += info.numberOfAdults;
        totalChildren += info.numberOfChild;
      }
      dispatch(setCheckInDate(date[0].format('YYYY-MM-DD')));
      dispatch(
        setCheckOutDate(date[1]?.format('YYYY-MM-DD') || date[0]?.format('YYYY-MM-DD'))
      );
      dispatch(setRoomsRedux(rooms));
      dispatch(setAge({ totalAdult, totalChildren }));
      dispatch(setSearchData(response.data));
      setTimeout(() => {
        const el = document.getElementById('hotel-properties');
        if (el) el.scrollIntoView();
      }, 1000);
    } else {
      sendToast('error', 'No Rooms Found', 4000);
    }
    setProgress(100);
  };

  return (
    <>
      <LoadingBar
        color='#19f9fc'
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <div className='border-light rounded-4 pr-20 py-20 lg:px-10 lg:pt-5 lg:pb-20 mt-15'>
        {/* Hotel Search */}
        <div className='hotel-search pl-20 lg:pl-0'>
          <div className='hotel-search-select'>
            <label className='text-15 lh-12 fw-500'>
              Location<span className='text-danger'>*</span>
            </label>
            <WindowedSelect
              filterOption={(candidate, input) => {
                if (input) {
                  return (
                    candidate.data.cityName.toLowerCase() === input.toLowerCase() ||
                    candidate.label.toLowerCase().includes(input.toLowerCase())
                  );
                }
                return true;
              }}
              placeholder={
                <>
                  Search..
                  <br />
                  <br />
                </>
              }
              windowThreshold={200}
              options={hotelSearchData.map((hotel) => ({
                value: hotel[0],
                label: hotel[2],
                cityName: hotel[1],
              }))}
              formatOptionLabel={(opt) => {
                return (
                  <div key={opt.value}>
                    {opt.cityName}
                    <br />
                    <small>{opt.label}</small>
                  </div>
                );
              }}
              value={location}
              onChange={(id) => setLocation(id)}
            />
          </div>
          {/* End Location Flying From */}

          <div
            style={{ border: '1px solid lightgray' }}
            className='hotel-date-select py-4 d-flex mt-30 rounded-4 gap-1 items-center justify-center'
          >
            <div className='text-center'>
              <label className='text-15 lh-12 fw-500'>
                Check In - Check Out<span className='text-danger'>*</span>
              </label>
              <DatePicker
                range
                rangeHover
                style={{ fontSize: '1rem' }}
                inputClass='custom_input-picker text-center'
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
            {/* End Depart */}
          </div>

          {/* End Return */}
          <div className='hotel-search-select '>
            <label className='text-15 lh-12 fw-500'>Specify Ratings (Optional) </label>
            <Select
              options={ratingOptions.map((el) => ({ label: el, value: el }))}
              isMulti
              value={ratingParam}
              placeholder={
                <>
                  Search..
                  <br />
                  <br />
                </>
              }
              onChange={(id) => setRatingParam(id)}
            />
          </div>
          {/* End guest */}
        </div>
        {/* Rooms Guests */}
        <hr
          style={{ margin: 'auto', width: '90%', color: '#13357b', opacity: '100%' }}
          className='my-3'
        />
        <div className='pl-20 lg:pl-0'>
          <h4 className='text-center mb-10'>Rooms & Guests</h4>
          <GuestSearch room={[rooms, setRooms]} />
          {/* <div className='bg-white hotel-search-guest-selector py-15'>
            {rooms.map((room, index) => {
              return (
                <div
                  key={index}
                  className='px-30 lg:px-10 hotel-search-guest-container row items-center py-10 y-gap-10'
                >
                  <span
                    className='col-lg-1 text-center d-block'
                    style={{ fontWeight: 'bold' }}
                  >
                    Room {index + 1}
                  </span>
                  <div className='form-input-select col-lg-9 px-0 lg:px-15'>
                    <label>Select Guests</label>
                    <Select
                      isOptionDisabled={() => rooms[index].travellers.length >= 5}
                      options={clientTravellers
                        .filter((el) => {
                          let found = false;
                          for (let room of rooms) {
                            for (let traveller of room.travellers) {
                              if (traveller.value === el.traveller_id) {
                                found = true;
                              }
                            }
                          }
                          if (!found) {
                            return true;
                          }
                        })
                        .map((el) => ({
                          label: el.traveller_name,
                          value: el.traveller_id,
                        }))}
                      isMulti
                      value={rooms[index].travellers}
                      onChange={(id) =>
                        setRooms((prev) => {
                          prev[index].travellers = id;
                          return [...prev];
                        })
                      }
                    />
                  </div>
                  <div className='col-lg-2 lg:px-15 m-0 d-flex gap-1'>
                    {index < 8 && (
                      <button
                        onClick={() =>
                          setRooms((prev) =>
                            prev.length < 9 ? [...prev, { travellers: [] }] : [...prev]
                          )
                        }
                        className='btn btn-outline-success py-20 col-6 lg:py-10'
                      >
                        <BiPlusMedical style={{ fontSize: '1.5rem' }} />
                      </button>
                    )}
                    {index > 0 && index < 9 && (
                      <button
                        className='btn btn-outline-danger py-20 col-6 lg:py-10'
                        onClick={() =>
                          setRooms((prev) => {
                            prev.splice(index, 1);
                            return [...prev];
                          })
                        }
                      >
                        <BiTrash style={{ fontSize: '1.5rem' }} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div> */}
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

import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { useDispatch } from 'react-redux';
import LoadingBar from 'react-top-loading-bar';
import { customAPICall } from '../../../api/xplorzApi';
import { hotelSearchData } from '../../../data/hotelSearchData';
import {
  setAge,
  setCheckInDate,
  setCheckOutDate,
  setInitialState,
  setRooms as setRoomsRedux,
  setSearchData,
} from '../../../features/hotelSearch/hotelSearchSlice';
import { sendToast } from '../../../utils/toastify';
import Seo from '../../common/Seo';
import GuestSearch from '../common/GuestSearch';
import LocationSearch from '../common/LocationSearch';

const MainFilterSearchBox = () => {
  const [SEO, setSEO] = useState('Hotel Search');
  const [progress, setProgress] = useState(0);
  const dispatch = useDispatch();
  const [location, setLocation] = useState(null);
  const [locationOptions, setLocationOptions] = useState([]);
  const [date, setDate] = useState([new DateObject(), new DateObject().add(1, 'days')]);
  const [roomsData, setRoomsData] = useState([{ adults: 1, child: [] }]);

  // Initial Filling
  useEffect(() => {
    if (hotelSearchData) setLocationOptions(hotelSearchData);
  }, [hotelSearchData]);

  const updateSEO = () => {
    setSEO(
      `Hotel Search Results | ${location?.cityName}, ${date[0]?.format(
        'DD'
      )}-${date[1]?.format('DD MMMM')}`
    );
  };

  const onSearch = async (e) => {
    e.preventDefault();
    // Resetting Values
    dispatch(setInitialState());
    // Checks
    if (!location?.value) {
      sendToast('error', 'Please select Location', 4000);
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
    for (let room of roomsData) {
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
      if (room.adults === 0) {
        sendToast('error', 'Each room should have an adult', 4000);
        return;
      }
      if (room.adults + room.child.length > 5) {
        sendToast('error', 'Each room can have a maximum of 5 guests', 4000);
        return;
      }
      roomsTemp.push({
        adults: room.adults,
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
      },
      {},
      true
    );
    setProgress(70);
    let totalAdult = 0;
    if (response?.success) {
      updateSEO();
      let totalChildren = 0;
      for (let info of response.data.searchQuery.roomInfo) {
        totalAdult += info.numberOfAdults;
        totalChildren += info.numberOfChild;
      }
      dispatch(setCheckInDate(date[0].format('YYYY-MM-DD')));
      dispatch(
        setCheckOutDate(date[1]?.format('YYYY-MM-DD') || date[0]?.format('YYYY-MM-DD'))
      );
      dispatch(
        setRoomsRedux([
          ...roomsData.map((el) => ({ ...{ adult: el.adult, child: [...el.child] } })),
        ])
      );
      dispatch(setAge({ totalAdult, totalChildren }));
      dispatch(setSearchData(response.data));
      setTimeout(() => {
        const el = document.getElementById('hotel-properties');
        if (el) el.scrollIntoView();
      }, 1000);
    } else {
      updateSEO('Hotel Search');
      sendToast('error', 'No Rooms Found', 4000);
    }
    setProgress(100);
  };

  return (
    <>
      <Seo pageTitle={SEO} />
      <LoadingBar
        height={3}
        color='#3554d1'
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <div className='mainSearch -col-3-big bg-white px-10 py-10 lg:px-20 lg:pt-5 lg:pb-20 rounded-100 border-light'>
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
                  ':hover': {
                    border: 'none',
                    boxShadow: 'none',
                  },
                }),
                valueContainer: (styles) => ({
                  ...styles,
                  padding: 0,
                }),
                indicatorsContainer: (styles) => ({
                  ...styles,
                  display: 'none',
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

          <GuestSearch guestRoomsData={[roomsData, setRoomsData]} />
          {/* End guest */}

          <div className='button-item'>
            <button
              className='mainSearch__submit button -dark-1 h-60 px-35 col-12 rounded-100 bg-blue-1 text-white'
              onClick={onSearch}
            >
              <i className='icon-search text-20 mr-10' />
              Search
            </button>
          </div>
          {/* End search button_item */}
        </div>
      </div>
    </>
  );
};

export default MainFilterSearchBox;

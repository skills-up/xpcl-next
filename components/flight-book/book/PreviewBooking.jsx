import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { createItem, customAPICall, getList } from '../../../api/xplorzApi';
import { sendToast } from '../../../utils/toastify';
import FlightProperty from '../../flight-list/common/FlightProperty';
import Select from 'react-select';
import DatePicker, { DateObject } from 'react-multi-date-picker';

function PreviewBooking({ setCurrentStep, isBooked, setPNR, travellerInfos }) {
  const selectedBookings = useSelector(
    (state) => state.flightSearch.value.selectedBookings
  );
  const [frequentFliers, setFrequentFliers] = useState([]);
  const [travellerInfo, setTravellerInfo] = travellerInfos;
  const returnFlight = useSelector((state) => state.flightSearch.value.returnFlight);
  const lowCostBookings = ['IX', '6E', 'SG', 'G8', 'I5'];
  const travellers = useSelector((state) => state.flightSearch.value.travellers);
  const airports = useSelector((state) => state.apis.value.airports);
  console.log('airports', airports);
  const destinations = useSelector((state) => state.flightSearch.value.destinations);
  const router = useRouter();
  const mealPreferenceOptions = [
    { value: 'Vegetarian', label: 'Vegetarian' },
    { value: 'Jain Vegetarian', label: 'Jain Vegetarian' },
    { value: 'Non Vegetarian', label: 'Non Vegetarian' },
    { value: 'Lacto Ovo Meal', label: 'Lacto Ovo Meal' },
    { value: 'Sea Food Meal', label: 'Sea Food Meal' },
  ];
  const seatPreferenceOptions = [
    { value: 'Window', label: 'Window' },
    { value: 'Aisle', label: 'Aisle' },
  ];
  const passportGenderOptions = [
    { value: 'Male', label: 'Mr.' },
    { value: 'Female', label: 'Mrs.' },
  ];

  useEffect(() => {
    if ((!selectedBookings.to && !selectedBookings.from) || !travellers) {
      console.log('nothing found');
    }
    getData();
  }, []);

  const getData = async () => {
    // Getting Traveller Details
    if (travellers) {
      const travellerList = await getList('travellers', {
        traveller_ids: travellers.map((el) => el?.value),
      });
      if (travellerList?.success) {
        setTravellerInfo(
          travellerList.data.map((el) => ({
            ...el,
            ...{
              frequentFliers: null,
              membershipID: '',
              seat_preference: el.seat_preference
                ? { label: el.seat_preference, value: el.seat_preference }
                : null,
              meal_preference: el.meal_preference
                ? { label: el.meal_preference, value: el.meal_preference }
                : null,
              passport_gender: el.passport_gender
                ? el.passport_gender === 'Male'
                  ? { label: 'Mr.', value: 'Male' }
                  : { label: 'Mrs.', value: 'Female' }
                : null,
            },
          }))
        );
      } else {
        sendToast('error', 'Failed to fetch traveller details', 4000);
      }
    }
    // Frequent Fliers
    const frequentFliersList = await getList('frequent-flier-programs');
    if (frequentFliersList?.success) {
      setFrequentFliers(frequentFliersList?.data);
    } else {
      sendToast('error', 'Failed to fetch frequent fliers', 4000);
    }
  };

  const onClick = async () => {
    // Total API Calls to succeed, we check this by checking if selectedbookings.from has a value
    let totalAPICalls = 1;
    let currentAPICalls = 0;
    if (selectedBookings.from) totalAPICalls = 2;
    // Is Domestic
    let isDomestic = true;
    if (destinations?.from && destinations?.to) {
      if (
        destinations?.to?.label?.split('|')?.at(-1) !== 'India' ||
        destinations?.from?.label?.split('|')?.at(-1) !== 'India'
      ) {
        isDomestic = false;
      }
    }
    // Special Scenario Amadeus International Flight
    if (
      !isDomestic &&
      totalAPICalls === 2 &&
      selectedBookings.from.provider === 'tj' &&
      selectedBookings.to.provider === 'tj' &&
      lowCostBookings.includes(selectedBookings.from.segments[0].flight.airline) &&
      lowCostBookings.includes(selectedBookings.to.segments[0].flight.airline)
    ) {
      console.log('Amadaeus Detected');
      response = await createItem('flights/book', {
        travellers: travellers.map((el) => el.value),
        sectors: [
          selectedBookings.to.segments.map((el) => ({
            from: el.departure.airport.code,
            to: el.arrival.airport.code,
            departureDate: el.departure.time.replace('T', ' ') + ':00',
            arrivalDate: el.arrival.time.replace('T', ' ') + ':00',
            companyCode: el.flight.airline,
            flightNumber: el.flight.number,
            bookingClass: selectedBookings.to.prices.prices.ADULT.bookingClass,
          })),
          selectedBookings.from.segments.map((el) => ({
            from: el.departure.airport.code,
            to: el.arrival.airport.code,
            departureDate: el.departure.time.replace('T', ' ') + ':00',
            arrivalDate: el.arrival.time.replace('T', ' ') + ':00',
            companyCode: el.flight.airline,
            flightNumber: el.flight.number,
            bookingClass: selectedBookings.from.prices.prices.ADULT.bookingClass,
          })),
        ],
      });
      console.log(response);
      if (response?.success) {
        setPNR((prev) => ({ from: response.data, to: response.data }));
        setCurrentStep(2);
        return;
      }
    }
    //  else {
    //   console.log(
    //     isDomestic,
    //     totalAPICalls,
    //     selectedBookings.from.provider,
    //     selectedBookings.to.provider,
    //     lowCostBookings.includes(selectedBookings.from.segments[0].flight.airline),
    //     lowCostBookings.includes(selectedBookings.to.segments[0].flight.airline)
    //   );
    // }

    console.log('test');
    for (let [key, value] of Object.entries(selectedBookings)) {
      let response;
      if (value.provider === 'aa') {
      }
      if (value.provider === 'tj') {
        // Checking if low cost carrier or not
        if (lowCostBookings.includes(value.segments[0].flight.airline)) {
          // TJ
          response = await customAPICall(
            'tj/v1/review',
            'post',
            { priceIds: [value.prices.id] },
            {},
            true
          );
          console.log(response);
          if (response?.success) {
            setPNR((prev) => ({ ...prev, [key]: response.data }));
            currentAPICalls += 1;
          }
        } else {
          // AD
          response = await createItem('flights/book', {
            travellers: travellers.map((el) => el.value),
            sectors: [
              value.segments.map((el) => ({
                from: el.departure.airport.code,
                to: el.arrival.airport.code,
                departureDate: el.departure.time.replace('T', ' ') + ':00',
                arrivalDate: el.arrival.time.replace('T', ' ') + ':00',
                companyCode: el.flight.airline,
                flightNumber: el.flight.number,
                bookingClass: value.prices.prices.ADULT.bookingClass,
              })),
            ],
          });
          console.log(response);
          if (response?.success) {
            setPNR((prev) => ({ ...prev, [key]: response.data }));
            currentAPICalls += 1;
          }
        }
      }
    }
    // If Successful
    if (currentAPICalls === totalAPICalls) setCurrentStep(2);
    else sendToast('error', 'Error', 4000);
  };

  return (
    <section className='pt-40 pb-40 bg-light-2'>
      <div className='container'>
        {/* Itinerary */}
        <div>
          <h1>Itinerary Details</h1>
          {/* To */}
          {selectedBookings?.to && !isBooked.to && (
            <div className='mt-20'>
              <h3>
                {selectedBookings.to.segments[0].departure.airport.code} &rarr;{' '}
                {selectedBookings.to.segments.at(-1).arrival.airport.code}
              </h3>
              <FlightProperty element={selectedBookings.to} isSelectedBooking />
            </div>
          )}
          {/* Return */}
          {selectedBookings?.from && returnFlight && !isBooked.from && (
            <div className='mt-30'>
              <h3>
                {selectedBookings.from.segments[0].departure.airport.code} &rarr;{' '}
                {selectedBookings.from.segments.at(-1).arrival.airport.code}
              </h3>
              <FlightProperty element={selectedBookings.from} isSelectedBooking />
            </div>
          )}
        </div>
        {/* Traveller Details */}
        <div className='mt-20'>
          <h1>Traveller Details</h1>
          {travellerInfo &&
            travellerInfo.length > 0 &&
            travellerInfo.map((element, index) => (
              <div key={index}>
                {console.log(element)}
                <h3 className='mt-20'>{element.aliases[0]}</h3>
                <div key={index} className='bg-white py-30 px-30 mt-20'>
                  <h4>Frequent Flier</h4>
                  <div className='row my-3 y-gap-20'>
                    <div className='col-md-6 form-input-select'>
                      <label>Frequent Flier Program</label>
                      <Select
                        options={frequentFliers.map((el) => ({
                          value: el.code,
                          label: el.program,
                        }))}
                        value={element.frequentFliers}
                        onChange={(id) =>
                          setTravellerInfo((prev) => {
                            prev[index]['frequentFliers'] = id;
                            return [...prev];
                          })
                        }
                      />
                    </div>
                    <div className='form-input col-md-6 bg-white'>
                      <input
                        onChange={(e) =>
                          setTravellerInfo((prev) => {
                            prev[index]['membershipID'] = e.target.value;
                            return [...prev];
                          })
                        }
                        value={element['membershipID']}
                        placeholder=' '
                        type='text'
                      />
                      <label className='lh-1 text-16 text-light-1'>Membership ID</label>
                    </div>
                  </div>
                  <h4>Traveller</h4>
                  <div className='row my-3'>
                    <div className='row col-12 mb-20 y-gap-20'>
                      <div className='col-md-2 form-input-select'>
                        <label>Gender</label>
                        <Select
                          options={passportGenderOptions}
                          value={element.passport_gender}
                          onChange={(id) =>
                            setTravellerInfo((prev) => {
                              prev[index]['passport_gender'] = id;
                              return [...prev];
                            })
                          }
                        />
                      </div>
                      <div className='form-input col-md-5 bg-white'>
                        <input
                          onChange={(e) =>
                            setTravellerInfo((prev) => {
                              prev[index]['first_name'] = e.target.value;
                              return [...prev];
                            })
                          }
                          value={element['first_name']}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>First Name</label>
                      </div>
                      <div className='form-input col-md-5 bg-white'>
                        <input
                          onChange={(e) =>
                            setTravellerInfo((prev) => {
                              prev[index]['last_name'] = e.target.value;
                              return [...prev];
                            })
                          }
                          value={element['last_name']}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Last Name</label>
                      </div>
                    </div>
                    <div className='row col-12 y-gap-20'>
                      <div className='form-datepicker col-md-6'>
                        <label>Date of Birth</label>
                        <DatePicker
                          style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                          inputClass='custom_input-picker'
                          containerClassName='custom_container-picker'
                          value={
                            new DateObject({
                              date: element.passport_dob,
                              format: 'YYYY-MM-DD',
                            })
                          }
                          onChange={(date) =>
                            setTravellerInfo((prev) => {
                              prev[index]['passport_dob'] = date.format('YYYY-MM-DD');
                              return [...prev];
                            })
                          }
                          numberOfMonths={1}
                          offsetY={10}
                          format='DD MMMM YYYY'
                        />
                      </div>
                      <div className='form-input col-md-6 bg-white'>
                        <input
                          onChange={(e) =>
                            setTravellerInfo((prev) => {
                              prev[index]['mobile_phone'] = e.target.value;
                              return [...prev];
                            })
                          }
                          value={element['mobile_phone']}
                          placeholder=' '
                          type='number'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Mobile Phone No.
                        </label>
                      </div>
                    </div>
                  </div>
                  <h4>Miscellaneous Details</h4>
                  <div className='row my-3 y-gap-20'>
                    <div className='col-md-6 form-input-select'>
                      <label>Meal Preference</label>
                      <Select
                        options={mealPreferenceOptions}
                        value={element.meal_preference}
                        onChange={(id) =>
                          setTravellerInfo((prev) => {
                            prev[index]['meal_preference'] = id;
                            return [...prev];
                          })
                        }
                      />
                    </div>
                    <div className='col-md-6 form-input-select'>
                      <label>Seat Preference</label>
                      <Select
                        options={seatPreferenceOptions}
                        value={element.seat_preference}
                        onChange={(id) =>
                          setTravellerInfo((prev) => {
                            prev[index]['seat_preference'] = id;
                            return [...prev];
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className='d-flex col-12 justify-end'>
          <button
            className='button -dark-1 px-30 h-50 bg-blue-1 text-white col-4 mt-20'
            onClick={() => onClick()}
          >
            Proceed With Booking
          </button>
        </div>
      </div>
    </section>
  );
}
export default PreviewBooking;
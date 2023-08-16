import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { createItem, customAPICall, getList, updateItem } from '../../../api/xplorzApi';
import { sendToast } from '../../../utils/toastify';
import FlightProperty from '../../flight-list/common/FlightProperty';
import Select from 'react-select';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import LoadingBar from 'react-top-loading-bar';

function PreviewBooking({ setCurrentStep, setPNR, travellerInfos }) {
  const selectedBookings = useSelector(
    (state) => state.flightSearch.value.selectedBookings
  );
  const [isProceed, setIsProceed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [frequentFliers, setFrequentFliers] = useState([]);
  const [containsInternational, setContainsInternational] = useState(false);
  const [travellerInfo, setTravellerInfo] = travellerInfos;
  const returnFlight = useSelector((state) => state.flightSearch.value.returnFlight);
  const lowCostBookings = ['IX', '6E', 'SG', 'G8', 'I5', 'QP', 'AI'];
  const travellers = useSelector((state) => state.flightSearch.value.travellers);
  const airports = useSelector((state) => state.apis.value.airports);
  const destinations = useSelector((state) => state.flightSearch.value.destinations);
  const router = useRouter();
  const mealPreferenceOptions = [
    { value: 'AVML', label: 'Vegetarian' },
    { value: 'HNML', label: 'Hindi Non Vegetarian' },
    { value: 'VJML', label: 'Jain Vegetarian' },
    { value: 'NVML', label: 'Non Vegetarian' },
    { value: 'VLML', label: 'Lacto Ovo Meal' },
    { value: 'SFML', label: 'Sea Food Meal' },
  ];
  const seatPreferenceOptions = [
    { value: 'Window', label: 'Window' },
    { value: 'Aisle', label: 'Aisle' },
  ];
  const passportPrefixOptions = [
    { value: 'MR', label: 'Mr.' },
    { value: 'MRS', label: 'Mrs.' },
    { value: 'MSTR', label: 'Mstr.' },
    { value: 'MS', label: 'Ms.' },
  ];

  console.log('sel', selectedBookings);

  useEffect(() => {
    if (
      (!selectedBookings.to && !selectedBookings.from && !selectedBookings.combined) ||
      !travellers
    ) {
      router.back();
    }
    getData();
  }, []);

  const getData = async () => {
    // Getting Traveller Details
    if (travellers) {
      const travellerList = await getList('travellers', {
        traveller_ids: travellers.map((el) => el?.traveller_id),
      });
      if (travellerList?.success) {
        setTravellerInfo(
          travellerList.data.map((el) => ({
            ...el,
            ...{
              frequentFliers: null,
              membershipID: '',
              trip_meals: { from: null, to: null, combined: null },
              prefix: el.prefix
                ? el.prefix.toLowerCase() === 'mr'
                  ? { value: 'MR', label: 'Mr.' }
                  : el.prefix.toLowerCase() === 'mrs'
                  ? { value: 'MRS', label: 'Mrs.' }
                  : el.prefix.toLowerCase() === 'mstr'
                  ? { value: 'MSTR', label: 'Mstr.' }
                  : el.prefix.toLowerCase() === 'ms'
                  ? { value: 'MS', label: 'Ms.' }
                  : null
                : null,
            },
          }))
        );
        if (
          destinations?.to?.label?.split('|')?.at(-1) !== 'India' ||
          destinations?.from?.label?.split('|')?.at(-1) !== 'India'
        ) {
          setContainsInternational(true);
        }
      } else {
        sendToast('error', 'Failed to fetch traveller details', 4000);
      }
    }
    // Frequent Fliers
    const frequentFliersList = await getList('travel-membership-programs');
    if (frequentFliersList?.success) {
      setFrequentFliers(frequentFliersList?.data);
    } else {
      sendToast('error', 'Failed to fetch frequent fliers', 4000);
    }
  };

  const onClick = async () => {
    setIsProceed(true);
    // Checking if each traveller has a prefix
    for (let traveller of travellerInfo) {
      if (!traveller.prefix) {
        sendToast('error', 'Each traveller should have a prefix', 4000);
        setIsProceed(false);
        return;
      }
    }
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
      (!isDomestic &&
        totalAPICalls === 2 &&
        selectedBookings.from.provider === 'tj' &&
        selectedBookings.to.provider === 'tj' &&
        !lowCostBookings.includes(selectedBookings.from.segments[0].flight.airline) &&
        !lowCostBookings.includes(selectedBookings.to.segments[0].flight.airline)) ||
      (!isDomestic &&
        selectedBookings?.combined?.provider === 'tj' &&
        !lowCostBookings.includes(selectedBookings.combined.segments[0].flight.airline))
    ) {
      if (selectedBookings.combined) {
        let toSector = [];
        let fromSector = [];
        let isFound = false;
        for (let segment of selectedBookings.combined.segments) {
          let dat = {
            from: segment.departure.airport.code,
            to: segment.arrival.airport.code,
            departureDate: segment.departure.time.replace('T', ' ') + ':00',
            arrivalDate: segment.arrival.time.replace('T', ' ') + ':00',
            companyCode: segment.flight.airline,
            flightNumber: segment.flight.number,
            bookingClass: selectedBookings.combined.prices.prices.ADULT.bookingClass,
          };
          if (!isFound) {
            toSector.push(dat);
            if (segment.arrival.airport.code === destinations?.to?.iata) isFound = true;
          } else {
            fromSector.push(dat);
          }
        }
        let response = await createItem('flights/book', {
          travellers: travellers.map((el) => el.value),
          sectors: [toSector, fromSector],
        });
        if (response?.success) {
          setPNR((prev) => ({
            ...prev,
            combined: { data: response.data, provider: 'ad' },
          }));
          setCurrentStep(2);
          setIsProceed(false);
          return;
        } else {
          sendToast('error', 'Error While Creating Booking', 4000);
          router.back();
          setIsProceed(false);
          return;
        }
      } else {
        let response = await createItem('flights/book', {
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
        if (response?.success) {
          setPNR((prev) => ({
            from: { data: response.data, provider: 'ad' },
            to: { data: response.data, provider: 'ad' },
            combined: null,
          }));
          setCurrentStep(2);
          setIsProceed(false);
          return;
        } else {
          sendToast('error', 'Error While Creating Booking', 4000);
          router.back();
          setIsProceed(false);
          return;
        }
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

    setProgress(Math.floor((currentAPICalls / totalAPICalls) * 100));
    for (let [key, value] of Object.entries(selectedBookings)) {
      let response;
      if (value?.provider === 'aa') {
        // AA
        let pax = [];
        for (let traveller of travellerInfo) {
          let tempObj = {};
          // Code
          const age = (
            (Date.now() -
              +new DateObject({
                date: traveller?.passport_dob,
                format: 'YYYY-MM-DD',
              })
                .toDate()
                .getTime()) /
            31536000000
          ).toFixed(2);
          // If below 2 years of age, infant
          if (age < 2) tempObj['code'] = 'INF';
          // If above 2 but below 12, child
          if (age >= 2 && age < 12) tempObj['code'] = 'CHD';
          // If above 12 years, consider adult
          if (age >= 12) tempObj['code'] = 'ADT';
          // Name
          tempObj['name'] = {
            title: traveller?.prefix?.value ? traveller.prefix.value : traveller?.prefix,
            first: traveller?.first_name,
            last: traveller?.last_name,
            middle: traveller?.middle_name || undefined,
          };
          // DOB
          tempObj['dob'] = traveller?.passport_dob;
          pax.push(tempObj);
        }
        response = await customAPICall(
          'aa/v1/review',
          'post',
          { pax, priceIds: [value.prices.id], journeyIds: [value.journeyKey] },
          {},
          true
        );
        if (response?.success) {
          setPNR((prev) => ({
            ...prev,
            [key]: { data: response.data, provider: 'aa' },
          }));
          currentAPICalls += 1;
        }
      }
      if (value?.provider === 'tj') {
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
          if (response?.success) {
            setPNR((prev) => ({
              ...prev,
              [key]: { data: response.data, provider: 'tj' },
            }));
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
          if (response?.success) {
            setPNR((prev) => ({
              ...prev,
              [key]: { data: response.data, provider: 'ad' },
            }));
            currentAPICalls += 1;
          }
        }
      }
      setProgress(Math.floor((currentAPICalls / totalAPICalls) * 100));
    }
    setIsProceed(false);
    // If Successful
    if (currentAPICalls === totalAPICalls) setCurrentStep(2);
    else {
      sendToast('error', 'Failed To Create Bookings', 4000);
      router.back();
      return;
    }
  };

  return (
    <section className='pt-40 pb-40 bg-light-2'>
      <LoadingBar
        color='#19f9fc'
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <div className='container'>
        {/* Itinerary */}
        <div>
          <h1>Itinerary Details</h1>
          {/* To */}
          {selectedBookings?.to && (
            <div className='mt-20'>
              <h3>
                {selectedBookings.to.segments[0].departure.airport.code} &rarr;{' '}
                {selectedBookings.to.segments.at(-1).arrival.airport.code}
              </h3>
              <FlightProperty
                alreadyExpanded
                element={selectedBookings.to}
                isSelectedBooking
              />
            </div>
          )}
          {/* Return */}
          {selectedBookings?.from && returnFlight && (
            <div className='mt-30'>
              <h3>
                {selectedBookings.from.segments[0].departure.airport.code} &rarr;{' '}
                {selectedBookings.from.segments.at(-1).arrival.airport.code}
              </h3>
              <FlightProperty
                alreadyExpanded
                element={selectedBookings.from}
                isSelectedBooking
              />
            </div>
          )}
          {/* Return */}
          {selectedBookings?.combined && (
            <div className='mt-30'>
              <h3>Round Trip</h3>
              <FlightProperty
                alreadyExpanded
                element={selectedBookings.combined}
                isSelectedBooking
              />
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
                <h3 className='mt-20'>{element.aliases[0]}</h3>
                <div key={index} className='bg-white py-30 px-30 mt-20'>
                  <h4>Traveller</h4>
                  <div className='row my-3'>
                    <div className='row col-12 mb-20 y-gap-20'>
                      <div className='col-md-3 form-input-select'>
                        <label>Prefix</label>
                        <Select
                          options={passportPrefixOptions}
                          value={element.prefix}
                          onChange={(id) =>
                            setTravellerInfo((prev) => {
                              prev[index]['prefix'] = id;
                              return [...prev];
                            })
                          }
                        />
                      </div>
                      <div className='form-input col-md-3 bg-white'>
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
                      <div className='form-input col-md-3 bg-white'>
                        <input
                          onChange={(e) =>
                            setTravellerInfo((prev) => {
                              prev[index]['middle_name'] = e.target.value;
                              return [...prev];
                            })
                          }
                          value={element['middle_name']}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Middle Name</label>
                      </div>
                      <div className='form-input col-md-3 bg-white'>
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
                  {containsInternational && (
                    <>
                      <h4>Passport</h4>
                      <div className='row my-3'>
                        <div className='row col-12 y-gap-20'>
                          <div className='form-input col-md-4 bg-white'>
                            <input
                              onChange={(e) =>
                                setTravellerInfo((prev) => {
                                  prev[index]['passport_number'] = e.target.value;
                                  return [...prev];
                                })
                              }
                              value={element['passport_number']}
                              placeholder=' '
                              type='text'
                            />
                            <label className='lh-1 text-16 text-light-1'>
                              Passport Number
                            </label>
                          </div>
                          <div className='form-input col-md-4 bg-white'>
                            <input
                              onChange={(e) =>
                                setTravellerInfo((prev) => {
                                  prev[index]['passport_name'] = e.target.value;
                                  return [...prev];
                                })
                              }
                              value={element['passport_name']}
                              placeholder=' '
                              type='text'
                            />
                            <label className='lh-1 text-16 text-light-1'>
                              Passport Name
                            </label>
                          </div>
                          <div className='form-input col-md-4 bg-white'>
                            <input
                              onChange={(e) =>
                                setTravellerInfo((prev) => {
                                  prev[index]['passport_issue_place'] = e.target.value;
                                  return [...prev];
                                })
                              }
                              value={element['passport_issue_place']}
                              placeholder=' '
                              type='text'
                            />
                            <label className='lh-1 text-16 text-light-1'>
                              Passport Issue Place
                            </label>
                          </div>
                          <div className='form-datepicker col-md-6'>
                            <label>Issue Date</label>
                            <DatePicker
                              style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                              inputClass='custom_input-picker'
                              containerClassName='custom_container-picker'
                              value={
                                new DateObject({
                                  date: element.passport_issue_date,
                                  format: 'YYYY-MM-DD',
                                })
                              }
                              onChange={(date) =>
                                setTravellerInfo((prev) => {
                                  prev[index]['passport_issue_date'] =
                                    date.format('YYYY-MM-DD');
                                  return [...prev];
                                })
                              }
                              numberOfMonths={1}
                              offsetY={10}
                              format='DD MMMM YYYY'
                            />
                          </div>
                          <div className='form-datepicker col-md-6'>
                            <label>Expiry Date</label>
                            <DatePicker
                              style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                              inputClass='custom_input-picker'
                              containerClassName='custom_container-picker'
                              value={
                                new DateObject({
                                  date: element.passport_expiry_date,
                                  format: 'YYYY-MM-DD',
                                })
                              }
                              onChange={(date) =>
                                setTravellerInfo((prev) => {
                                  prev[index]['passport_expiry_date'] =
                                    date.format('YYYY-MM-DD');
                                  return [...prev];
                                })
                              }
                              numberOfMonths={1}
                              offsetY={10}
                              format='DD MMMM YYYY'
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  <h4>Frequent Flier</h4>
                  <div className='row my-3'>
                    <div className='row col-12 y-gap-20'>
                      <div className='col-md-6 form-input-select'>
                        <label>Travel Membership Program</label>
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
                  </div>
                  {/* <h4>Miscellaneous Details</h4> */}
                  <div className='row my-1 y-gap-20'>
                    <div className='col-md-6'>
                      <h5 className='fw-500'>Seat Preference: </h5>
                      {element.seat_preference
                        ? element.seat_preference
                        : 'No Preference'}
                    </div>
                    <div className='col-md-6'>
                      <h5 className='fw-500'>Meal Preference: </h5>
                      {element.meal_preference ? (
                        <>
                          {mealPreferenceOptions.map((m) => (
                            <>{m.value === element.meal_preference && <>{m.label}</>}</>
                          ))}
                        </>
                      ) : (
                        'No Preference'
                      )}
                    </div>
                    {/* <div className='col-md-6 form-input-select'>
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
                    </div> */}
                  </div>
                  <div className='d-flex col-12 justify-end'>
                    <a
                      className='h-50 cursor-pointer text-primary'
                      onClick={async () => {
                        const response = await updateItem('travellers', element.id, {
                          ...element,
                          ...{
                            prefix: element.prefix.value ? element.prefix.value : null,
                            first_name: element.first_name,
                            middle_name: element.middle_name,
                            last_name: element.last_name,
                            passport_dob: element.passport_dob,
                            mobile_phone: element.mobile_phone,
                            passport_number: element.passport_number,
                            passport_name: element.passport_name,
                            passport_issue_place: element.passport_issue_place,
                            passport_issue_date: element.passport_issue_date,
                            passport_expiry_date: element.passport_expiry_date,
                          },
                        });
                        if (response.success) {
                          sendToast('success', 'Traveller updated successfully', 4000);
                        } else {
                          sendToast(
                            'error',
                            response.data?.error ||
                              response.data?.message ||
                              'Error updating traveller',
                            4000
                          );
                        }
                      }}
                    >
                      Update on Profile
                    </a>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className='d-flex col-12 justify-end'>
          <button
            disabled={isProceed}
            className='button -dark-1 px-30 h-50 bg-blue-1 text-white col-md-4 mt-20'
            onClick={() => onClick()}
          >
            Proceed To Seat Selection
          </button>
        </div>
      </div>
    </section>
  );
}
export default PreviewBooking;

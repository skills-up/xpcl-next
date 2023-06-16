import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createItem } from '../../../api/xplorzApi';
import { sendToast } from '../../../utils/toastify';
import FlightProperty from '../../flight-list/common/FlightProperty';

function PreviewBooking({ setCurrentStep, isBooked, setPNR }) {
  const selectedBookings = useSelector(
    (state) => state.flightSearch.value.selectedBookings
  );
  const returnFlight = useSelector((state) => state.flightSearch.value.returnFlight);
  useEffect(() => {
    if (!selectedBookings.to && !selectedBookings.from) {
      console.log('nothing found');
    }
  }, []);
  const lowCostBookings = ['IX', '6E', 'SG', 'G8', 'I5'];
  const travellers = useSelector((state) => state.flightSearch.value.travellers);

  const onClick = async () => {
    // Total API Calls to succeed, we check this by checking if selectedbookings.from has a value
    let totalAPICalls = 1;
    let currentAPICalls = 0;
    if (selectedBookings.from) totalAPICalls = 2;
    // Api Call
    for (let [key, value] of Object.entries(selectedBookings)) {
      let response;
      if (value.provider === 'aa') {
      }
      if (value.provider === 'tj') {
        // Checking if low cost carrier or not
        if (lowCostBookings.includes(value.segments[0].flight.airline)) {
          // TJ
          //   response = await customAPICall('aa/v1/review', 'post', request, {}, true)
        } else {
          // AD
          response = await createItem('flights/book', {
            travellers: travellers.map((el) => el.value),
            sectors: value.segments.map((el) => ({
              from: el.departure.airport.code,
              to: el.arrival.airport.code,
              departureDate: el.departure.time.replace('T', ' ') + ':00',
              arrivalDate: el.arrival.time.replace('T', ' ') + ':00',
              companyCode: el.flight.airline,
              flightNumber: el.flight.number,
              bookingClass: value.prices.prices.ADULT.bookingClass,
            })),
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
        <h1>Confirm Booking Details</h1>
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

import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import FlightProperty from '../common/FlightProperty';

function SelectedBookings() {
  const selectedBooking = useSelector(
    (state) => state.flightSearch.value.selectedBookings
  );
  const emailClientMode = useSelector(
    (state) => state.flightSearch.value.emailClientMode
  );
  const router = useRouter();
  return (
    <>
      {!emailClientMode && (selectedBooking?.to || selectedBooking?.from) && (
        <div className='mb-30'>
          {/* Title */}
          <h2>Selected Bookings</h2>
          {/* To */}
          {selectedBooking?.to && (
            <FlightProperty element={selectedBooking.to} isSelectedBooking />
          )}
          {/* From */}
          {selectedBooking?.from && (
            <FlightProperty element={selectedBooking.from} isSelectedBooking />
          )}
          {/* Button */}
          <div className='d-flex justify-end'>
            <button
              className='button -dark-1 px-30 col-md-4 col-12 h-40 bg-blue-1 text-white mt-10'
              onClick={() => router.push('/flight/book')}
            >
              Book
            </button>
          </div>
        </div>
      )}
    </>
  );
}
export default SelectedBookings;

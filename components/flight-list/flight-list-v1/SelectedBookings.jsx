import { useSelector } from 'react-redux';
import FlightProperty from '../common/FlightProperty';

function SelectedBookings() {
  const selectedBooking = useSelector(
    (state) => state.flightSearch.value.selectedBookings
  );
  const emailClientMode = useSelector(
    (state) => state.flightSearch.value.emailClientMode
  );
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
        </div>
      )}
    </>
  );
}
export default SelectedBookings;

import SeatImg from '../../../public/img/flights/seat-img';
import { BiRupee } from 'react-icons/bi';

function Seat({
  label,
  type,
  isPriced = false,
  fill = '#000',
  clickable = false,
  onClick = () => {
    return;
  },
}) {
  return (
    <div
      style={{ cursor: clickable ? 'pointer' : 'not-allowed' }}
      id='seat'
      onClick={() => {
        if (clickable) onClick();
      }}
      className={`${type}`}
    >
      {/* <SeatImg fill={fill} /> */}
      <span className='main-label'>{label}</span>
      {isPriced && (
        <span className='priced-icon'>
          <BiRupee />
        </span>
      )}
    </div>
  );
}
export default Seat;

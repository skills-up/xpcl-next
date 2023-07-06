import SeatImg from '../../../public/img/flights/seat-img';

function Seat({
  label,
  type,
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
    >
      <SeatImg fill={fill} />
      <span style={{ color: fill }}>{label}</span>
    </div>
  );
}
export default Seat;

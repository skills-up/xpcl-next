import React, { useEffect, useState } from 'react';
import Room from './Room';

const GuestSearch = ({ guestRoomsData }) => {
  const [roomsData, setRoomsData] = guestRoomsData;
  const [guestCounts, setGuestCounts] = useState({ rooms: 0, adults: 0, children: 0 });

  const calculateCounts = () => {
    let adults = 0,
      children = 0,
      rooms = roomsData?.length;
    for (let room of roomsData) {
      adults += room?.adults;
      children += room?.child?.length;
    }
    setGuestCounts({ rooms, adults, children });
  };

  const deleteRoom = (idx) => {
    setRoomsData((prev) => {
      prev.splice(idx, 1);
      return [...prev];
    });
  };

  const appendRoom = () => {
    setRoomsData((prev) => [...prev, { adults: 1, child: [] }]);
  };

  useEffect(() => {
    calculateCounts();
  }, [roomsData]);

  return (
    <div className='searchMenu-guests px-20  lg:py-20 lg:px-0 js-form-dd bg-white position-relative'>
      <div
        data-bs-toggle='dropdown'
        data-bs-auto-close='outside'
        aria-expanded='false'
        data-bs-offset='0,22'
      >
        <h4 className='text-15 fw-500 ls-2 lh-16'>For</h4>
        <div className='text-15 text-light-1 ls-2 lh-16'>
          <span className='js-count-room'>{guestCounts.rooms}</span> Room(s) -
          <span className='js-count-adult'> {guestCounts.adults}</span> Adult(s)
          {guestCounts.children ? (
            <span>
              {' '}
              &amp; <span className='js-count-child'>{guestCounts.children}</span>{' '}
              Children
            </span>
          ) : (
            ''
          )}
        </div>
      </div>
      {/* End guest */}

      <div
        className='shadow-2 dropdown-menu min-width-400'
        style={{ maxHeight: 400, overflowY: 'auto' }}
      >
        {roomsData.map((room, idx) => {
          return (
            <div
              className='roomSearch-room bg-white px-30 py-30 rounded-4 counter-box'
              key={idx}
            >
              <div className='d-flex justify-between items-center'>
                <h6>Room #{idx + 1}</h6>
                {idx ? (
                  <a className='button text-20 js-up' onClick={() => deleteRoom(idx)}>
                    {' '}
                    &times;{' '}
                  </a>
                ) : (
                  ''
                )}
              </div>
              <Room roomsData={room} setRoomsData={setRoomsData} index={idx} />
            </div>
          );
        })}
        {roomsData.length < 9 ? (
          <div className='roomSearch-room bg-white px-30 py-30 rounded-4 counter-box'>
            <button
              className='button -outline-blue-1 text-blue-1 size-38 rounded-4 js-up'
              onClick={appendRoom}
            >
              <i className='icon-plus text-12' />
            </button>
          </div>
        ) : (
          ''
        )}
      </div>
    </div>
  );
};

export default GuestSearch;

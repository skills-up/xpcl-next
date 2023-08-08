import Image from 'next/image';

const ItineraryContent = ({ pd, checkIn }) => {
  const itineraryContent = [
    {
      id: 1,
      targetCollapse: 'item_1',
      itemNo: '1',
      title: 'Windsor Castle',
      img: '/img/tours/list.png',
      content: `Our first stop is Windsor Castle, the ancestral home of the British Royal family for more than 900 years and the largest, continuously occupied castle in Europe.`,
      classShowHide: '',
    },
    {
      id: 2,
      targetCollapse: 'item_2',
      itemNo: '2',
      title: "St. George's Chapel",
      img: '/img/tours/list.png',
      content: `Our first stop is Windsor Castle, the ancestral home of the British Royal family for more than 900 years and the largest, continuously occupied castle in Europe.`,
      classShowHide: 'show',
    },
    {
      id: 3,
      targetCollapse: 'item_3',
      itemNo: '3',
      title: 'The Roman Baths',
      img: '/img/tours/list.png',
      content: `Our first stop is Windsor Castle, the ancestral home of the British Royal family for more than 900 years and the largest, continuously occupied castle in Europe.`,
      classShowHide: '',
    },
    {
      id: 4,
      targetCollapse: 'item_4',
      itemNo: '4',
      title: 'Stonehenge',
      img: '/img/tours/list.png',
      content: `Our first stop is Windsor Castle, the ancestral home of the British Royal family for more than 900 years and the largest, continuously occupied castle in Europe.`,
      classShowHide: '',
    },
  ];

  return (
    <>
      {pd.map((item, index) => (
        <div className='col-12' key={index}>
          <div className='accordion__item '>
            <div className='d-flex items-center'>
              <div
                className='accordion__icon size-40 flex-center bg-blue-2 text-blue-1 rounded-full'
                style={{ zIndex: '2' }}
              >
                <div className='text-14 fw-500'>{index + 1}</div>
              </div>
              {/* End item number */}

              <div className='ml-20'>
                <div className='text-16 lh-15'>
                  {item.am === 0 ? (
                    <span className='text-success'>
                      Cancel for free between{' '}
                      {new Date(item.fdt).toLocaleString('en-IN', {
                        dateStyle: 'long',
                        timeStyle: 'short',
                      })}{' '}
                      and{' '}
                      {new Date(item.tdt).toLocaleString('en-IN', {
                        dateStyle: 'long',
                        timeStyle: 'short',
                      })}
                    </span>
                  ) : (
                    <span>
                      Cancellation between{' '}
                      <span className='text-primary'>
                        {new Date(item.fdt).toLocaleString('en-IN', {
                          dateStyle: 'long',
                          timeStyle: 'short',
                        })}
                      </span>{' '}
                      and{' '}
                      <span className='text-primary'>
                        {new Date(item.tdt).toLocaleString('en-IN', {
                          dateStyle: 'long',
                          timeStyle: 'short',
                        })}
                      </span>{' '}
                      will cost{' '}
                      <span className='text-primary'>
                        {item.am.toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'INR',
                        })}
                      </span>
                      .
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      {/* Check In */}
      <div className='col-12'>
        <div className='accordion__item '>
          <div className='d-flex items-center'>
            <div
              className='accordion__icon size-40 flex-center bg-blue-2 text-blue-1 rounded-full'
              style={{ zIndex: '2' }}
            >
              <div className='text-14 fw-500'>{pd.length + 1}</div>
            </div>
            {/* End item number */}

            <div className='ml-20'>
              <div className='text-16 lh-15 fw-500'>
                Check-In{' '}
                {new Date(checkIn)
                  .toLocaleString('en-IN', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })
                  .slice(0, 14)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ItineraryContent;

import Image from 'next/image';
import { DateObject } from 'react-multi-date-picker';
import { useSelector } from 'react-redux';

const BookingDetails = ({ PNR }) => {
  const age = useSelector((state) => state.hotelSearch.value.age);
  const totalAdults = age.totalAdult;
  const totalChildren = age.totalChildren;
  if (PNR)
    return (
      <div className='px-30 py-30 border-light rounded-4'>
        <div className='text-20 fw-500 mb-30'>Your booking details</div>
        <div className='row x-gap-15 y-gap-20'>
          <div className='col-auto'>
            <Image
              width={140}
              height={140}
              src={
                PNR.data.hInfo.img && PNR.data.hInfo.img.length > 0
                  ? PNR.data.hInfo.img[0].url
                  : '/img/backgrounds/1.png'
              }
              alt='image'
              className='size-140 rounded-4 object-cover'
            />
          </div>
          {/* End .col */}
          <div className='col'>
            <div className='d-flex x-gap-5 pb-10 items-center'>
              <div className='size-30 flex-center bg-blue-1 rounded-4 mr-5'>
                <div className='text-12 fw-600 text-white'>{PNR.data.hInfo.rt}</div>
              </div>{' '}
              {[...Array(PNR.data.hInfo.rt)].map((star, starIndex) => (
                <i key={starIndex} className='icon-star text-yellow-1 text-10' />
              ))}
            </div>
            {/* End ratings */}
            <div className='lh-17 fw-500'>{PNR.data.hInfo.name}</div>
            <div className='text-14 lh-15 mt-5'>
              {PNR.data.hInfo.ad.adr}, {PNR.data.hInfo.ad.city.name},{' '}
              {PNR.data.hInfo.ad.country.name}
            </div>
            <div className='row x-gap-10 y-gap-10 items-center pt-5'>
              <div className='col-auto'>
                <div className='d-flex items-center text-12'>{PNR.data.hInfo.pt}</div>
              </div>
            </div>
          </div>
          {/* End .col */}
        </div>
        {/* End .row */}

        <div className='border-top-light mt-30 mb-20' />
        <div className='row y-gap-20 justify-between'>
          <div className='col-auto'>
            <div className='text-15'>Check-in</div>
            <div className='fw-500'>
              {new DateObject({
                date: PNR.data.query.checkinDate,
                format: 'YYYY-MM-DD',
              }).format('D MMMM YYYY')}
            </div>
          </div>
          <div className='col-auto md:d-none'>
            <div className='h-full w-1 bg-border' />
          </div>
          <div className='col-auto text-right md:text-left'>
            <div className='text-15'>Check-out</div>
            <div className='fw-500'>
              {new DateObject({
                date: PNR.data.query.checkoutDate,
                format: 'YYYY-MM-DD',
              }).format('D MMMM YYYY')}
            </div>
          </div>
        </div>
        {/* End row */}

        <div className='border-top-light mt-30 mb-20' />
        <div>
          <div className='text-15'>Total length of stay:</div>
          <div className='fw-500'>
            {(new DateObject({
              date: PNR.data.query.checkoutDate,
              format: 'YYYY-MM-DD',
            })
              .toDate()
              .getTime() -
              new DateObject({
                date: PNR.data.query.checkinDate,
                format: 'YYYY-MM-DD',
              })
                .toDate()
                .getTime()) /
              86400000}{' '}
            nights
          </div>
        </div>

        <div className='border-top-light mt-30 mb-20' />
        <div className='row y-gap-5 justify-between items-center'>
          <div className='col-auto'>
            <div className='text-15'>You selected:</div>
            {PNR.room.ris.map((element, index) => (
              <div className='fw-500' key={element.id}>
                {element.rc}
              </div>
            ))}
          </div>
          <div className='col-auto'>
            <div className='text-15'>
              {' '}
              {totalAdults > 0
                ? totalAdults > 1
                  ? totalAdults + ' Adults'
                  : totalAdults + ' Adult'
                : ''}
              {totalChildren > 0
                ? totalChildren > 1
                  ? ', ' + totalChildren + ' Children'
                  : ', ' + totalChildren + ' Child'
                : ''}
            </div>
          </div>
        </div>
        {/* End row */}
      </div>
      // End px-30
    );
};

export default BookingDetails;

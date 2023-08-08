import Image from 'next/image';
import { useEffect, useState } from 'react';
import { IoMdWarning } from 'react-icons/io';
import { DateObject } from 'react-multi-date-picker';
import { useSelector } from 'react-redux';
import { customAPICall } from '../../../api/xplorzApi';
import ItineraryContent from './ItineraryContent';
import Pluralize from '../../../utils/pluralChecker';

const BookingDetails = ({ PNR }) => {
  const age = useSelector((state) => state.hotelSearch.value.age);
  const totalAdults = age.totalAdult;
  const totalChildren = age.totalChildren;
  const [cancellationPolicy, setCancellationPolicy] = useState(null);
  useEffect(() => {
    if (PNR) getCancellationPolicy();
  }, []);

  const getCancellationPolicy = async () => {
    let response = await customAPICall(
      'tj/v1/htl/cancel-policy',
      'get',
      {},
      { params: { id: PNR.data.hInfo.id, optionId: PNR.room.id } },
      true
    );
    if (response?.success) {
      if (response.data.cancellationPolicy) setCancellationPolicy(response.data);
    }
  };

  if (PNR)
    return (
      <div className='px-30 py-30 border-light rounded-4'>
        <div className='text-20 fw-500 mb-30'>Your booking details</div>
        <div className='row x-gap-15 y-gap-20'>
          <div className='col-auto'>
            {console.log('PNR', PNR)}
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
                ? totalAdults + Pluralize(' Adult', ' Adults', totalAdults)
                : ''}
              {totalChildren > 0
                ? ', ' + totalChildren + Pluralize(' Child', ' Children', totalChildren)
                : ''}
            </div>
          </div>
        </div>

        {cancellationPolicy && (
          <>
            <div className='border-top-light mt-30 mb-20' />
            <div>
              {/* BA */}
              <span>
                {PNR.data.conditions.isBA
                  ? 'This booking is refundable, subject to timely cancellation as per '
                  : 'Cancellation for this booking will incur cancellation penalty as per '}
                <span className='text-primary'>Cancellation Policy</span>.
              </span>
              {/* Cancellation Policy */}
              <div className='bg-light px-10 py-10 mt-10'>
                {cancellationPolicy?.cancellationPolicy?.ifra ? (
                  <span>
                    <span className='text-primary'>Cancellation Policy</span> - Full
                    Refund is available.
                  </span>
                ) : (
                  <span className='d-flex items-center gap-2'>
                    <IoMdWarning className='text-25 text-warning' />
                    Refund will include cancellation penalties.
                  </span>
                )}
                {cancellationPolicy.cancellationPolicy.pd &&
                  cancellationPolicy.cancellationPolicy.pd.length > 0 && (
                    <>
                      <h5 className='mb-10 mt-20'>Cancellation Penalty Details</h5>
                      <div className='relative'>
                        <div className='border-test' />
                        <div
                          className='accordion -map row y-gap-20'
                          id='itineraryContent'
                        >
                          <ItineraryContent
                            checkIn={PNR.data.query.checkinDate}
                            pd={cancellationPolicy.cancellationPolicy.pd}
                          />{' '}
                        </div>
                      </div>
                    </>
                  )}
              </div>
            </div>
          </>
        )}
        {/* End row */}
      </div>
      // End px-30
    );
};

export default BookingDetails;

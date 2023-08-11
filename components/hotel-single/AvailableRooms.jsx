import { auto } from '@popperjs/core';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import Pluralize from '../../utils/pluralChecker';

const AvailableRooms = ({ hotel, onRoomSelect, rooms, isProgress }) => {
  return (
    <>
      <div className='border-light rounded-4 px-30 py-30 sm:px-20 sm:py-20 mb-20'>
        {hotel.ris.map((h, hI) => (
          <>
            <div className='row y-gap-20' key={hI}>
              <div className='col-12'>
                <h3 className='text-18 fw-500 mb-15'>{h.rc}</h3>
                {h.des && <span className='text-secondary mb-15 d-block'>{h.des}</span>}
                <div className='roomGrid'>
                  <div className='roomGrid__header'>
                    <div>Room</div>
                    <div>Extra Benefits</div>
                    <div>Occupants</div>
                  </div>
                  {/* End .roomGrid__header */}

                  <div className='roomGrid__grid'>
                    <div>
                      <div className='ratio ratio-1:1'>
                        <Image
                          width={180}
                          height={180}
                          src={h?.imgs ? h.imgs[0].url : '/img/backgrounds/1.png'}
                          alt='image'
                          className='img-ratio rounded-4'
                        />
                      </div>
                      {/* End image */}
                      <div className='y-gap-5 mt-20 pl-10 lg:pl-0'>
                        {/* Beds */}
                        {h?.radi?.bds &&
                          h?.radi?.bds?.length > 0 &&
                          h?.radi?.bds.map((bed, bedIn) => (
                            <div className='d-flex items-center' key={bedIn}>
                              <i className='icon-bed text-20 mr-10' />
                              <div className='text-15'>
                                {bed.bc} - {bed.bt} {bed.bc > 1 ? 'Beds' : 'Bed'}
                              </div>
                            </div>
                          ))}
                        {/* View */}
                        {h?.radi?.vi && (
                          <div className='d-flex items-center'>
                            <i className='icon-city text-20 mr-10' />
                            <div className='text-15'>View: {h.radi.vi}</div>
                          </div>
                        )}
                        {/* Services */}
                        {h?.rexb?.SERVICE &&
                          h?.rexb?.SERVICE.length > 0 &&
                          h?.rexb?.SERVICE.map((service) => (
                            <>
                              {service?.values &&
                                service.values.map((val, valIn) => (
                                  <div className='d-flex items-center' key={valIn}>
                                    <i className='icon-arrow-right text-20 mr-10' />
                                    <div className='text-15'>{val}</div>
                                  </div>
                                ))}
                            </>
                          ))}
                        {/* <div className='d-flex items-center'>
                          <i className='icon-no-smoke text-20 mr-10' />
                          <div className='text-15'>Non-smoking rooms</div>
                        </div>
                        <div className='d-flex items-center'>
                          <i className='icon-wifi text-20 mr-10' />
                          <div className='text-15'>Free WiFi</div>
                        </div>
                        <div className='d-flex items-center'>
                          <i className='icon-parking text-20 mr-10' />
                          <div className='text-15'>Parking</div>
                        </div>
                        <div className='d-flex items-center'>
                          <i className='icon-kitchen text-20 mr-10' />
                          <div className='text-15'>Kitchen</div>
                        </div> */}
                      </div>
                      {/* End room features */}
                    </div>
                    {/* End roomgrid inner */}

                    <div className='y-gap-30'>
                      <div className='roomGrid__content'>
                        {/* Extra Benefits */}
                        {h?.rexb?.BENEFIT && h?.rexb?.BENEFIT?.length > 0 ? (
                          <div>
                            <div className='text-15 fw-500 mb-10'>
                              Your extra benefits for this room includes:
                            </div>
                            <div className='y-gap-8'>
                              {h?.rexb?.BENEFIT.map((ben) => (
                                <>
                                  {ben.values.map((val, valIn) => (
                                    <div
                                      className='d-flex items-center text-green-2'
                                      key={valIn}
                                    >
                                      <i className='icon-check text-12 mr-10' />
                                      <div className='text-15'>{val}</div>
                                    </div>
                                  ))}
                                </>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className='text-15 fw-500 mb-10'>
                              No extra benefits found for this room.
                            </div>
                          </div>
                        )}
                        {/* Sleeps */}
                        {rooms && rooms.length > 0 && (
                          <div className='d-flex items-center gap-1'>
                            <div className='icon-man text-24' />
                            <span className='text-15 lh-12 fw-500'>
                              {rooms[hI].adult}{' '}
                              {Pluralize('Adult', 'Adults', rooms[hI].adult)}
                              {rooms[hI].child.length > 0
                                ? ', ' +
                                  rooms[hI].child.length +
                                  Pluralize(' Child', ' Children', rooms[hI].child.length)
                                : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* End price features */}

                    <div>
                      <div className='text-14 lh-1'>Room Total</div>
                      <div className='text-22 fw-500 lh-17 mt-5'>
                        {h?.tp?.toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'INR',
                        })}
                      </div>
                      <div className='text-15 fw-500 mt-15'>Price Breakup:</div>
                      <ul className='list-disc y-gap-4 pt-5'>
                        <li className='text-14'>
                          <span style={{ fontWeight: 'bold' }}>Base Fare: </span>
                          {h?.tfcs?.BF?.toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR',
                          }) || 0}
                        </li>
                        <li className='text-14'>
                          <span style={{ fontWeight: 'bold' }}>Taxes & Fees: </span>
                          {h?.tfcs?.TAF?.toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR',
                          }) || 0}
                        </li>
                      </ul>
                    </div>
                    {/* End right price info */}
                  </div>
                </div>
                {/* End .roomGrid */}
              </div>
              {/* End .col-12 */}
            </div>
            {/* End .row */}

            {hotel.ris.length > 1 && hI < hotel.ris.length - 1 && (
              <div className='border-top-light mt-30 mb-20' />
            )}
          </>
        ))}
        <div className='border-light rounded-4 row px-10 py-10 mt-20 lg:px-0'>
          <div className='col-lg-6 flex items-center gap-2'>
            <div className='text-14 lh-1'>Booking Total</div>
            <div className='text-22 fw-500 lh-17'>
              {hotel?.tp?.toLocaleString('en-IN', {
                maximumFractionDigits: 2,
                style: 'currency',
                currency: 'INR',
              })}
            </div>
          </div>
          <div className='col-lg-6'>
            <button
              disabled={isProgress}
              onClick={() => onRoomSelect(hotel)}
              className='button h-50 px-24 col-12 -dark-1 bg-blue-1 text-white'
            >
              Reserve <div className='icon-arrow-top-right ml-15' />
            </button>
          </div>
        </div>
      </div>
      {/* End standard twin room */}
    </>
  );
};

export default AvailableRooms;

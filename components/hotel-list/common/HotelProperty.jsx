import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import Image from 'next/image';
import Link from 'next/link';
import { DateObject } from 'react-multi-date-picker';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Pluralize from '../../../utils/pluralChecker';

function HotelProperty({ item }) {
  const searchData = useSelector((state) => state.hotelSearch.value.searchData);
  const age = useSelector((state) => state.hotelSearch.value.age);
  const totalAdults = age.totalAdult;
  const totalChildren = age.totalChildren;
  console.log('total', totalChildren, totalAdults);
  const router = useRouter();
  return (
    <div className='col-12 bg-white px-20 mb-30 rounded-4 lg:mb-20' key={item?.id}>
      <div className='pt-30 pb-10'>
        <div className='row x-gap-20 y-gap-20'>
          <div className='col-md-auto'>
            <div className='cardImage ratio ratio-1:1 w-250 md:w-1/1 rounded-4'>
              <div className='cardImage__content'>
                <div className='cardImage-slider rounded-4  custom_inside-slider'>
                  <Swiper
                    className='mySwiper'
                    modules={[Pagination, Navigation]}
                    pagination={{
                      clickable: true,
                    }}
                    navigation={true}
                  >
                    {item?.img.map((slide, i) => {
                      if (slide?.url || slide?.tns)
                        return (
                          <SwiperSlide key={i}>
                            <img
                              style={{
                                width: '100%',
                                minHeight: '230px',
                                objectFit: 'cover',
                              }}
                              // width={250}
                              // height={250}
                              className='rounded-4 col-12 js-lazy'
                              src={slide?.url || slide?.tns}
                              alt='image'
                            />
                          </SwiperSlide>
                        );
                    })}
                  </Swiper>
                </div>
              </div>
              {/* End image */}
            </div>
          </div>
          {/* End .col */}

          <div className='col-md'>
            <h3 className='text-18 lh-16 fw-500'>
              {item?.name?.replaceAll('&amp;', '&').replaceAll('&#039;', "'")}
              <div className='d-flex items-center'>
                {item?.ad?.city?.name}
                <div className='d-inline-flex ml-10 items-flex-start'>
                  {[...Array(item?.rt)]?.map((rating, ratingIndex) => (
                    <i key={ratingIndex} className='icon-star text-10 text-yellow-2'></i>
                  ))}
                </div>
              </div>
            </h3>

            <div className='row x-gap-10 y-gap-10 items-center pt-10'>
              <div className='col-auto'>
                <p className='text-14'>{item?.location}</p>
              </div>

              {/* <div className='col-auto'>
                <button
                  data-x-click='mapFilter'
                  className='d-block text-14 text-blue-1 underline'
                >
                  Show on map
                </button>
              </div> */}

              {/* <div className='col-auto'>
                <div className='size-3 rounded-full bg-light-1'></div>
              </div> */}

              <div>
                <p className='text-14'>
                  {item.ad.adr}
                  {item?.ad?.adr2 ? ', ' + item?.ad?.adr2 : ''},
                  {' ' + item?.ad?.city.name}
                </p>
              </div>
            </div>

            {/* <div className='text-14 lh-15 mt-20'>
              <div className='fw-500'>King Room</div>
              <div className='text-light-1'>1 extra-large double bed</div>
            </div> */}

            {/* <div className='text-14 text-green-2 lh-15 mt-10'>
              <div className='fw-500'>Free cancellation</div>
              <div className=''>
                You can cancel later, so lock in this great price today.
              </div>
            </div> */}

            {/* <div className='row x-gap-10 y-gap-10 pt-20'>
              <div className='col-auto'>
                <div className='border-light rounded-100 py-5 px-20 text-14 lh-14'>
                  Breakfast
                </div>
              </div>

              <div className='col-auto'>
                <div className='border-light rounded-100 py-5 px-20 text-14 lh-14'>
                  WiFi
                </div>
              </div>

              <div className='col-auto'>
                <div className='border-light rounded-100 py-5 px-20 text-14 lh-14'>
                  Spa
                </div>
              </div>

              <div className='col-auto'>
                <div className='border-light rounded-100 py-5 px-20 text-14 lh-14'>
                  Bar
                </div>
              </div>
            </div> */}
          </div>
          {/* End .col-md */}

          <div className='col-md-auto text-right md:text-left'>
            <div className='row x-gap-10 y-gap-10 justify-end items-center md:justify-start'>
              <div className='col-auto'>
                <div className='text-14 lh-14 fw-500'>{item?.pt}</div>
              </div>
              <div className='col-auto'>
                <div className='flex-center text-white fw-600 text-14 size-40 rounded-4 bg-blue-1'>
                  {item?.rt}
                </div>
              </div>
            </div>

            <div className=''>
              <div className='text-14 text-light-1 mt-20'>
                {(new DateObject({
                  date: searchData.searchQuery.checkoutDate,
                  format: 'YYYY-MM-DD',
                })
                  .toDate()
                  .getTime() -
                  new DateObject({
                    date: searchData.searchQuery.checkinDate,
                    format: 'YYYY-MM-DD',
                  })
                    .toDate()
                    .getTime()) /
                  86400000}{' '}
                nights,{' '}
                {totalAdults > 0
                  ? totalAdults + Pluralize(' Adult', ' Adults', totalAdults)
                  : ''}
                {totalChildren > 0
                  ? ', ' + totalChildren + Pluralize(' Child', ' Children', totalChildren)
                  : ''}
              </div>
              <div className='text-22 lh-12 fw-600 mt-5'>
                {item?.ops[0]?.tp.toLocaleString('en-IN', {
                  maximumFractionDigits: 0,
                  style: 'currency',
                  currency: 'INR',
                })}{' '}
                Onwards
              </div>
              {/* <div className='text-14 text-light-1 mt-5'>+US$828 taxes and charges</div> */}

              <p
                onClick={() => router.push(`/hotel/hotel-single-v1/${item.id}`)}
                className='button cursor-pointer -md -dark-1 bg-blue-1 text-white mt-24'
              >
                See Availability <div className='icon-arrow-top-right ml-15'></div>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default HotelProperty;

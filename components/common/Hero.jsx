import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Parallax } from 'react-parallax';

function ContactHero() {
  const list = [
    {
      title: 'Corporate Travel Management Redefined',
      subtitle:
        'We understand how business travel works and have perfected every process involved in managing travel for large companies across India. With our 24/7 Service, Xplorz will always be there for you.',
    },
    {
      title: 'Unparalleled Technology',
      subtitle:
        'Efficiency and Perfection in every thing we do. We build our own technologies with the ever changing needs of our clients and empower our customers to do much more than just book travel.',
    },
    {
      title: 'Clear and Efficient MIS and Billing',
      subtitle:
        'Access your weekly, monthly billing and travel reports along with GST ledgers at your fingertips. Transparency at its best.',
    },
  ];
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    let timer = setInterval(
      () =>
        setCurrentTab((prev) => {
          return prev + 1 < list?.length ? prev + 1 : 0;
        }),
      4500
    );

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div id='contact-hero'>
      <Parallax
        strength={1000}
        bgImage='/img/backgrounds/12.png'
        bgImageAlt='amazing place'
        bgClassName='object-fit-cover'
      >
        <div className='section-bg pt-50 layout-pb-lg'>
          <div className='container'>
            <div className='row'>
              {/* Row */}
              <div className='col-lg-12 row x-gap-10' data-aos='fade'>
                {/* Left */}
                <div className='col-lg-6'>
                  {/* Tab Buttons */}
                  <div className='d-flex gap-2'>
                    {list.map((element, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTab(index)}
                        className={`button  ${
                          currentTab === index ? 'px-30 bg-primary' : 'px-10 bg-light-4'
                        }  py-1 text-white mt-20`}
                        style={{ borderRadius: '10px' }}
                      ></button>
                    ))}
                  </div>
                  <h3 className='mb-5 mt-10 text-primary'>Xplorz For Business</h3>
                  <div className='text-transition'>
                    <h1 className='text-white'>{list[currentTab].title}</h1>
                    <h5 className='text-white mt-30'>{list[currentTab].subtitle}</h5>
                  </div>
                  {/* <div className='d-inline-block hero-button'>
                    <Link
                      href='/hotel/hotel-list-v5'
                      className='button py-20 w-250 text-18 text-center bg-blue-1 text-white'
                    >
                      Find Deals
                    </Link>
                  </div> */}
                </div>
                {/* Right */}
                <div className='col-lg-6 d-flex justify-center'>
                  <img src='/img/backgrounds/5.png' className=' hero-image' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Parallax>
    </div>
  );
}

export default ContactHero;

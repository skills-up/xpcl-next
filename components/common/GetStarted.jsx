import { IoDesktopSharp } from 'react-icons/io5';
import { AiFillStar } from 'react-icons/ai';
import Link from 'next/link';

function ContactGetStarted() {
  const cards = [
    {
      icon: <IoDesktopSharp className='icon' />,
      title: 'Travel Managers',
      subtitle: "Who manages company's travel expense",
      points: [
        'Lorem ipsum dolor sit amet, consectetur adi piscing elit, sed do eiusmod',
        'Lorem ipsum dolor sit amet, consectetur adi piscing elit, sed do eiusmod',
        'Lorem ipsum dolor sit amet, consectetur adi piscing elit, sed do eiusmod',
      ],
      knowMoreLink: '#',
    },
    {
      icon: <IoDesktopSharp className='icon' />,
      title: 'Central Bookers',
      subtitle: 'Who books for employees',
      points: [
        'Lorem ipsum dolor sit amet, consectetur adi piscing elit, sed do eiusmod',
        'Lorem ipsum dolor sit amet, consectetur adi piscing elit, sed do eiusmod',
        'Lorem ipsum dolor sit amet, consectetur adi piscing elit, sed do eiusmod',
      ],
      knowMoreLink: '#',
    },
    {
      icon: <IoDesktopSharp className='icon' />,
      title: 'Employees',
      subtitle: 'Who travel for business',
      points: [
        'Lorem ipsum dolor sit amet, consectetur adi piscing elit, sed do eiusmod',
        'Lorem ipsum dolor sit amet, consectetur adi piscing elit, sed do eiusmod',
        'Lorem ipsum dolor sit amet, consectetur adi piscing elit, sed do eiusmod',
      ],
      knowMoreLink: '#',
    },
  ];

  const features = [
    {
      title: 'Create Your Account Now',
      subtitle:
        'Get started by providing minimal details like employee size, organisation name, etc.',
    },
    {
      title: 'Set Up Employee-friendly Policy Guidelines',
      subtitle:
        'Gain most of the benefits by setting up employee-friendly policies (only Admin users).',
    },
    {
      title: 'Invite Your Employees & Start Booking',
      subtitle:
        'Invite your employees to myBiz so that they could enjoy all the corporate benefits.',
    },
  ];

  return (
    <div id='contact-started'>
      <div className='section-bg layout-pt-lg bg-light started-title'>
        <div className='container'>
          <div className='col-lg-6 pr-20 lg:pr-0'>
            <h1 className='text-light-4'>Designed for Everyone in the Organisation</h1>
            <h5 className='mt-20 text-light-4'>
              Our features and benefits are curated to suit the needs of every employee
              using myBiz.
            </h5>
          </div>
        </div>
      </div>
      <div className='section-bg main-container pb-50'>
        <div className='container'>
          {/* Cards */}
          <div className='row x-gap-30 y-gap-30 cards-container'>
            {cards.map((element, index) => (
              <div key={index} className='col-lg-4'>
                <div key={index} className='px-30 py-20 bg-white contact-card'>
                  <div className='mb-20 mt-10'>{element.icon}</div>
                  <h2>{element.title}</h2>
                  <span className='subtitle mt-1'>{element.subtitle}</span>
                  {element.points.map((point, pointIndex) => (
                    <span
                      className='d-flex gap-2 text-light-4 points mt-30'
                      key={pointIndex}
                    >
                      <span className='text-blue-1'>
                        <AiFillStar />
                      </span>
                      <span>{point}</span>
                    </span>
                  ))}
                  <a
                    className='text-center d-block text-16 text-blue-1 mt-40 fw-700'
                    href={element.knowMoreLink}
                  >
                    KNOW MORE
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className='col-lg-6 mt-80 col-12'>
            <h3 className='text-light-4 mb-10'>
              Grab all the corporate benefits by creating your account now
            </h3>
            <div className='d-inline-block started-button col-12 pr-40 lg:pr-0 mt-20'>
              <Link
                href='/hotel/hotel-list-v5'
                className='button py-20 col-12 text-18 text-center bg-blue-1 text-white'
              >
                Find Deals
              </Link>
            </div>
          </div>
          {/* Features */}
          <div className='features'>
            <h1 className='fw-500 col-lg-8'>
              No Waiting, No Subscription Charges, Get Started Instantly!
            </h1>
            <div className='row mt-45 x-gap-60 y-gap-30'>
              {features.map((element, index) => (
                <div className='feature col-lg-4'>
                  <span className='text-40 fw-700 text-white feature-number'>
                    {index + 1}
                  </span>
                  <h2 className='text-dark-2 mt-30'>{element.title}</h2>
                  <h5 className='text-light-4 fw-200 mt-20'>{element.subtitle}</h5>
                </div>
              ))}
            </div>
            <div className='d-inline-block started-button col-lg-3 col-12 pr-40 lg:pr-0 mt-60'>
              <Link
                href='/hotel/hotel-list-v5'
                className='button py-10 col-lg-11 col-12 text-18 text-center bg-blue-1 text-white'
              >
                Create Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactGetStarted;
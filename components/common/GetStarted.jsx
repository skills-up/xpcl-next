import { IoDesktopSharp } from 'react-icons/io5';
import { AiFillStar } from 'react-icons/ai';

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
  return (
    <div id='contact-started'>
      <div className='section-bg layout-pt-lg bg-light started-title'>
        <div className='container'>
          <div className='col-lg-5'>
            <h1 className='text-light-4'>Designed for Everyone in the Organisation</h1>
            <h5 className='mt-20 text-light-4'>
              Our features and benefits are curated to suit the needs of every employee
              using myBiz.
            </h5>
          </div>
        </div>
      </div>
      <div className='section-bg main-container layout-pb-lg'>
        <div className='container'>
          <div className='row x-gap-30 cards-container'>
            {cards.map((element, index) => (
              <div key={index} className='col-lg-4'>
                <div key={index} className='px-30 py-20 bg-light contact-card'>
                  <div className='mb-20 mt-10'>{element.icon}</div>
                  <h2>{element.title}</h2>
                  <span>{element.subtitle}</span>
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
          {/* Cards */}
        </div>
      </div>
    </div>
  );
}

export default ContactGetStarted;

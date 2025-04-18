import { useState } from 'react';
import { HiDocumentText } from 'react-icons/hi2';
import Slider from 'react-slick';
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from 'react-icons/md';

function ContactWhyUs() {
  const list = [
    {
      name: '1mg, Gurugram',
      title: 'Helping 1MG Accelerate Business Travel Planning',
      subtitle:
        'myBiz understood the need of 1MG to decrease turnaround time on trip planning and booking while ensuring fare transparency',
      link: '#',
    },
    {
      name: 'Dr LalPathLabs, Goa',
      title: 'Helping Lal PathLabs Reach Every Corner of the Country with Ease',
      subtitle:
        'myBiz understood the need of Dr Lal Pathlabs to integrate company travel policies with real-time approval process, along with clear visibility into the expenditure pattern of travel budget and an estimation of the savings made',
      link: '#',
    },
    {
      name: 'Blackberrys, Gurugram',
      title: 'Helping Blackberrys Setting New Trends Everyday',
      subtitle:
        'myBiz helped Blackberrys save on the extra cost incurred due to multiple modifications made on the bookings as travel plans changed frequently',
      link: '#',
    },
    {
      name: 'Varmora, Noida',
      title: 'Helping Varmora Succeed at Every Step',
      subtitle:
        'myBiz understood the need of Varmora to have prompt customer support to ensure convenience for their employees when travelling for business',
      link: '#',
    },
  ];
  const testimonials = [
    {
      icon: '/img/backgrounds/testimonial.png',
      text: 'We\'ve been working with Xplorz for over 15 years now and not once has the experience been less than exceptional. The Team at Xplorz understands our complex business travel requirements and makes the process smooth and seamless. Their customer support for changes and cancellations is just brilliant.',
      by: 'Santush Thakur',
      desig: 'Lighthouse Funds',
    },
    {
      icon: '/img/backgrounds/testimonial.png',
      text: 'Vikram and his team\'s unwavering dedication to providing the best possible experience is evident in every interaction. They prioritize their clients\' satisfaction above all else, leaving no stone unturned in their pursuit of excellence. Their commitment to delivering exceptional service is truly commendable.\nIn conclusion, working with Vikram and his team has been an absolute pleasure. Their unwavering commitment to excellence, efficiency, and effortless execution make them the best travel agency I have ever had the privilege of working with. I highly recommend their services to anyone seeking a truly exceptional travel experience.',
      by: 'Rama Padgaonkar',
      desig: 'True North Funds',
    },
    {
      icon: '/img/backgrounds/testimonial.png',
      text: 'As a result of corporate coding with airlines, 200+ bookings were cancelled with zero cancellation penalty, leading to savings for the company. Not only this, we also received discounts worth almost 20 Lacs— saving almost 15% on overall hotel bookings',
      by: 'Priti Soochak',
      desig: 'Chrys Capital',
    },
  ];

  const [knowMore, setKnowMore] = useState(false);

  function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div className={`${className}`} style={style} onClick={onClick}>
        <MdOutlineArrowBackIosNew className='icon' />
      </div>
    );
  }
  function SampleNextArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div style={style} className={`${className}`} onClick={onClick}>
        <MdOutlineArrowForwardIos className='icon' />
      </div>
    );
  }
  return (
    <div id='contact-why'>
      <div className='section-bg layout-pb-xl'>
        <div className='container mt-20'>
          <h1 className='fw-500 text-40 lh-1'>Corporate Reviews</h1>
          {/* Testimonials */}
          <div className='testimonials-container'>
            <Slider
              {...{
                dots: false,
                infinite: true,
                slidesToShow: 3,
                slidesToScroll: 1,
                prevArrow: <SamplePrevArrow />,
                nextArrow: <SampleNextArrow />,
                responsive: [
                  {
                    breakpoint: 992,
                    settings: {
                      slidesToShow: 2,
                    },
                  },
                ],
              }}
            >
              {testimonials.map((element, index) => (
                <div className='testimonial'>
                  {/* <img src={element.icon} className='icon' /> */}
                  <div className='text-light-4 mt-20 text-14 text-justify'>{element.text}</div>
                  <div className='d-flex flex-column mt-30'>
                    <h3 className='text-dark-2'>{element.by}</h3>
                    <span className='text-14 fw-200 text-light-1'>{element.desig}</span>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
          {/* Cases */}
          {/* <div className='case-studies mt-50'>
            <div className='pseudo-bg' />
            <div className='text-white'>
              <h1>Case Studies</h1>
              <h5 className='mt-20'>
                myBiz powers many of the small, medium & large size organisations to help
                them save on their travel budget and achieve more from their business
                travels. Read interesting stories from these organisations.
              </h5>

              <div className='row cases-container mt-40 x-gap-20 y-gap-20'>
                {list.map((element, index) => {
                  if (knowMore || index < 2)
                    return (
                      <div className='col-lg-6' key={index}>
                        <div
                          className={`cases bg-white text-dark pt-20 pb-30 pl-40 pr-60 ${
                            knowMore
                              ? list.length - index <= 2
                                ? 'last-two'
                                : ''
                              : 'last-two'
                          }`}
                        >
                          <span className='text-15 d-flex items-center gap-1'>
                            <HiDocumentText className='text-20 text-blue-1' />
                            {element.name}
                          </span>
                          <h3 className='mt-15 text-dark-2'>{element.title}</h3>
                          <p className='text-light-4 fw-200 text-16 mt-20'>
                            {element.subtitle}
                          </p>
                          <a
                            href={element.link}
                            className='button mt-30 px-20 fw-500 text-16 border-primary -outline-white h-50 col-xl-5 col-lg-7 cursor-pointer text-blue-1'
                          >
                            READ STORY
                          </a>
                        </div>
                      </div>
                    );
                })}
                <span
                  onClick={() => setKnowMore((prev) => !prev)}
                  className='text-18 cursor-pointer text-primary text-center d-block fw-700'
                >
                  {knowMore ? 'HIDE STORIES' : 'VIEW ALL ' + list?.length + ' STORIES'}{' '}
                  <span className='text-30'>&rarr;</span>
                </span>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default ContactWhyUs;

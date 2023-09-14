import Slider from 'react-slick';

function ContactPartner() {
  return (
    <div id='contact-partner'>
      <div className='section-bg pt-40 pb-40'>
        <div className='container'>
          {/* Row */}
          <div className='row x-gap-20 justify-between'>
            {/* Left */}
            <div className='col-lg-6'>
              <span className='d-block text-25'>
                <span className='text-light-5 fw-700'>Partner to</span>{' '}
                <span className='text-40'>49,648</span> Businesses
              </span>
              <div className='d-flex gap-3 items-center'>
                <img
                  crossorigin='anonymous'
                  width='48'
                  height='48'
                  src='https://promos.makemytrip.com/images/myBiz/Onboardingv2/first_fold/persuasion.png'
                  alt='persuation icon'
                />
                <span className='mt-20 mb-10 text-dark-1 travellers'>
                  <span className='text-blue-1 fw-500'>37,492 Travellers</span> have been
                  able to cancel their tickets at the last-minute due to changes in
                  government regulations and easily get refunds
                </span>
              </div>
            </div>
            {/* Right */}
            <div className='col-lg-6 pt-30'>
              <Slider
                {...{
                  dots: false,
                  infinite: true,
                  slidesToShow: 4,
                  slidesToScroll: 1,
                  autoplay: true,
                  speed: 2000,
                  autoplaySpeed: 2000,
                  cssEase: 'linear',
                }}
              >
                <div>
                  <h5>PartnerImage1</h5>
                </div>
                <div>
                  <h5>PartnerImage2</h5>
                </div>
                <div>
                  <h5>PartnerImage3</h5>
                </div>
                <div>
                  <h5>PartnerImage4</h5>
                </div>
                <div>
                  <h5>PartnerImage5</h5>
                </div>
                <div>
                  <h5>PartnerImage6</h5>
                </div>
              </Slider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ContactPartner;

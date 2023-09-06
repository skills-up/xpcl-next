import Address from '../block/Address';
import WhyChoose from '../block/BlockGuide';
import Solutions from '../block/Solutions';
import ContactForm from '../common/ContactForm';
import Social from '../common/social/Social';
import Header1 from '../header/header-1';

function ContactPage({ isSignUp = false }) {
  return (
    <>
      <div className='header-margin'></div>
      {/* header top margin */}
      {/* End Header 1 */}
      <section className='layout-pt-lg layout-pb-lg bg-white'>
        <div className='container'>
          <div className='row justify-center text-center'>
            <div className='col-auto'>
              <div className='sectionTitle -md'>
                <h1 className='mb-20'>About Us</h1>
                <div style={{ textAlign: 'justify' }}>
                  <p className=' sectionTitle__text text-18 mt-5 sm:mt-0'>
                    Xplorz.Com Private Limited was founded in 2005 by Vikram Ramchand.
                    Vikram is a Computer Science graduate of the prestigious Georgia
                    Institute of Technology, Atlanta and an MBA from the London Business
                    School.
                    <span className='mt-20 d-block'>
                      Xplorz was started with the sole purpose of bridging the gap between
                      Travel and Technology. Today, we pride ourselves in devising
                      intelligent, efficient solutions for complex corporate travel needs.
                    </span>
                  </p>
                </div>
              </div>
              <h3 className='mt-40'>Our Solutions Include</h3>
              <div className='row y-gap-20 justify-between pt-30'>
                <Solutions />
              </div>
            </div>
          </div>
          {/* End .row */}
        </div>
        {/* End .container */}
      </section>
      {/* <LocationTopBar /> */}
      {/* End location top bar section */}

      <section className='layout-pt-lg layout-pb-lg bg-blue-2'>
        <div className='container'>
          <div className='row justify-center text-center'>
            <div className='col-auto'>
              <div className='sectionTitle -md'>
                <h1 className='mb-20'>Why Choose Us</h1>
                <div style={{ textAlign: 'justify' }}>
                  <p className=' sectionTitle__text text-18 mt-5 sm:mt-0'>
                    Corporate Travel Management is now efficient and super awesome. Trust
                    the industry experts to help make complex business travel simple.The
                    best businesses across India trust the best in the business - Xplorz,
                    for all their travel needs. It’s about time you should do the same.
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* End .row */}

          <div className='row y-gap-40 justify-between pt-50'>
            <WhyChoose />
          </div>
          {isSignUp && (
            <div className='mt-40'>
              <ContactForm />
            </div>
          )}
          {/* End .row */}
        </div>
        {/* End .container */}
      </section>

      <div className='map-outer'>
        <div className='map-canvas'>
          <iframe
            src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.8785017427826!2d72.82634492520191!3d18.93677128223935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7d1de0e54e8eb%3A0xc8e3e1c138e2c789!2sJolly%20Bhavan%20No%201!5e0!3m2!1sen!2sin!4v1693845481070!5m2!1sen!2sin'
            loading='lazy'
          ></iframe>
        </div>
      </div>
      {/* End map section */}

      {/* <section className='relative container'>
        <div className='row justify-end'>
          <div className='col-xl-5 col-lg-7'>
            <div className='map-form px-40 pt-40 pb-50 lg:px-30 lg:py-30 md:px-24 md:py-24 bg-white rounded-4 shadow-4'>
              <div className='text-22 fw-500'>Send a message</div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section> */}
      {/* End contact section form */}

      {/* <section className='layout-pt-md layout-pb-lg'>
        <div className='container'>
          <div className='row x-gap-80 y-gap-20 justify-between'>
            <div className='col-12'>
              <div className='text-30 sm:text-24 fw-600'>Contact Us</div>
            </div>

            <Address />

            <div className='col-auto'>
              <div className='text-14 text-light-1'>Follow us on social media</div>
              <div className='d-flex x-gap-20 items-center mt-10'>
                <Social />
              </div>
            </div>
          </div>
        </div>
      </section> */}
      {/* End Address Section */}
    </>
  );
}

export default ContactPage;

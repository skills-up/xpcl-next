import dynamic from "next/dynamic";
import Seo from "../components/common/Seo";
import DefaultFooter from '../components/footer/footer-2';
import Header1 from "../components/header/header-1";
import ContactForm from "../components/common/ContactForm";
import { IoLocationOutline, IoCallOutline, IoMailOutline } from "react-icons/io5";

const Contact = () => {
  return (
    <>
      <Seo pageTitle="Contact" />
      {/* End Page Title */}

      <div className="header-margin"></div>
      {/* header top margin */}

      <Header1 />
      {/* End Header 1 */}

      <section className="layout-pt-md layout-pb-lg">
        <div className="container">
          <div className="row justify-between items-center y-gap-30">

            {/* Left Column: Contact Info */}
            <div className="col-lg-5">
              <h2 className="text-30 fw-700 text-dark-1 mb-30">Get in Touch</h2>
              <p className="text-16 text-light-1 mb-40">
                Have questions about our corporate travel solutions? Reach out to us directly.
              </p>

              <div className="y-gap-30">
                <div className="d-flex items-center">
                  <div className="d-flex justify-center items-center size-60 rounded-full bg-blue-1-05 mr-20">
                    <IoLocationOutline className="text-24 text-dark-3" />
                  </div>
                  <div>
                    <div className="text-18 fw-500 text-dark-1">Address</div>
                    <div className="text-15 text-light-1">211-212 Jolly Bhavan No. 1,<br /> 10 New Marine Lines, Mumbai - 400020.</div>
                  </div>
                </div>

                <div className="d-flex items-center">
                  <div className="d-flex justify-center items-center size-60 rounded-full bg-blue-1-05 mr-20">
                    <IoCallOutline className="text-24 text-dark-3" />
                  </div>
                  <div>
                    <div className="text-18 fw-500 text-dark-1">Phone</div>
                    <a href="tel:+912266121000" className="text-15 text-light-1">+91 22 66121000</a>
                  </div>
                </div>

                <div className="d-flex items-center">
                  <div className="d-flex justify-center items-center size-60 rounded-full bg-blue-1-05 mr-20">
                    <IoMailOutline className="text-24 text-dark-3" />
                  </div>
                  <div>
                    <div className="text-18 fw-500 text-dark-1">Email</div>
                    <a href="mailto:support@xplorz.com" className="text-15 text-light-1">support[at]xplorz.com</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="col-lg-6">
              <ContactForm />
            </div>

          </div>
        </div>
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
      {/* <CallToActions /> */}
      {/* End Call To Actions Section */}

      <DefaultFooter />
      {/* End Call To Actions Section */}
    </>
  );
};

export default dynamic(() => Promise.resolve(Contact), { ssr: false });

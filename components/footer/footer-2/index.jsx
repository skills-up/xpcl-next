import Address from '../../block/Address';
import AppButton from './AppButton';
import ContactInfo from './ContactInfo';
import Copyright from './Copyright';
import FooterContent from './FooterContent';

const index = () => {
  return (
    <footer className='footer -type-2 bg-dark-2 text-white'>
      <div className='container'>
        <div className='pt-30 pb-30'>
          <div className='row y-gap-40 justify-between xl:justify-center'>
            {/* <div className='col-xl-2 col-lg-4 col-sm-6'>
              <h5 className='text-16 fw-500 mb-30'>Contact Us</h5>
              <ContactInfo />
            </div> */}
            {/* End col */}

            {/* <FooterContent /> */}
            {/* End footer menu content */}

            {/* <div className='col-xl-2 col-lg-4 col-sm-6'>
              <h5 className='text-16 fw-500 mb-30'>Mobile</h5>
              <AppButton />
            </div> */}
            <Address lighterHeading />
          </div>
        </div>
        {/* End footer top */}

        <div className='py-20 border-top-light '>
          <Copyright />
        </div>
        {/* End footer-copyright */}
      </div>
      {/* End container */}
    </footer>
  );
};

export default index;

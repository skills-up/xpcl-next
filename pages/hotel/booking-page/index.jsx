import CustomerInfo from '../../../components/booking-page/CustomerInfo';
import CallToActions from '../../../components/common/CallToActions';
import Seo from '../../../components/common/Seo';
import DefaultFooter from '../../../components/footer/footer-2';
import Header1 from '../../../components/header/header-1';

const index = () => {
  return (
    <>
      <Seo pageTitle='Hotel Booking Page' />
      {/* End Page Title */}

      <div className='header-margin'></div>
      {/* header top margin */}

      <Header1 />
      {/* End Header 1 */}

      <section className='pt-40 layout-pb-md'>
        <div className='container'>
          <div className='row'>
            <CustomerInfo />
          </div>
        </div>
        {/* End container */}
      </section>
      {/* End stepper */}

      <CallToActions />
      {/* End Call To Actions Section */}

      <DefaultFooter />
    </>
  );
};

export default index;

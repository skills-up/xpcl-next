import dynamic from 'next/dynamic';
import CallToActions from '../components/common/CallToActions';
import Seo from '../components/common/Seo';
import Header1 from '../components/header/header-1';
import DefaultFooter from '../components/footer/footer-2';
import WhyChoose from '../components/block/BlockGuide';
import Address from '../components/block/Address';
import Social from '../components/common/social/Social';
import ContactForm from '../components/common/ContactForm';
import LocationTopBar from '../components/common/LocationTopBar';
import ContactPage from '../components/contact/Contact';

const Contact = () => {
  return (
    <>
      <Seo pageTitle='About' />
      {/* End Page Title */}

      <Header1 />

      <ContactPage />
      {/* End Why Choose Us section */}

      {/* <CallToActions /> */}
      {/* End Call To Actions Section */}

      <DefaultFooter />
      {/* End Call To Actions Section */}
    </>
  );
};

export default dynamic(() => Promise.resolve(Contact), { ssr: false });

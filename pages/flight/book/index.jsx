import { useState } from 'react';
import CallToActions from '../../../components/common/CallToActions';
import Seo from '../../../components/common/Seo';
import PreviewBooking from '../../../components/flight-book/book/PreviewBooking';
import DefaultFooter from '../../../components/footer/default';
import Header1 from '../../../components/header/header-1';

const index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isBooked, setIsBooked] = useState({ to: false, from: false });
  const [pnr, setPNR] = useState({ to: null, from: null });
  const [travellerInfo, setTravellerInfo] = useState([]);
  // 1 - View Itinerary

  return (
    <>
      <Seo pageTitle='Flight Book' />
      {/* End Page Title */}

      <div className='header-margin'></div>
      {/* header top margin */}

      <Header1 />
      {/* End Header 1 */}

      {currentStep === 1 && (
        <PreviewBooking
          setCurrentStep={setCurrentStep}
          isBooked={isBooked}
          setPNR={setPNR}
          travellerInfos={[travellerInfo, setTravellerInfo]}
        />
      )}

      <CallToActions />
      {/* End Call To Actions Section */}

      <DefaultFooter />
    </>
  );
};

export default index;

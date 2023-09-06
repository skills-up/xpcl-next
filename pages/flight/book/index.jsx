import { useEffect, useState } from 'react';
import CallToActions from '../../../components/common/CallToActions';
import Seo from '../../../components/common/Seo';
import PreviewBooking from '../../../components/flight-book/book/PreviewBooking';
import Seatmap from '../../../components/flight-book/book/Seatmap';
import DefaultFooter from '../../../components/footer/footer-2';
import Header1 from '../../../components/header/header-1';

const index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [PNR, setPNR] = useState({ to: null, from: null, combined: null });
  const [travellerInfo, setTravellerInfo] = useState([]);
  const [seatMap, setSeatMap] = useState({
    to: null,
    from: null,
    combined: null,
  });

  // 1 - View Itinerary + Traveller Details
  // 2 - Seat Maps
  // 3 - Review

  useEffect(() => console.log('PNR', PNR), [PNR]);

  return (
    <>
      <Seo pageTitle='Flight Booking' />
      {/* End Page Title */}

      <div className='header-margin'></div>
      {/* header top margin */}

      <Header1 />
      {/* End Header 1 */}

      {currentStep === 1 && (
        <PreviewBooking
          setCurrentStep={setCurrentStep}
          setPNR={setPNR}
          travellerInfos={[travellerInfo, setTravellerInfo]}
        />
      )}

      {currentStep === 2 && (
        <Seatmap
          PNRS={[PNR, setPNR]}
          seatMaps={[seatMap, setSeatMap]}
          travellerInfos={[travellerInfo, setTravellerInfo]}
        />
      )}

      {/* <CallToActions /> */}
      {/* End Call To Actions Section */}

      <DefaultFooter />
    </>
  );
};

export default index;

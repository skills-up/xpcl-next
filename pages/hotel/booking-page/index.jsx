import CallToActions from "../../../components/common/CallToActions";
import Seo from "../../../components/common/Seo";
import Header1 from "../../../components/header/header-1";
import DefaultFooter from "../../../components/footer/default";
import StepperBooking from "../../../components/booking-page/stepper-booking";

const index = () => {
  return (
    <>
      <Seo pageTitle="Hotel Booking Page" />
      {/* End Page Title */}

      <div className="header-margin"></div>
      {/* header top margin */}

      <Header1 />
      {/* End Header 1 */}

      <section className="pt-40 layout-pb-md">
        <div className="container">
          <StepperBooking />
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

import dynamic from "next/dynamic";
import Link from "next/link";
import Seo from "../components/common/Seo";
import DefaultFooter from "../components/footer/default";
import Header1 from "../components/header/header-1";

const Terms = () => {
  return (
    <>
      <Seo pageTitle="Terms & Conditions" />
      {/* End Page Title */}

      <div className="header-margin"></div>
      {/* header top margin */}

      <Header1 />
      {/* End Header 1 */}

      <section className="layout-pt-lg layout-pb-lg">
        <div className="container">
          <h1 className="text-30 fw-600 mb-15">Terms & Conditions</h1>
          <h2 className="text-16 fw-500 mt-35">1. Introduction</h2>
          <p className="text-15 text-dark-1 mt-5">Welcome to Xplorz.Com Private Limited By accessing our website and using our services, you agree to comply with and be bound by the following terms and conditions. Please read these terms carefully before making any bookings. If you do not agree to these terms, you must refrain from using our services.</p>
          <h2 className="text-16 fw-500 mt-35">2. Definitions</h2>
          <p className="text-15 text-dark-1 mt-5">
             <ul className="list-disc">
              <li>"We," "us," "our," and "Xplorz" refer to Xplorz.Com Private Limited, the owner and operator of this website.</li>
              <li>"You," "your," and "client" refer to the person making the booking and/or using our services.</li>
              <li>"Supplier" refers to third-party service providers such as airlines, hotels, tour operators, etc.</li>
            </ul>
          </p>
          <h2 className="text-16 fw-500 mt-35">3. Booking Conditions</h2>
          <p className="text-15 text-dark-1 mt-5">
             <ul className="list-disc">
              <li>All bookings are subject to availability and are not confirmed until payment is received and a booking confirmation is sent by us.</li>
              <li>You are responsible for ensuring that all the information provided during the booking process is accurate.</li>
              <li>Any changes or cancellations to your booking must be made in accordance with the supplier's policies.</li>
            </ul>
          </p>
          <h2 className="text-16 fw-500 mt-35">4. Payment Terms</h2>
          <p className="text-15 text-dark-1 mt-5">
             <ul className="list-disc">
              <li>A deposit or full payment may be required at the time of booking. This will be specified during the booking process.</li>
              <li>Payment can be made via Credit Cards/ UPI and NEFT / RTGS.</li>
              <li>All prices are subject to change without prior notice until full payment is made.</li>
              <li>We reserve the right to cancel bookings if full payment is not received by the specified deadline.</li>
            </ul>
          </p>
          <h2 className="text-16 fw-500 mt-35">5. Cancellation and Refund Policy</h2>
          <p className="text-15 text-dark-1 mt-5">
             <ul className="list-disc">
              <li>Cancellations must be made in writing and are subject to the supplier's cancellation policy.</li>
              <li>Any refunds will be processed according to the supplier's terms and may be subject to cancellation fees.</li>
              <li>We are not responsible for any costs incurred due to cancellations, including but not limited to non-refundable expenses.</li>
            </ul>
          </p>
          <h2 className="text-16 fw-500 mt-35">6. Travel Documents</h2>
          <p className="text-15 text-dark-1 mt-5">
             <ul className="list-disc">
              <li>You are responsible for obtaining and carrying all necessary travel documents, including passports, visas, and health certificates.</li>
              <li>We are not responsible for any issues arising from incomplete or incorrect travel documentation.</li>
            </ul>
          </p>
          <h2 className="text-16 fw-500 mt-35">7. Insurance</h2>
          <p className="text-15 text-dark-1 mt-5">
             <ul className="list-disc">
              <li>We strongly recommend that you purchase travel insurance to cover cancellations, medical expenses, and other potential risks.</li>
              <li>We are not responsible for any losses or damages not covered by insurance.</li>
            </ul>
          </p>
          <h2 className="text-16 fw-500 mt-35">8. Liability</h2>
          <p className="text-15 text-dark-1 mt-5">
             <ul className="list-disc">
              <li>We act only as an agent for the suppliers and are not responsible for any acts, errors, omissions, or negligence of the suppliers.</li>
              <li>We are not liable for any loss, injury, or damage caused by events beyond our control, including but not limited to natural disasters, political instability, or pandemics.</li>
              <li>Our liability is limited to the amount paid for the booking.</li>
            </ul>
          </p>
          <h2 className="text-16 fw-500 mt-35">9. Changes to Itinerary</h2>
          <p className="text-15 text-dark-1 mt-5">
             <ul className="list-disc">
              <li>We reserve the right to make changes to the itinerary due to unforeseen circumstances or events beyond our control.</li>
              <li>We will inform you of any significant changes as soon as possible.</li>
            </ul>
          </p>
          <h2 className="text-16 fw-500 mt-35">10. Privacy Policy</h2>
          <p className="text-15 text-dark-1 mt-5">
             <ul className="list-disc">
              <li>Your personal information will be used in accordance with our Privacy Policy, which can be found <Link href="/privacy-policy">here</Link>.</li>
              <li>We do not share your personal information with third parties except as necessary to process your booking.</li>
            </ul>
          </p>
          <h2 className="text-16 fw-500 mt-35">11. Governing Law</h2>
          <p className="text-15 text-dark-1 mt-5">
             <ul className="list-disc">
              <li>These terms and conditions are governed by the laws of Mumbai, India.</li>
              <li>Any disputes arising from these terms will be subject to the exclusive jurisdiction of the courts in Mumbai.</li>
            </ul>
          </p>
          <h2 className="text-16 fw-500 mt-35">12. Amendments</h2>
          <p className="text-15 text-dark-1 mt-5">
             <ul className="list-disc">
              <li>We reserve the right to amend these terms and conditions at any time. Any changes will be effective immediately upon posting on our website.</li>
              <li>Your continued use of our services after any amendments constitutes acceptance of the new terms.</li>
            </ul>
          </p>
          <h2 className="text-16 fw-500 mt-35">13. Contact Information</h2>
          <p className="text-15 text-dark-1 mt-5">If you have any questions or concerns about these terms and conditions, please contact us at:<br/>
          Xplorz.Com Private Limited<br/>
          211-212 Jolly Bhavan No. 1, 10 New Marine Lines, Mumbai - 400020<br/>
          <Link href="tel:+912266121000">+91 22 66121000</Link><br/>
          <Link href="mailto:support@xporz.com">support@xporz.com</Link></p>
        </div>
      </section>
      {/* End terms section */}

      {/* <CallToActions /> */}
      {/* End Call To Actions Section */}

      <DefaultFooter />
      {/* End Call To Actions Section */}
    </>
  );
};

export default dynamic(() => Promise.resolve(Terms), { ssr: false });

import dynamic from "next/dynamic";
import Seo from "../components/common/Seo";
import DefaultFooter from '../components/footer/footer-2';
import Header1 from "../components/header/header-1";

const PrivacyPolicy = () => {
  return (
    <>
      <Seo pageTitle="Privacy Policy" />
      {/* End Page Title */}

      <div className="header-margin"></div>
      {/* header top margin */}

      <Header1 />
      {/* End Header 1 */}

      <section className="layout-pt-lg layout-pb-lg">
        <div className="container">
          <h1 className="text-30 fw-600 mb-15">Privacy Policy</h1>
          <h2 className="text-16 fw-500 mt-35">Introduction</h2>
          <p className="text-15 text-dark-1 mt-5">This Privacy Policy outlines how www.tripcentral.in collects, uses, discloses, and protects your personal information. We are committed to safeguarding your privacy and complying with applicable data protection laws.</p>
          <h2 className="text-16 fw-500 mt-35">Information We Collect</h2>
          <p className="text-15 text-dark-1 mt-5">
             <ul className="list-disc">
              <li><strong>Personal Information:</strong> Name, email address, phone number, passport information, billing address, credit card information, dietary restrictions, and any other information you voluntarily provide.</li>
              <li><strong>Usage Data:</strong> Information about your interactions with our website, such as IP address, browser type, device information, pages visited, and clicks.</li>
              <li><strong>Booking Information:</strong> Details of your travel bookings, including destinations, dates, number of travelers, and preferences.</li>
            </ul>
          </p>
          <h2 className="text-16 fw-500 mt-35">How We Use Your Information</h2>
          <p className="text-15 text-dark-1 mt-5">
             <ul className="list-disc">
              <li><strong>Processing Bookings:</strong> We use your information to process your travel bookings and provide you with the requested services.</li>
              <li><strong>Communication:</strong> We may use your contact information to send you booking confirmations, travel updates, and promotional offers.</li>
              <li><strong>Improving Our Services:</strong> We analyze usage data to enhance our website and user experience.</li>
              <li><strong>Compliance with Laws:</strong> We may use your information to comply with legal obligations.</li>
            </ul>
          </p>
          <h2 className="text-16 fw-500 mt-35">Information Sharing</h2>
          <p className="text-15 text-dark-1 mt-5">We may share your personal information with:
             <ul className="list-disc">
              <li><strong>Third-party Service Providers:</strong> We may share your information with trusted third-party service providers who assist us in operating our website and providing travel services (e.g., airlines, hotels, car rental companies.</li>
              <li><strong>Legal Requirements:</strong> We may disclose your information to comply with legal obligations or to protect our rights.</li>
            </ul>
          </p>
          <h2 className="text-16 fw-500 mt-35">Data Security</h2>
          <p className="text-15 text-dark-1 mt-5">We implement reasonable security measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.</p>
          <h2 className="text-16 fw-500 mt-35">Your Rights</h2>
          <p className="text-15 text-dark-1 mt-5">You have the right to:
             <ul className="list-disc">
              <li>Access your personal information.</li>
              <li>Correct inaccuracies in your personal information.</li>
              <li>Request deletion of your personal information.</li>
              <li>Object to the processing of your personal information.</li>
            </ul>
          </p>
          <h2 className="text-16 fw-500 mt-35">Cookies and Tracking Technologies</h2>
          <p className="text-15 text-dark-1 mt-5">We use cookies and similar technologies to enhance your browsing experience and collect information about your website usage. You can manage your cookie preferences through your browser settings.</p>
          <h2 className="text-16 fw-500 mt-35">Changes to This Privacy Policy</h2>
          <p className="text-15 text-dark-1 mt-5">We reserve the right to modify this Privacy Policy at any time. We will notify you of any material changes by posting the updated policy on our website.</p>
          <h2 className="text-16 fw-500 mt-35">Contact Us</h2>
          <p className="text-15 text-dark-1 mt-5">If you have any questions or concerns about this Privacy Policy, please contact us at support@tripcentral.in</p>
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

export default dynamic(() => Promise.resolve(PrivacyPolicy), { ssr: false });

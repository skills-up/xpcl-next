import Link from 'next/link';
import Footer from '../footer/footer-2';
import Header1 from '../header/header-1';
import {
  IconFlight,
  IconHotel,
  IconTransport,
  IconReporting,
  IconPolicy,
  IconSupport,
  IconGlobal,
  IconBilling,
  IconBuilding,
  IconVisibility,
  IconMoney,
  IconCheck,
} from './Icons';
import Seo from '../common/Seo';

const LandingPage = () => {
  return (
    <>
      <Seo pageTitle='Xplorz | Corporate Travel - Simplified. Controlled. Global.' />

      <style jsx>{`
        section {
          border-top: 1px solid #e5e7eb;
        }
        .hero-section {
          min-height: 80vh;
          display: flex;
          align-items: center;
        }
        .icon-box {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 32px;
          color: #13357b;
          transition: all 0.3s ease;
          flex-shrink: 0;
          border: 2px solid #ffc700;
        }
        .feature-card {
          transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
          border: 1px solid #e5e7eb;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          border-color: #3554d1;
        }
        .section-bg-accent {
          background-color: #f8f9fa;
        }
        .marker-stroke {
          background-color: #ffc700;
          display: inline-block;
          padding: 0.2em 0.5em;
          margin: 0.2em;
          
          /* Irregular radius creates the organic shape */
          border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
                    
          /* Box shadow adds 'bleeding' ink effect */
          box-shadow: 2px 2px 0px rgba(255, 199, 0, 0.6);
        }
        .border-yellow-3 {
          border: 1px solid var(--color-yellow-3);
        }
      `}</style>
      <Header1 />

      {/* Hero Section */}
      <section className='hero-section layout-pt-xl layout-pb-xl bg-white relative mt-50 lg:mt-20'>
        <div className='container relative z-2'>
          <div className='row justify-center text-center'>
            <div className='col-xl-9 col-lg-10'>
              <h1 className='text-60 lg:text-40 md:text-30 fw-700 text-dark-1 leading-tight mb-20'>
                Corporate Travel.
              </h1>
              <h2 className='text-dark-2'>
                <span className='marker-stroke'>Simplified.</span>
                <span className='marker-stroke'>Controlled.</span>
                <span className='marker-stroke'>Global.</span>
              </h2>              

              <div className='mt-20 text-20 text-light-1 fw-400'>
                <strong>Xplorz</strong> combines smart technology with expert human
                support to help you
                <br className='lg:d-none' />
                <strong className='ps-1'>book, manage, and optimize business travel</strong>—globally.
              </div>

              <div className='d-flex gap-2 justify-center mt-40 pt-20 sm:flex-column'>
                <Link href='/contact' className='button -md -blue-1 bg-dark-1 text-white'>
                  Request a Demo
                </Link>
                <Link
                  href='/contact'
                  className='button -md -outline-dark-1 text-dark-1 ml-20 sm:ml-0 sm:mt-10'
                >
                  Talk to a Travel Expert
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Designed for Businesses */}
      <section className='layout-pt-xl layout-pb-xl'>
        <div className='container'>
          <div className='row justify-center text-center mb-60'>
            <div className='col-xl-8'>
              <h2 className='text-40 fw-700 text-dark-1'>
                Designed for Businesses That Take Travel Seriously
              </h2>
              <p className='mt-20 text-18 text-light-1'>
                Xplorz is built for organizations that demand{' '}
                <strong>control, transparency, and accountability</strong>.
              </p>
            </div>
          </div>

          <div className='row y-gap-40 justify-center'>
            {[
              {
                icon: <IconBuilding />,
                title: 'Enterprise-grade Platform',
                desc: 'Booking and management tools built for scale.',
              },
              {
                icon: <IconSupport />,
                title: 'Dedicated Support',
                desc: 'Real corporate travel managers, not bots.',
              },
              {
                icon: <IconPolicy />,
                title: 'Strong Controls',
                desc: 'Policy, approval, and compliance built-in.',
              },
              {
                icon: <IconMoney />,
                title: 'Global Rates',
                desc: 'Access negotiated corporate rates worldwide.',
              },
              {
                icon: <IconVisibility />,
                title: 'Total Visibility',
                desc: 'End-to-end insights on spend and behavior.',
              },
            ].map((item, index) => (
              <div key={index} className='col-lg-4 col-md-6'>
                <div className='feature-card bg-white px-30 py-40 rounded-16 h-100 text-center'>
                  <div className='d-flex justify-center'>
                    <div className='icon-box mb-20'>{item.icon}</div>
                  </div>
                  <h4 className='text-20 fw-700 mt-20 text-dark-1'>{item.title}</h4>
                  <p className='text-16 text-light-1 mt-10 leading-relaxed'>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Platform Features */}
      <section className='layout-pt-xl layout-pb-xl bg-white'>
        <div className='container'>
          <div className='row justify-center text-center'>
            <div className='col-auto'>
              <div className='sectionTitle -md'>
                <h2 className='sectionTitle__title text-dark-1'>
                  Core Platform Features
                </h2>
                <p className=' sectionTitle__text mt-5 sm:mt-0 text-light-1'>
                  Everything you need for seamless corporate travel
                </p>
              </div>
            </div>
          </div>

          <div className='row y-gap-40 pt-60'>
            {/* Flight Booking */}
            <div className='col-lg-4 col-md-6'>
              <div className='feature-card bg-white px-40 py-40 rounded-16 h-100'>
                <div className='mb-30 text-dark-3 text-50'>
                  <IconFlight />
                </div>
                <h4 className='text-22 fw-700 mb-20 text-dark-1'>
                  Global Flight Booking
                </h4>
                <ul className='y-gap-10 text-16 text-light-1'>
                  <li className='d-flex items-center'>
                    <IconCheck className='text-blue-1 text-18 mr-10' />
                    Global GDS, LCCs, & Corporate Fares
                  </li>
                  <li className='d-flex items-center'>
                    <IconCheck className='text-blue-1 text-18 mr-10' />
                    Real-time multi-airline comparisons
                  </li>
                  <li className='d-flex items-center'>
                    <IconCheck className='text-blue-1 text-18 mr-10' />
                    Flexible ticketing & cancellations
                  </li>
                  <li className='d-flex items-center'>
                    <IconCheck className='text-blue-1 text-18 mr-10' />
                    Complex international itineraries
                  </li>
                </ul>
              </div>
            </div>

            {/* Hotel Inventory */}
            <div className='col-lg-4 col-md-6'>
              <div className='feature-card bg-white px-40 py-40 rounded-16 h-100'>
                <div className='mb-30 text-dark-3 text-50'>
                  <IconHotel />
                </div>
                <h4 className='text-22 fw-700 mb-20 text-dark-1'>Worldwide Hotels</h4>
                <ul className='y-gap-10 text-16 text-light-1'>
                  <li className='d-flex items-center'>
                    <IconCheck className='text-blue-1 text-18 mr-10' />
                    Global chains + preferred rates
                  </li>
                  <li className='d-flex items-center'>
                    <IconCheck className='text-blue-1 text-18 mr-10' />
                    Policy-driven selection
                  </li>
                  <li className='d-flex items-center'>
                    <IconCheck className='text-blue-1 text-18 mr-10' />
                    Long-stay options
                  </li>
                  <li className='d-flex items-center'>
                    <IconCheck className='text-blue-1 text-18 mr-10' />
                    Centralized billing
                  </li>
                </ul>
              </div>
            </div>

            {/* Ground Transport */}
            <div className='col-lg-4 col-md-6'>
              <div className='feature-card bg-white px-40 py-40 rounded-16 h-100'>
                <div className='mb-30 text-dark-3 text-50'>
                  <IconTransport />
                </div>
                <h4 className='text-22 fw-700 mb-20 text-dark-1'>Ground Transport</h4>
                <ul className='y-gap-10 text-16 text-light-1'>
                  <li className='d-flex items-center'>
                    <IconCheck className='text-blue-1 text-18 mr-10' />
                    Airport transfers & point-to-point
                  </li>
                  <li className='d-flex items-center'>
                    <IconCheck className='text-blue-1 text-18 mr-10' />
                    Reliable chauffeur partners
                  </li>
                  <li className='d-flex items-center'>
                    <IconCheck className='text-blue-1 text-18 mr-10' />
                    Invoice-based billing
                  </li>
                  <li className='d-flex items-center'>
                    <IconCheck className='text-blue-1 text-18 mr-10' />
                    No reimbursement chaos
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Controls */}
      <section className='layout-pt-xl layout-pb-xl'>
        <div className='container'>
          <div className='row y-gap-60 justify-between items-start'>
            <div className='col-lg-5'>
              <h2 className='text-40 fw-700 text-dark-1'>
                Smart Controls for
                <br />
                <span className='text-blue-1'>Finance & Admin</span>
              </h2>
            </div>

            <div className='col-lg-6'>
              <div className='row y-gap-40'>
                <div className='col-12'>
                  <div className='d-flex items-start'>
                    <div className='icon-box shrink-0 mr-20 bg-white'>
                      <IconPolicy />
                    </div>
                    <div>
                      <h4 className='text-24 fw-700 mb-10 text-dark-1'>
                        Policy, Approval & Compliance
                      </h4>
                      <p className='text-16 text-light-1 leading-relaxed'>
                        Set custom policies by role. Automate approval workflows. Get
                        real-time alerts for violations and maintain a full audit trail.
                      </p>
                    </div>
                  </div>
                </div>

                <div className='col-12'>
                  <div className='d-flex items-start'>
                    <div className='icon-box shrink-0 mr-20 bg-white'>
                      <IconReporting />
                    </div>
                    <div>
                      <h4 className='text-24 fw-700 mb-10 text-dark-1'>
                        Reporting & Spend Visibility
                      </h4>
                      <p className='text-16 text-light-1 leading-relaxed'>
                        Centralized dashboards for CFOs. Track spend by cost-center,
                        project, or vendor. Make data-driven decisions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Section */}
      <section className='layout-pt-xl layout-pb-xl bg-white'>
        <div className='container'>
          <div className='row justify-center text-center'>
            <div className='col-xl-8'>
              <div className='text-50 mb-20 text-dark-3'>
                <IconSupport style={{ fontSize: '60px' }} />
              </div>
              <h2 className='text-40 fw-700 text-dark-1'>
                Service That Goes <span className='text-blue-1'>Beyond Software</span>
              </h2>
              <h4 className='text-24 fw-500 mt-20 mb-30 text-light-1'>
                Dedicated Corporate Travel Managers
              </h4>
              <p className='text-18 text-dark-1'>
                Every Xplorz client gets{' '}
                <strong>real people who understand business travel</strong>.
              </p>
              <div className='row mt-40 y-gap-20 justify-center'>
                {[
                  'Pre-trip planning',
                  '24×7 Emergency Support',
                  'Visa & Documentation',
                  'Complex Itineraries',
                ].map((item, index) => (
                  <div key={index} className='col-lg-auto col-md-6'>
                    <p className='fw-600 text-blue-1 px-20 text-center border-yellow-3 rounded-8 py-10'>
                      <IconCheck className='mr-10 text-18' />
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Offerings */}
      <section className='layout-pt-xl layout-pb-xl'>
        <div className='container'>
          <div className='row justify-center text-center'>
            <div className='col-lg-8'>
              <div className='sectionTitle -md'>
                <h2 className='sectionTitle__title text-dark-1'>
                  Additional Corporate Offerings
                </h2>
              </div>
            </div>
          </div>

          <div className='row y-gap-30 pt-40 justify-center'>
            <div className='col-lg-5 col-md-6'>
              <div className='feature-card bg-white px-40 py-40 rounded-16 text-center h-100'>
                <div className='mb-20 text-dark-3 text-50'>
                  <IconGlobal />
                </div>
                <h4 className='text-22 fw-700 text-dark-1'>
                  End-to-End Travel Solutions
                </h4>
                <p className='mt-15 text-16 text-light-1'>
                  Visa assistance, Travel insurance, MICE, and VIP handling.
                </p>
              </div>
            </div>

            <div className='col-lg-5 col-md-6'>
              <div className='feature-card bg-white px-40 py-40 rounded-16 text-center h-100'>
                <div className='mb-20 text-dark-3 text-50'>
                  <IconBilling />
                </div>
                <h4 className='text-22 fw-700 text-dark-1'>Centralized Billing</h4>
                <p className='mt-15 text-16 text-light-1'>
                  Single-invoice billing, GST compliance, and audited financial records.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Work With */}
      <section className='layout-pt-xl layout-pb-xl bg-white'>
        <div className='container'>
          <div className='row justify-center text-center'>
            <div className='col-auto'>
              <div className='sectionTitle -md'>
                <h2 className='sectionTitle__title text-dark-1'>Who We Work With</h2>
              </div>
            </div>
          </div>

          <div className='row justify-center pt-40'>
            <div className='col-xl-9'>
              <div className='row y-gap-30 justify-center'>
                {[
                  'Mid-to-large corporates',
                  'Multinational companies',
                  'Consulting firms',
                  'Startups',
                  'CXO-led programs',
                ].map((item, index) => (
                  <div key={index} className='col-lg-auto col-md-6'>
                    <p className='text-20 fw-600 text-dark-1 px-20 text-center border-yellow-3 rounded-8 py-10'>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='layout-pt-xl layout-pb-xl box-shadow-1 m-40 rounded-30 bg-white'>
        <div className='container'>
          <div className='row justify-center text-center'>
            <div className='col-xl-9'>
              <h2 className='text-40 text-dark-1 fw-700'>Ready to Take Control?</h2>
              <p className='text-light-1 text-18 mt-20'>
                Simpify your corporate travel management today.
              </p>

              <div className='d-flex gap-2 justify-center pt-40 sm:flex-column'>
                <Link href='/contact' className='button -md -blue-1 bg-dark-1 text-white'>
                  Request a Demo
                </Link>
                <Link
                  href='/contact'
                  className='button -md -outline-dark-1 text-dark-1 ml-20 sm:ml-0 sm:mt-10'
                >
                  Speak to Our Team
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default LandingPage;

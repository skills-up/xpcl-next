import Seo from '../../components/common/Seo';
import Footer from '../../components/footer/dashboard-footer';
import Header from '../../components/header/dashboard-header';
import Sidebar from '../../components/sidebars/dashboard-sidebars';

const index = () => {
  return (
    <>
      <Seo pageTitle='Dashboard' />
      {/* End Page Title */}

      <div className='header-margin'></div>

      <Header />
      {/* End dashboard-header */}

      <div className='dashboard'>
        <div className='dashboard__sidebar bg-white scroll-bar-1'>
          <Sidebar />
          {/* End sidebar */}
        </div>
        {/* End dashboard__sidebar */}

        <div className='dashboard__main'>
          <div className='dashboard__content bg-light-2'>
            <div className='row y-gap-20 justify-between items-end pb-20'>
              <div className='col-12'>
                <h1 className='text-30 lh-14 fw-600'>Dashboard</h1>
                <div className='text-15 text-light-1'>
                  A quick look at critical information
                </div>
              </div>
              {/* End .col-12 */}
            </div>
            {/* End .row */}

            <Footer />
          </div>
          {/* End .dashboard__content */}
        </div>
        {/* End dashbaord content */}
      </div>
      {/* End dashbaord content */}
    </>
  );
};

export default index;

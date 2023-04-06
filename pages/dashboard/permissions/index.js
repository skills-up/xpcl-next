import Seo from '../../../components/common/Seo';
import Footer from '../../../components/footer/dashboard-footer';
import Header from '../../../components/header/dashboard-header';
import Sidebar from '../../../components/sidebars/dashboard-sidebars';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../utils/toastify';
import { useEffect } from 'react';
import Permissions from './components/Permissions';

const index = () => {
  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  useEffect(() => {
    if (token === '') {
      sendToast('error', 'You need to login first in order to view the dashboard.', 4000);
      router.push('/login');
    }
  }, []);

  return (
    <>
      <Seo pageTitle='Permissions' />
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
          <div className='dashboard__content d-flex flex-column justify-between bg-light-2'>
            <div>
              <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>Permissions</h1>
                  <div className='text-15 text-light-1'>Manage Permissions.</div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <Permissions />
              </div>
            </div>

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

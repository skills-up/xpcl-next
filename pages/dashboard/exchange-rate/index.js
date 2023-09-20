import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createItem, getItem } from '../../../api/xplorzApi';
import Seo from '../../../components/common/Seo';
import Footer from '../../../components/footer/dashboard-footer';
import Header from '../../../components/header/dashboard-header';
import Sidebar from '../../../components/sidebars/dashboard-sidebars';
import { sendToast } from '../../../utils/toastify';

const index = () => {
  const [exchangeRate, setExchangeRate] = useState(1);

  const router = useRouter();

  useEffect(() => {
    getData();
  }, [router.isReady]);

  const getData = async () => {
    const response = await getItem('utilities', 'exchange-rate');
    if (response?.success && response.data) {
      setExchangeRate(response.data);
    } else {
      sendToast(
        'error',
        response.data?.message || response.data?.error || 'Unable to fetch exchange rate',
        4000
      );
      router.push('/dashboard/accounts');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const response = await createItem('utilities/exchange-rate', {
      exchange_rate: exchangeRate,
    });
    if (response?.success) {
      sendToast('success', 'Updated Exchange Rate Successfully.', 4000);
      router.push('/dashboard/accounts');
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Failed to Update Exchange Rate.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Update Exchange Rate' />
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
                  <h1 className='text-30 lh-14 fw-600'>Update Exchange Rate</h1>
                  <div className='text-15 text-light-1'>
                    Update Exchange Rate for UAE:INR.
                  </div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setExchangeRate(e.target.value)}
                          value={exchangeRate}
                          placeholder=' '
                          type='number'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Exchange Rate<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Update Exchange Rate
                      </button>
                    </div>
                  </form>
                </div>
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

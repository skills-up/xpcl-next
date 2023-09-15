import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { createItem, getItem } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { sendToast } from '../../../../utils/toastify';

const AddNewClientTraveller = () => {
  const [travellerName, setTravellerName] = useState('');

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  const client_id = useSelector((state) => state.auth.value.currentOrganization);

  useEffect(() => {
    if (router.isReady) {
      getData();
    }
  }, [router.isReady]);

  const getData = async () => {
    if (router.query.clone) {
      const response = await getItem('client-travellers', router.query.clone);
      if (response?.success) {
        setTravellerName(response.data.traveller_name);
      } else {
        sendToast(
          'error',
          response?.data?.error || response?.data?.message || 'Error fetching Traveller',
          4000
        );
        router.push('/dashboard/client-travellers');
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Checking if client id is not null
    const response = await createItem('client-travellers', {
      traveller_name: travellerName,
      client_id,
    });
    if (response?.success) {
      sendToast('success', 'Created Traveller Successfully.', 4000);
      router.push('/dashboard/client-travellers');
    } else {
      sendToast(
        'error',
        response.data?.message || response.data?.error || 'Failed to Create Traveller.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Create Traveller' />
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
                  <h1 className='text-30 lh-14 fw-600'>Create Traveller</h1>
                  <div className='text-15 text-light-1'>Add a new traveller.</div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <div>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setTravellerName(e.target.value)}
                          value={travellerName}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Traveller Name
                        </label>
                      </div>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Create Traveller
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

export default AddNewClientTraveller;

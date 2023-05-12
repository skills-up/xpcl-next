import Seo from '../../../../../components/common/Seo';
import Footer from '../../../../../components/footer/dashboard-footer';
import Header from '../../../../../components/header/dashboard-header';
import Sidebar from '../../../../../components/sidebars/dashboard-sidebars';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getItem, getList, updateItem } from '../../../../../api/xplorzApi';
import ReactSwitch from 'react-switch';
import Select from 'react-select';

const UpdateClientTraveller = () => {
  const [clientOrgs, setClientOrgs] = useState([]);
  const [clientID, setClientID] = useState(null);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      if (!router.query.traveller_id) {
        router.push('/dashboard/travellers');
      }
      getData();
    }
  }, [router.isReady]);

  const getData = async () => {
    if (router.query.edit) {
      const response = await getItem('client-travellers', router.query.edit);
      if (response?.success) {
        const clientOrgs = await getList('organizations', { is_client: 1 });
        if (clientOrgs?.success) {
          setClientOrgs(
            clientOrgs.data.map((element) => ({ value: element.id, label: element.name }))
          );

          for (let clientOrg of clientOrgs.data) {
            if (clientOrg.id === response.data.client_id)
              setClientID({ label: clientOrg.name, value: clientOrg.id });
          }
        } else {
          sendToast('error', 'Error fetching required data.', 4000);
          router.push('/dashboard/travellers/view/' + router.query.traveller_id);
        }
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Failed to Fetch Client Traveller.',
          4000
        );
        router.push('/dashboard/travellers/view/' + router.query.traveller_id);
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Checking if client id is not null
    if (clientID?.value) {
      const response = await updateItem('client-travellers', router.query.edit, {
        traveller_id: parseInt(router.query.traveller_id),
        client_id: clientID.value,
      });
      if (response?.success) {
        sendToast('success', 'Updated Client Traveller Successfully.', 4000);
        router.push('/dashboard/travellers/view/' + router.query.traveller_id);
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Failed to Update Client Traveller.',
          4000
        );
      }
    } else {
      sendToast('error', 'You must select a Client first.', 8000);
    }
  };

  return (
    <>
      <Seo pageTitle='Update Client Traveller' />
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
                  <h1 className='text-30 lh-14 fw-600'>Update Client Traveller</h1>
                  <div className='text-15 text-light-1'>
                    Update an existing client traveller.
                  </div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <div className='form-input-select'>
                      <label>
                        Client<span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={clientOrgs}
                        value={clientID}
                        placeholder='Search & Select Client (required)'
                        onChange={(id) => setClientID(id)}
                      />
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Update Client Traveller
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

export default UpdateClientTraveller;

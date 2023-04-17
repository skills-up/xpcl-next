import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getItem, getList } from '../../../../api/xplorzApi';
import ReactSwitch from 'react-switch';
import Select from 'react-select';

const AddNewAirlineOrganizations = () => {
  const [airlineOrganizations, setAirlineOrganizations] = useState([]);
  const [airlineOrganizationsID, setAirlineOrganizationsID] = useState(null);
  const [markupPercent, setMarkupPercent] = useState(0);
  const [markupAmount, setMarkupAmount] = useState(0);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    getData();
  }, [router.isReady]);

  const getData = async () => {
    if (router.query.clone) {
      const response = await getItem('airline-organization-markup', router.query.clone);
      if (response?.success) {
        setMarkupPercent(response.data?.markup_percent);
        setMarkupAmount(response.data?.markup_amount);

        const airlineOrganizations = await getList('organizations', { is_airline: 1 });
        if (airlineOrganizations?.success) {
          setAirlineOrganizations(
            airlineOrganizations.data.map((element) => ({
              value: element.id,
              label: element.name,
            }))
          );
          // Setting Airline ID
          for (let org of airlineOrganizations.data) {
            if (org.id === response.data?.airline_id) {
              setAirlineOrganizationsID({ value: org.id, label: org.name });
            }
          }
        } else {
          sendToast('error', 'Unable to fetch required data', 4000);
          router.push('/dashboard/airline-organization-markup');
        }
      } else {
        sendToast(
          'error',
          response.data?.message || response.data?.error || 'Error while fetching data',
          4000
        );
        router.push('/dashboard/airline-organization-markup');
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (airlineOrganizationsID?.value) {
      const response = await createItem('airline-organization-markup', {
        airline_id: airlineOrganizationsID.value,
        markup_percent: parseFloat(markupPercent),
        markup_amount: parseFloat(markupAmount),
      });
      if (response?.success) {
        sendToast('success', 'Created Airline Markup Successfully.', 4000);
        router.push('/dashboard/airline-organization-markup');
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Failed to Create Airline Markup.',
          4000
        );
      }
    } else {
      sendToast('error', 'Airline Organization is Required', 4000);
    }
  };

  return (
    <>
      <Seo pageTitle='Add New Airline Markup' />
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
                  <h1 className='text-30 lh-14 fw-600'>Add New Airline Markup</h1>
                  <div className='text-15 text-light-1'>Create a new airline markup.</div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <div>
                      <label>
                        Select an Airline Organization
                        <span className='text-danger'>*</span>
                      </label>
                      <Select
                        defaultValue={airlineOrganizationsID}
                        options={airlineOrganizations}
                        value={airlineOrganizationsID}
                        placeholder='Search & Select an Airline Organization (required)'
                        onChange={(id) => setAirlineOrganizationsID(id)}
                      />
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setMarkupPercent(e.target.value)}
                          value={markupPercent}
                          placeholder=' '
                          type='number'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Markup Percent<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setMarkupAmount(e.target.value)}
                          value={markupAmount}
                          placeholder=' '
                          type='number'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Markup Amount<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Airline Markup
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

export default AddNewAirlineOrganizations;

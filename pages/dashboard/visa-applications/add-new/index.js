import Seo from '../../../../components/common/Seo';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getList } from '../../../../api/xplorzApi';
import ReactSwitch from 'react-switch';
import Select from 'react-select';
import { FileUploadWithPreview } from 'file-upload-with-preview';
import 'file-upload-with-preview/dist/style.css';
import NewFileUploads from '../../../../components/new-file-uploads';

const AddNewVisaRequirements = () => {
  const [countries, setCountries] = useState([]);
  const [countryID, setCountryID] = useState(null);
  const [businessTravel, setBusinessTravel] = useState(true);
  const [clientTravellers, setClientTravellers] = useState([]);
  const [clientTravellerID, setClientTravellerID] = useState(null);
  const client_id = useSelector((state) => state.auth.value.currentOrganization);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const countries = await getList('countries');
    const clientTravellers = await getList('client-travellers', { client_id });
    if (countries?.success && clientTravellers?.success) {
      setCountries(
        countries.data.map((element) => ({
          value: element.code,
          label: element.name,
        }))
      );
      setClientTravellers(
        clientTravellers.data.map((element) => ({
          value: element.traveller_id,
          label: element.traveller_name,
        }))
      );
    } else {
      sendToast('error', 'Unable to fetch required data', 4000);
      router.push('/dashboard/visa-applications');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Checking if account id is not null
    if (!countryID?.value) {
      sendToast('error', 'You must select a Country first.', 8000);
      return;
    }
    if (!clientTravellerID?.value) {
      sendToast('error', 'You must select  a Client Traveller first.', 8000);
      return;
    }
    const response = await createItem('visa-applications', {
      country_name: countryID?.label,
      business_travel: businessTravel,
      traveller_id: clientTravellerID?.value,
    });
    if (response?.success) {
      sendToast('success', 'Created Visa application Successfully.', 4000);
      router.push('/dashboard/visa-applications/edit/' + response.data.id);
    } else {
      sendToast(
        'error',
        response.data?.message || response.data?.error || 'Failed to Visa application.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Add New Visa application' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>Add New Visa application</h1>
                  <div className='text-15 text-light-1'>
                    Create a new visa application.
                  </div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <div className='col-12 form-input-select'>
                      <label>
                        Country<span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={countries}
                        value={countryID}
                        onChange={(id) => setCountryID(id)}
                      />
                    </div>
                    <div className='col-12 form-input-select'>
                      <label>
                        Client Traveller
                        <span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={clientTravellers}
                        value={clientTravellerID}
                        onChange={(values) => setClientTravellerID(values)}
                      />
                    </div>
                    <div className='col-12 d-flex gap-3 items-center'>
                      <label className=''>Tourist</label>
                      <ReactSwitch
                        className=''
                        onChange={() => setBusinessTravel((prev) => !prev)}
                        checked={businessTravel}
                      />
                      <label className=''>Business Travel</label>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Visa application
                      </button>
                    </div>
                  </form>
                </div>
                </div>
                </>
  );
};

AddNewVisaRequirements.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddNewVisaRequirements;

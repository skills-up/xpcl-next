import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getItem, getList, updateItem } from '../../../../api/xplorzApi';
import ReactSwitch from 'react-switch';
import Select from 'react-select';

const UpdateOrganization = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [address, setAddress] = useState('');
  const [farePercent, setFarePercent] = useState(0);
  const [vendorServicePercent, setVendorServicePercent] = useState(0);
  const [vendorTDSPercent, setVendorTDSPercent] = useState(0);
  const [type, setType] = useState(null);
  const options = [
    { value: 'Client', label: 'Client' },
    { value: 'Airline', label: 'Airline' },
    { value: 'Hotel', label: 'Hotel' },
    { value: 'Vendor', label: 'Vendor' },
    { value: 'Miscellaneous', label: 'Miscellaneous' },
  ];
  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    getData();
  }, [router.isReady]);

  const getData = async () => {
    if (router.query.edit) {
      // Getting Previous Data
      const response = await getItem('organizations', router.query.edit);
      if (response?.success) {
        setName(response.data?.name);
        setCode(response.data?.code);
        setContactName(response.data?.contact_name);
        setContactEmail(response.data?.contact_email);
        setAddress(response.data?.address);
        setFarePercent(response.data?.fare_percent);
        setVendorServicePercent(response.data?.vendor_service_charge_percentage);
        setVendorTDSPercent(response.data?.vendor_tds_percentage);
        // Setting types
        for (let i of options) {
          if (response.data?.type === i.value) setType(i);
        }
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Could not fetch organization information',
          4000
        );
        router.push('/dashboard/organizations');
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!type?.value) {
      sendToast('error', 'Please Select Organization Type', 4000);
      return;
    }
    const response = await updateItem('organizations', router.query.edit, {
      name,
      code,
      contact_name: contactName,
      contact_email: contactEmail,
      address,
      type: type?.value,
      fare_percent: farePercent,
      vendor_service_charge_percentage: vendorServicePercent,
      vendor_tds_percentage: vendorTDSPercent,
    });
    if (response?.success) {
      sendToast('success', 'Updated Organization Successfully.', 4000);
      sessionStorage.removeItem('client-organizations-checked');
      router.push('/dashboard/organizations');
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Failed to Update Organization.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Update Organization' />
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
                  <h1 className='text-30 lh-14 fw-600'>Update Organization</h1>
                  <div className='text-15 text-light-1'>
                    Update an existing organization.
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
                        Select Organization Type<span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={options}
                        value={type}
                        placeholder='Search & Select Organization Type (required)'
                        onChange={(id) => setType(id)}
                      />
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setName(e.target.value)}
                          value={name}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Name<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setCode(e.target.value)}
                          value={code}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Code</label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setContactName(e.target.value)}
                          value={contactName}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Contact Name</label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setContactEmail(e.target.value)}
                          value={contactEmail}
                          placeholder=' '
                          type='email'
                        />
                        <label className='lh-1 text-16 text-light-1'>Contact Email</label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setAddress(e.target.value)}
                          value={address}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Address</label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setFarePercent(e.target.value)}
                          value={farePercent}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Markup Percent
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setVendorServicePercent(e.target.value)}
                          value={vendorServicePercent}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor Service Charge Percent
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setVendorTDSPercent(e.target.value)}
                          value={vendorTDSPercent}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor TDS Percent
                        </label>
                      </div>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Update Organization
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

export default UpdateOrganization;

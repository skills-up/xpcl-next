import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import ReactSwitch from 'react-switch';
import { createItem, getList } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { sendToast } from '../../../../utils/toastify';

const AddNewOrganization = () => {
  const [calenderTemplates, setCalenderTemplates] = useState([]);
  const [calenderTemplateID, setCalenderTemplateID] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstn, setGstn] = useState('');
  const [useGstn, setUseGstn] = useState(false);
  const [commisionIncludesGst, setCommisionIncludesGst] = useState(false);
  const [type, setType] = useState(null);
  const [vendorServicePercent, setVendorServicePercent] = useState(0);
  const [vendorTDSPercent, setVendorTDSPercent] = useState(0);
  const [farePercent, setFarePercent] = useState(0);
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
  }, []);

  const getData = async () => {
    const calenderTemplates = await getList('calendar-templates');
    if (calenderTemplates?.success) {
      setCalenderTemplates(
        calenderTemplates.data.map((element) => ({
          value: element.id,
          label: element?.image_url ? (
            <span>
              {element.name}{' '}
              <img
                style={{ height: '288px', maxWidth: '200px' }}
                src={element.image_url}
              />
            </span>
          ) : (
            <span>{element.name}</span>
          ),
        }))
      );
    } else {
      sendToast('error', 'Unable to fetch required data', 4000);
      router.push('/dashboard/organizations');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Checking if account id is not null
    if (!type?.value) {
      sendToast('error', 'Please Select Organization Type', 4000);
      return;
    }
    const response = await createItem('organizations', {
      calendar_template_id: calenderTemplateID?.value || null,
      name,
      code,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      address,
      gstn,
      use_gstn: useGstn,
      type: type?.value,
      fare_percent: farePercent,
      vendor_service_charge_percentage: vendorServicePercent,
      vendor_tds_percentage: vendorTDSPercent,
      commission_includes_gst: commisionIncludesGst,
    });
    if (response?.success) {
      sendToast('success', 'Created Organization Successfully.', 4000);
      sessionStorage.removeItem('client-organizations-checked');
      router.push('/dashboard/organizations');
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Failed to Create Organization.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Add New Organization' />
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
                  <h1 className='text-30 lh-14 fw-600'>Add New Organization</h1>
                  <div className='text-15 text-light-1'>Create a new organization.</div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <div className='form-input-select col-12 col-lg-6'>
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
                    <div className='form-input-select col-12 col-lg-6'>
                      <label>Select Calendar Template</label>
                      <Select
                        isClearable
                        options={calenderTemplates}
                        value={calenderTemplateID}
                        placeholder='Search & Select Calendar Template'
                        onChange={(id) => setCalenderTemplateID(id)}
                      />
                    </div>
                    <div className='col-12 col-lg-9'>
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
                    <div className='col-12 col-lg-3'>
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
                    <div className='col-12 col-lg-9'>
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
                    <div className='col-12 col-lg-3'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setGstn(e.target.value)}
                          value={gstn}
                          placeholder=' '
                          type='text'
                          pattern='^\d{2}[A-Za-z]{5}\d{4}[A-Za-z]\wZ\w$'
                        />
                        <label className='lh-1 text-16 text-light-1'>GSTN</label>
                      </div>
                    </div>
                    <div className='col-12 col-lg-4'>
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
                    <div className='col-12 col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setContactEmail(e.target.value)}
                          value={contactEmail}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Contact Email</label>
                      </div>
                    </div>
                    <div className='col-12 col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setContactPhone(e.target.value)}
                          value={contactPhone}
                          placeholder=' '
                          pattern='\d{10,12}'
                          title='10-12 digit phone number'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Contact Phone (with Country Code)
                        </label>
                      </div>
                    </div>
                    <div className='col-12 col-lg-4'>
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
                    <div className='col-12 col-lg-4'>
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
                    <div className='col-12 col-lg-4'>
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
                    <div className='d-flex items-center gap-3'>
                      <ReactSwitch
                        onChange={() => setUseGstn((prev) => !prev)}
                        checked={useGstn}
                      />
                      <label>Use GSTN?</label>
                    </div>
                    {type?.value !== 'Client' && (
                      <div className='d-flex items-center gap-3'>
                        <ReactSwitch
                          onChange={() => setCommisionIncludesGst((prev) => !prev)}
                          checked={commisionIncludesGst}
                        />
                        <label>Commission includes GST?</label>
                      </div>
                    )}
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Organization
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

export default AddNewOrganization;

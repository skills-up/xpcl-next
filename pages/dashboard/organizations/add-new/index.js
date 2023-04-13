import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getList } from '../../../../api/xplorzApi';
import ReactSwitch from 'react-switch';
import Select from 'react-select';

const AddNewOrganization = () => {
  const [accounts, setAccounts] = useState([]);
  const [accountID, setAccountID] = useState(null);
  const [calenderTemplates, setCalenderTemplates] = useState([]);
  const [calenderTemplateID, setCalenderTemplateID] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstn, setGstn] = useState('');
  const [useGstn, setUseGstn] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isVendor, setIsVendor] = useState(false);
  const [isHotel, setIsHotel] = useState(false);
  const [isAirline, setIsAirline] = useState(false);
  const [farePercent, setFarePercent] = useState(0);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const accounts = await getList('accounts');
    const calenderTemplates = await getList('calendar-templates');
    if (accounts?.success && calenderTemplates?.success) {
      setCalenderTemplates(
        calenderTemplates.data.map((element) => ({
          value: element.id,
          label: element.name,
        }))
      );
      setAccounts(
        accounts.data.map((element) => ({ value: element.id, label: element.name }))
      );
    } else {
      sendToast('error', 'Unable to fetch required data', 4000);
      router.push('/dashboard/organizations');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Checking if account id is not null
    if (accountID?.value) {
      const response = await createItem('organizations', {
        account_id: accountID.value,
        calendar_template_id: calenderTemplateID?.value || null,
        name,
        code,
        contact_name: contactName,
        contact_email: contactEmail,
        address,
        gstn,
        use_gstn: useGstn,
        is_client: isClient,
        is_vendor: isVendor,
        is_hotel: isHotel,
        is_airline: isAirline,
        fare_percent: farePercent,
      });
      if (response?.success) {
        sendToast('success', 'Created Organization Successfully.', 4000);
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
    } else {
      sendToast('error', 'You must select an Account first.', 8000);
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
                    <div>
                      <Select
                        options={accounts}
                        value={accountID}
                        placeholder='Search & Select Account (required)'
                        onChange={(id) => setAccountID(id)}
                      />
                    </div>
                    {calenderTemplates?.length > 0 && (
                      <div>
                        <Select
                          options={calenderTemplates}
                          value={calenderTemplateID}
                          placeholder='Search & Select Calendar Template'
                          onChange={(id) => setCalenderTemplateID(id)}
                        />
                      </div>
                    )}
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
                          onChange={(e) => setGstn(e.target.value)}
                          value={gstn}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>GSTN</label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setFarePercent(e.target.value)}
                          value={farePercent}
                          placeholder=' '
                          type='number'
                        />
                        <label className='lh-1 text-16 text-light-1'>Fare Percent</label>
                      </div>
                    </div>
                    <div className='row'>
                      <label className='col-lg-2 col-9'>Use GSTN?</label>
                      <ReactSwitch
                        className='col-lg-auto col-1'
                        onChange={() => setUseGstn((prev) => !prev)}
                        checked={useGstn}
                      />
                    </div>
                    <div className='row'>
                      <label className='col-lg-2 col-9'>Is Client?</label>
                      <ReactSwitch
                        className='col-lg-auto col-1'
                        onChange={() => setIsClient((prev) => !prev)}
                        checked={isClient}
                      />
                    </div>
                    <div className='row'>
                      <label className='col-lg-2 col-9'>Is Vendor?</label>
                      <ReactSwitch
                        className='col-lg-auto col-1'
                        onChange={() => setIsVendor((prev) => !prev)}
                        checked={isVendor}
                      />
                    </div>
                    <div className='row'>
                      <label className='col-lg-2 col-9'>Is Hotel?</label>
                      <ReactSwitch
                        className='col-lg-auto col-1'
                        onChange={() => setIsHotel((prev) => !prev)}
                        checked={isHotel}
                      />
                    </div>
                    <div className='row'>
                      <label className='col-lg-2 col-9'>Is Airline?</label>
                      <ReactSwitch
                        className='col-lg-auto col-1'
                        onChange={() => setIsAirline((prev) => !prev)}
                        checked={isAirline}
                      />
                    </div>
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

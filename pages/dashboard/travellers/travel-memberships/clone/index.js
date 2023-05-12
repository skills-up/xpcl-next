import Seo from '../../../../../components/common/Seo';
import Footer from '../../../../../components/footer/dashboard-footer';
import Header from '../../../../../components/header/dashboard-header';
import Sidebar from '../../../../../components/sidebars/dashboard-sidebars';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getItem, getList } from '../../../../../api/xplorzApi';
import ReactSwitch from 'react-switch';
import Select from 'react-select';

const AddNewTravelMembership = () => {
  const [number, setNumber] = useState('');
  const [provider, setProvider] = useState('');
  const [membershipType, setMembershipType] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const options = [
    { value: 'Car Rental', label: 'Car Rental' },
    { value: 'Airline', label: 'Airline' },
    { value: 'Hotel', label: 'Hotel' },
    { value: 'Global Entry', label: 'Global Entry' },
  ];
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
    if (router.query.clone) {
      const response = await getItem('travel-memberships', router.query.clone);
      if (response?.success) {
        for (let type of options)
          if (type.value === response.data?.membership_type) setMembershipType(type);
        setUsername(response.data?.username);
        setPassword(response.data?.password);
        setProvider(response.data?.provider);
        setNumber(response.data?.number);
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Unable to fetch required data',
          4000
        );
        router.push('/dashboard/travellers/view/' + router.query.traveller_id);
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Checking if account id is not null
    if (membershipType?.value) {
      const response = await createItem('travel-memberships', {
        traveller_id: parseInt(router.query.traveller_id),
        password,
        username,
        number,
        membership_type: membershipType.value,
        provider,
      });
      if (response?.success) {
        sendToast('success', 'Created Travel Membership Successfully.', 4000);
        router.push('/dashboard/travellers/view/' + router.query.traveller_id);
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Failed to Create Travel Membership.',
          4000
        );
      }
    } else {
      sendToast('error', 'You must select a Membership Type first.', 8000);
    }
  };

  return (
    <>
      <Seo pageTitle='Add New Travel Membership' />
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
                  <h1 className='text-30 lh-14 fw-600'>Add New Travel Membership</h1>
                  <div className='text-15 text-light-1'>
                    Create a new travel membership.
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
                          onChange={(e) => setNumber(e.target.value)}
                          value={number}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Number<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setProvider(e.target.value)}
                          value={provider}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Provider<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='form-input-select'>
                      <label>
                        Membership Type<span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={options}
                        value={membershipType}
                        placeholder='Search & Select Membership Type (required)'
                        onChange={(id) => setMembershipType(id)}
                      />
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setUsername(e.target.value)}
                          value={username}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Username</label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setPassword(e.target.value)}
                          value={password}
                          placeholder=' '
                          type='password'
                        />
                        <label className='lh-1 text-16 text-light-1'>Password</label>
                      </div>
                    </div>

                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Travel Membership
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

export default AddNewTravelMembership;

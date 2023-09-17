import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getList } from '../../../../api/xplorzApi';
import Select from 'react-select';
import TimezoneSelect from 'react-timezone-select';
import { setInitialAirportsState } from '../../../../features/apis/apisSlice';

const AddNewAirports = () => {
  const [countryName, setCountryName] = useState('');
  const [name, setName] = useState('');
  const [iataCode, setIataCode] = useState('');
  const [city, setCity] = useState('');
  const [timezone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    // Checking if airport id is not null
    const response = await createItem('airports', {
      country_name: countryName,
      name,
      iata_code: iataCode,
      city,
      timezone: timezone?.value || timezone,
    });
    if (response?.success) {
      sendToast('success', 'Created Airport Successfully.', 4000);
      sessionStorage.removeItem('airports-checked');
      dispatch(setInitialAirportsState());
      router.push('/dashboard/airports');
    } else {
      sendToast(
        'error',
        response.data?.message || response.data?.error || 'Failed to Create Airport.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Add New Airport' />
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
                  <h1 className='text-30 lh-14 fw-600'>Add New Airport</h1>
                  <div className='text-15 text-light-1'>Create a new airport.</div>
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
                          onChange={(e) => setCountryName(e.target.value)}
                          value={countryName}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Country Name<span className='text-danger'>*</span>
                        </label>
                      </div>
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
                          onChange={(e) => setIataCode(e.target.value)}
                          value={iataCode}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          IATA Code<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setCity(e.target.value)}
                          value={city}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          City<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label>Timezone</label>
                      <TimezoneSelect
                        value={timezone}
                        onChange={setTimeZone}
                        placeholder='Select Timezone'
                      />
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Airport
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

export default AddNewAirports;

import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getItem, getList, updateItem } from '../../../../api/xplorzApi';
import Select from 'react-select';
import TimezoneSelect from 'react-timezone-select';

const UpdateAirports = () => {
  const [countries, setCountries] = useState([]);
  const [countryID, setCountryID] = useState(null);
  const [name, setName] = useState('');
  const [iataCode, setIataCode] = useState('');
  const [city, setCity] = useState('');
  const [timezone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    getData();
  }, [router.isReady]);

  const getData = async () => {
    if (router.query.edit) {
      const response = await getItem('airports', router.query.edit);
      if (response?.data) {
        setName(response.data?.name);
        setIataCode(response.data?.iata_code);
        setCity(response.data?.city);
        setTimeZone(response.data?.timezone);
        const countries = await getList('countries');
        if (countries?.success) {
          setCountries(
            countries.data.map((element) => ({
              value: element.id,
              label: element.name,
            }))
          );
          // Setting country
          for (let country of countries.data) {
            if (country.id === response.data?.country_id) {
              setCountryID({ value: country.id, label: country.name });
            }
          }
        } else {
          sendToast('error', 'Unable to fetch required data', 4000);
          router.push('/dashboard/airports');
        }
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Unable to fetch required data',
          4000
        );
        router.push('/dashboard/airports');
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Checking if airport id is not null
    if (countryID?.value) {
      const response = await updateItem('/airports', router.query.edit, {
        country_id: countryID.value,
        name,
        iata_code: iataCode,
        city,
        timezone: timezone?.value || timezone,
      });
      if (response?.success) {
        sendToast('success', 'Updated Airport Successfully.', 4000);
        router.push('/dashboard/airports');
      } else {
        sendToast(
          'error',
          response.data?.message || response.data?.error || 'Failed to Update Airport.',
          4000
        );
      }
    } else {
      sendToast('error', 'You must select a Country.', 4000);
    }
  };

  return (
    <>
      <Seo pageTitle='Update Airport' />
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
                  <h1 className='text-30 lh-14 fw-600'>Update Airport</h1>
                  <div className='text-15 text-light-1'>Update an existing airport.</div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <div>
                      <Select
                        options={countries}
                        defaultValue={countryID}
                        value={countryID}
                        placeholder='Search & Select Country (required)'
                        onChange={(id) => setCountryID(id)}
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
                      <TimezoneSelect
                        defaultValue={timezone}
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
                        Update Airport
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

export default UpdateAirports;

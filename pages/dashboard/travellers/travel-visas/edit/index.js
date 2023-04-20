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
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { FileUploadWithPreview } from 'file-upload-with-preview';
import 'file-upload-with-preview/dist/style.css';
import PreviousUploadPictures from '../../../../../components/previous-file-uploads';
import NewFileUploads from '../../../../../components/new-file-uploads';

const UpdateTravelVisa = () => {
  const [countries, setCountries] = useState([]);
  const [countryID, setCountryID] = useState(null);
  const [visaNumber, setVisaNumber] = useState('');
  const [issuePlace, setIssuePlace] = useState('');
  const [issueDate, setIssueDate] = useState(new DateObject());
  const [expiryDate, setExpiryDate] = useState(new DateObject());
  const [entries, setEntries] = useState(null);
  const [visaFiles, setVisaFiles] = useState([]);
  const [previousVisaFiles, setPreviousVisaFiles] = useState([]);
  const options = [
    { value: 'Single', label: 'Single' },
    { value: 'Double', label: 'Double' },
    { value: 'Multiple', label: 'Multiple' },
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
    if (router.query.edit) {
      const response = await getItem('travel-visas', router.query.edit);
      if (response?.success) {
        // Setting previous values
        setVisaNumber(response.data?.visa_number || '');
        setIssuePlace(response.data?.issue_place || '');
        setIssueDate(
          response.data?.issue_date
            ? new DateObject({ date: response.data?.issue_date, format: 'YYYY-MM-DD' })
            : new DateObject()
        );
        setExpiryDate(
          response.data?.expiry_date
            ? new DateObject({ date: response.data?.expiry_date, format: 'YYYY-MM-DD' })
            : new DateObject()
        );
        if (response.data?.visa_scans) setPreviousVisaFiles(response.data?.visa_scans);

        // Setting Passport Gender
        for (let opt of options)
          if (opt.value === response.data?.entries) setEntries(opt);

        const countries = await getList('countries');
        if (countries?.success) {
          setCountries(
            countries.data.map((element) => ({ value: element.id, label: element.name }))
          );
          // Setting Country
          for (let country of countries.data)
            if (country.id === response.data?.country_id)
              setCountryID({ value: country.id, label: country.name });
        } else {
          sendToast('error', 'Error fetching countries', 4000);
          router.push('/dashboard/travellers/view/' + router.query.traveller_id);
        }
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
    if (countryID?.value) {
      const formData = new FormData();
      formData.append('traveller_id', parseInt(router.query.traveller_id));
      formData.append('country_id', countryID.value);
      formData.append('visa_number', visaNumber);
      formData.append('issue_place', issuePlace);
      formData.append('issue_date', issueDate.format('YYYY-MM-DD'));
      formData.append('expiry_date', expiryDate.format('YYYY-MM-DD'));
      formData.append('entries', entries?.value || '');
      for (let prev of previousVisaFiles) {
        formData.append('visa_scans[]', prev);
      }
      for (let file of visaFiles) {
        formData.append('visa_scan_files[]', file);
      }
      formData.append('_method', 'PUT');
      const response = await createItem('travel-visas/' + router.query.edit, formData);
      if (response?.success) {
        sendToast('success', 'Updated Travel Visa Successfully.', 4000);
        router.push('/dashboard/travellers/view/' + router.query.traveller_id);
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Failed to Update Travel Visa.',
          4000
        );
      }
    } else {
      sendToast('error', 'Country is required', 4000);
    }
  };

  return (
    <>
      <Seo pageTitle='Update Travel Visa' />
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
                  <h1 className='text-30 lh-14 fw-600'>Update Travel Visa</h1>
                  <div className='text-15 text-light-1'>
                    Update an existing travel visa.
                  </div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <div>
                      <label>
                        Country<span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={countries}
                        value={countryID}
                        placeholder='Search & Select Country (required)'
                        onChange={(id) => setCountryID(id)}
                      />
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setVisaNumber(e.target.value)}
                          value={visaNumber}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Visa Number<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setIssuePlace(e.target.value)}
                          value={issuePlace}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Issue Place<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='d-block ml-4'>
                      <label>
                        Issue Date<span className='text-danger'>*</span>
                      </label>
                      <DatePicker
                        style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                        inputClass='custom_input-picker'
                        containerClassName='custom_container-picker'
                        value={issueDate}
                        onChange={setIssueDate}
                        numberOfMonths={1}
                        offsetY={10}
                        format='DD MMMM YYYY'
                      />
                    </div>
                    <div className='d-block ml-4'>
                      <label>
                        Expiry Date<span className='text-danger'>*</span>
                      </label>
                      <DatePicker
                        style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                        inputClass='custom_input-picker'
                        containerClassName='custom_container-picker'
                        value={expiryDate}
                        onChange={setExpiryDate}
                        numberOfMonths={1}
                        offsetY={10}
                        format='DD MMMM YYYY'
                      />
                    </div>
                    <div>
                      <label>Entries</label>
                      <Select
                        options={options}
                        value={entries}
                        placeholder='Search & Select Entries'
                        onChange={(id) => setEntries(id)}
                      />
                    </div>
                    {/* Visa Scan Files */}

                    <div className='col-lg-6'>
                      <label>Visa Scan Files</label>{' '}
                      {previousVisaFiles?.length > 0 && (
                        <PreviousUploadPictures
                          data={previousVisaFiles}
                          onDeleteClick={() => {
                            setPreviousVisaFiles((prev, index) => {
                              prev.splice(index, 1);
                              return [...prev];
                            });
                          }}
                        />
                      )}
                      <NewFileUploads multiple={true} setUploads={setVisaFiles} />
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Update Travel Visa
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

export default UpdateTravelVisa;

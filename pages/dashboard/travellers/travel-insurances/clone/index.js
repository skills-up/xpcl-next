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

const AddNewTravelInsurance = () => {
  const [policyNumber, setPolicyNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new DateObject());
  const [expiryDate, setExpiryDate] = useState(new DateObject());
  const [insuranceType, setInsuranceType] = useState(null);
  const [nomineeName, setNomineeName] = useState('');
  const [documentFiles, setDocumentFiles] = useState([]);
  const options = [
    { value: 'Single Trip', label: 'Single Trip' },
    { value: 'Annual Multi-Trip', label: 'Annual Multi-Trip' },
  ];
  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      if (!router.query.traveller_id) {
        router.push('/dashboard/travellers');
      }
      setDocumentFiles(
        new FileUploadWithPreview('travellers-add-new-documents', {
          multiple: true,
          accept: '.pdf, .png, .jpg',
          text: {
            browse: 'Browse',
            chooseFile: '',
            label: 'Choose File to Upload',
          },
        })
      );
      getData();
    }
  }, [router.isReady]);

  const getData = async () => {
    if (router.query.clone) {
      const response = await getItem('travel-insurances', router.query.clone);
      if (response?.success) {
        // Setting previous values
        setPolicyNumber(response.data?.policy_number || '');
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
        setNomineeName(response.data?.nominee_name || '');

        // Setting Passport Gender
        for (let opt of options)
          if (opt.value === response.data?.insurance_type) setInsuranceType(opt);
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
    const formData = new FormData();
    formData.append('traveller_id', parseInt(router.query.traveller_id));
    formData.append('policy_number', policyNumber);
    formData.append('issue_date', issueDate.format('YYYY-MM-DD'));
    formData.append('expiry_date', expiryDate.format('YYYY-MM-DD'));
    formData.append('insurance_type', insuranceType?.value || '');
    formData.append('nominee_name', nomineeName);
    for (let file of documentFiles?.cachedFileArray) {
      formData.append('document_files[]', file);
    }
    const response = await createItem('travel-insurances', formData);
    if (response?.success) {
      sendToast('success', 'Created Travel Insurance Successfully.', 4000);
      router.push('/dashboard/travellers/view/' + router.query.traveller_id);
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Failed to Create Travel Insurance.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Add New Travel Insurance' />
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
                  <h1 className='text-30 lh-14 fw-600'>Add New Travel Insurance</h1>
                  <div className='text-15 text-light-1'>
                    Create a new travel insurance.
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
                          onChange={(e) => setPolicyNumber(e.target.value)}
                          value={policyNumber}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Policy Number<span className='text-danger'>*</span>
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
                      <label>Insurance Type</label>
                      <Select
                        options={options}
                        value={insuranceType}
                        placeholder='Search & Select Insurance Type'
                        onChange={(id) => setInsuranceType(id)}
                      />
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setNomineeName(e.target.value)}
                          value={nomineeName}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>Nominee Name</label>
                      </div>
                    </div>
                    {/* Document Files */}
                    <div className='col-lg-6'>
                      <label>Document Files</label>
                      <div
                        className='custom-file-container'
                        data-upload-id='travellers-add-new-documents'
                      ></div>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Travel Insurance
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

export default AddNewTravelInsurance;

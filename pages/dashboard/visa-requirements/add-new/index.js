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
import { FileUploader } from 'react-drag-drop-files';

const AddNewVisaRequirements = () => {
  const [countries, setCountries] = useState([]);
  const [countryID, setCountryID] = useState(null);
  const [requiredVisaDocs, setRequiredVisaDocs] = useState([]);
  const [businessTravel, setBusinessTravel] = useState(false);
  const [consulateCity, setConsulateCity] = useState('');
  const [photoCount, setPhotoCount] = useState('');
  const [photoSpecifications, setPhotoSpecifications] = useState('');
  const [photoDimension, setPhotoDimension] = useState('');
  const [processingTime, setProcessingTime] = useState('');
  const [consulateDetails, setConsulateDetails] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [personalDocsReqs, setPersonalDocsReqs] = useState([]);
  const [financialDocsReqs, setFinancialDocsReqs] = useState([]);
  const [supportingDocsReqs, setSupportingDocsReqs] = useState([]);
  const [photoSample, setPhotoSample] = useState();
  const [visaFormFiles, setVisaFormFiles] = useState();

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const countries = await getList('accounts');
    const requiredVisaDocs = await getList('visa-requirement-documents');
    if (countries?.success && requiredVisaDocs?.success) {
      setCountries(
        countries.data.map((element) => ({
          value: element.id,
          label: element.name,
        }))
      );
      setRequiredVisaDocs(
        requiredVisaDocs.data.map((element) => ({
          value: element.id,
          label: element.name,
        }))
      );
    } else {
      sendToast('error', 'Unable to fetch required data', 4000);
      router.push('/dashboard/visa-requirements');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Checking if account id is not null
    if (countryID?.value) {
      const response = await createItem('visa-requirements', {
        country_id: countryID.value,
        business_travel: businessTravel,
        consulate_city: consulateCity,
        photo_count: photoCount,
        photo_dimension: photoDimension,
        photo_specifications: photoSpecifications,
        photo_sample: photoSample,
        processing_time: processingTime,
        consulate_details: consulateDetails,
        additional_notes: additionalNotes,
        personal_docs_reqs: personalDocsReqs,
        financial_docs_reqs: financialDocsReqs,
        supporting_docs_reqs: supportingDocsReqs,
        visa_form_files: visaFormFiles,
      });
      if (response?.success) {
        sendToast('success', 'Created Visa Requirement Successfully.', 4000);
        router.push('/dashboard/visa-requirements');
      } else {
        sendToast(
          'error',
          response.data?.message || response.data?.error || 'Failed to Visa Requirement.',
          4000
        );
      }
    } else {
      sendToast('error', 'You must select a Country first.', 8000);
    }
  };

  return (
    <>
      <Seo pageTitle='Add New Visa Requirement' />
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
                  <h1 className='text-30 lh-14 fw-600'>Add New Visa Requirement</h1>
                  <div className='text-15 text-light-1'>
                    Create a new visa requirement.
                  </div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <div className='col-12 row'>
                      <label className='col-lg-2 col-9'>Is Business Travel</label>
                      <ReactSwitch
                        className='col-lg-auto col-1'
                        onChange={() => setBusinessTravel((prev) => !prev)}
                        checked={businessTravel}
                      />
                    </div>
                    <div className='col-12'>
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
                          onChange={(e) => setConsulateCity(e.target.value)}
                          value={consulateCity}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Consulate City<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setPhotoCount(e.target.value)}
                          value={photoCount}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Photo Count<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setPhotoDimension(e.target.value)}
                          value={photoDimension}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Photo Dimensions<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setPhotoSpecifications(e.target.value)}
                          value={photoSpecifications}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Photo Specifications<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setProcessingTime(e.target.value)}
                          value={processingTime}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Processing Time<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setConsulateDetails(e.target.value)}
                          value={consulateDetails}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Consulate Details<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setAdditionalNotes(e.target.value)}
                          value={additionalNotes}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Additional Notes<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <label>
                        Personal Documents Required
                        <span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={requiredVisaDocs}
                        isMulti
                        placeholder='Search & Select Personal Documents (required)'
                        onChange={(values) => {
                          setPersonalDocsReqs(values.map((element) => element.value));
                        }}
                      />
                    </div>
                    <div className='col-12'>
                      <label>
                        Financial Documents Required
                        <span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={requiredVisaDocs}
                        isMulti
                        placeholder='Search & Select Financial Documents (required)'
                        onChange={(values) => {
                          setFinancialDocsReqs(values.map((element) => element.value));
                        }}
                      />
                    </div>
                    <div className='col-12'>
                      <label>
                        Supporting Documents Required
                        <span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={requiredVisaDocs}
                        isMulti
                        placeholder='Search & Select Supporting Documents (required)'
                        onChange={(values) => {
                          setSupportingDocsReqs(values.map((element) => element.value));
                        }}
                      />
                    </div>
                    <div className='col-12'>
                      <label>
                        Visa Forms<span className='text-danger'>*</span>
                      </label>
                      <FileUploader
                        multiple={true}
                        handleChange={(files) => {
                          console.log(files);
                          // TODO
                          // Continue from here file upload logic handler
                        }}
                      />
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Visa Requirement
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

export default AddNewVisaRequirements;

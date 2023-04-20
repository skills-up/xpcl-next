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
import { FileUploadWithPreview } from 'file-upload-with-preview';
import 'file-upload-with-preview/dist/style.css';
import PreviousUploadPictures from '../../../../components/previous-file-uploads';

const UpdateVisaRequirements = () => {
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
  const [photoSample, setPhotoSample] = useState(null);
  const [visaFormFiles, setVisaFormFiles] = useState(null);
  const [previousVisaFormFiles, setPreviousVisaFormFiles] = useState([]);
  const [previousPhotoSample, setPreviousPhotoSample] = useState('');

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      setVisaFormFiles(
        new FileUploadWithPreview('visa-requirements-add-new-visa-forms', {
          multiple: true,
          accept: '.jpg, .png, .jpeg, .pdf',
          text: {
            browse: 'Browse',
            chooseFile: '',
            label: 'Choose Files to Upload',
          },
        })
      );
      setPhotoSample(
        new FileUploadWithPreview('visa-requirements-add-new-photo-sample', {
          multiple: false,
          accept: '.jpg, .png, .jpeg',
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
    if (router.query.edit) {
      const response = await getItem('visa-requirements', router.query.edit);
      if (response?.success) {
        // Setting previous values
        setBusinessTravel(response.data?.business_travel);
        setConsulateCity(response.data?.consulate_city);
        setPhotoCount(response.data?.photo_count);
        setPhotoDimension(response.data?.photo_dimension);
        setPhotoSpecifications(response.data?.photo_specifications);
        setProcessingTime(response.data?.processing_time);
        setConsulateDetails(response.data?.consulate_details);
        setAdditionalNotes(response.data?.additional_notes);
        setPreviousVisaFormFiles(response.data?.visa_forms);
        setPreviousPhotoSample(response.data?.photo_sample);

        const countries = await getList('countries');
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
              category: element?.category,
            }))
          );
          // Setting Selected Country
          for (let country of countries.data) {
            if (country.id === response.data?.country_id)
              setCountryID({ value: country.id, label: country.name });
          }
          // Setting Selected Required Docs
          if (
            response.data?.personal_docs_reqs &&
            response.data?.financial_docs_reqs &&
            response.data?.supporting_docs_reqs
          ) {
            const tempArr = [
              ...response.data.personal_docs_reqs,
              ...response.data.financial_docs_reqs,
              ...response.data.supporting_docs_reqs,
            ];
            let personalDocs = [];
            let supportDocs = [];
            let financialDocs = [];
            for (let reqDoc of requiredVisaDocs.data) {
              if (tempArr.includes(reqDoc?.id?.toString())) {
                if (reqDoc?.category === 'Personal') {
                  personalDocs.push({
                    value: reqDoc?.id,
                    label: reqDoc?.name,
                    category: reqDoc?.category,
                  });
                } else if (reqDoc?.category === 'Support') {
                  supportDocs.push({
                    value: reqDoc?.id,
                    label: reqDoc?.name,
                    category: reqDoc?.category,
                  });
                } else if (reqDoc?.category === 'Financial') {
                  financialDocs.push({
                    value: reqDoc?.id,
                    label: reqDoc?.name,
                    category: reqDoc?.category,
                  });
                }
              }
            }
            setPersonalDocsReqs(personalDocs);
            setFinancialDocsReqs(financialDocs);
            setSupportingDocsReqs(supportDocs);
          }
        } else {
          sendToast('error', 'Unable to fetch required data', 4000);
          router.push('/dashboard/visa-requirements');
        }
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Unable to fetch required data',
          4000
        );
        router.push('/dashboard/visa-requirements');
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Checking if account id is not null
    if (countryID?.value) {
      if (
        visaFormFiles?.cachedFileArray?.length > 0 ||
        previousVisaFormFiles.length > 0
      ) {
        if (
          personalDocsReqs.length === 0 ||
          financialDocsReqs.length === 0 ||
          supportingDocsReqs.length === 0
        ) {
          sendToast('error', 'Please select all required documents.', 8000);
          return;
        }
        let visaFormData = new FormData();
        visaFormData.append('country_id', countryID.value);
        visaFormData.append('business_travel', businessTravel ? 1 : 0);
        visaFormData.append('consulate_city', consulateCity);
        visaFormData.append('photo_count', photoCount);
        visaFormData.append('photo_dimension', photoDimension);
        visaFormData.append('photo_specifications', photoSpecifications);
        visaFormData.append('photo_sample', previousPhotoSample);
        visaFormData.append('photo_sample_file', photoSample?.cachedFileArray[0] || '');
        visaFormData.append('processing_time', processingTime);
        visaFormData.append('consulate_details', consulateDetails);
        visaFormData.append('additional_notes', additionalNotes);
        for (let prevVisa of previousVisaFormFiles) {
          visaFormData.append('visa_forms[]', prevVisa);
        }
        for (let personalDoc of personalDocsReqs)
          visaFormData.append('personal_docs_reqs[]', personalDoc?.value);
        for (let financialDoc of financialDocsReqs)
          visaFormData.append('financial_docs_reqs[]', financialDoc?.value);
        for (let supportingDoc of supportingDocsReqs)
          visaFormData.append('supporting_docs_reqs[]', supportingDoc?.value);

        for (let visaForm of visaFormFiles.cachedFileArray)
          visaFormData.append('visa_form_files[]', visaForm);

        visaFormData.append('_method', 'PUT');
        const response = await createItem(
          'visa-requirements/' + router.query.edit,
          visaFormData
        );
        if (response?.success) {
          sendToast('success', 'Updated Visa Requirement Successfully.', 4000);
          router.push('/dashboard/visa-requirements');
        } else {
          sendToast(
            'error',
            response.data?.message ||
              response.data?.error ||
              'Failed to Visa Requirement.',
            4000
          );
        }
      } else {
        sendToast('error', 'At least 1 Visa Form is required', 8000);
      }
    } else {
      sendToast('error', 'You must select a Country first.', 8000);
    }
  };

  return (
    <>
      <Seo pageTitle='Update Visa Requirement' />
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
                  <h1 className='text-30 lh-14 fw-600'>Update Visa Requirement</h1>
                  <div className='text-15 text-light-1'>
                    Update an existing visa requirement.
                  </div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <div className='col-12 d-flex gap-3 items-center'>
                      <label className=''>Tourist</label>
                      <ReactSwitch
                        className=''
                        onChange={() => setBusinessTravel((prev) => !prev)}
                        checked={businessTravel}
                      />
                      <label className=''>Business Travel</label>
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
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Consulate City
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
                        />
                        <label className='lh-1 text-16 text-light-1'>Photo Count</label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setPhotoDimension(e.target.value)}
                          value={photoDimension}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Photo Dimensions
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
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Photo Specifications
                        </label>
                      </div>
                    </div>
                    {/* Photo Sample Upload */}
                    {previousPhotoSample && (
                      <div>
                        <label>Previous Photo Sample</label>
                        <PreviousUploadPictures
                          data={[previousPhotoSample]}
                          onDeleteClick={() => {
                            setPreviousPhotoSample('');
                          }}
                        />
                      </div>
                    )}
                    <div className='col-lg-6'>
                      <label>Photo Sample</label>
                      <div
                        className='custom-file-container'
                        data-upload-id='visa-requirements-add-new-photo-sample'
                      ></div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setProcessingTime(e.target.value)}
                          value={processingTime}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Processing Time
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
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Consulate Details
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
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Additional Notes
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <label>
                        Personal Documents Required
                        <span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={requiredVisaDocs.filter(
                          (element) => element?.category === 'Personal'
                        )}
                        value={personalDocsReqs}
                        isMulti
                        placeholder='Search & Select Personal Documents (required)'
                        onChange={(values) => setPersonalDocsReqs(values)}
                      />
                    </div>
                    <div className='col-12'>
                      <label>
                        Financial Documents Required
                        <span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={requiredVisaDocs.filter(
                          (element) => element?.category === 'Financial'
                        )}
                        value={financialDocsReqs}
                        isMulti
                        placeholder='Search & Select Financial Documents (required)'
                        onChange={(values) => setFinancialDocsReqs(values)}
                      />
                    </div>
                    <div className='col-12'>
                      <label>
                        Supporting Documents Required
                        <span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={requiredVisaDocs.filter(
                          (element) => element?.category === 'Support'
                        )}
                        value={supportingDocsReqs}
                        isMulti
                        placeholder='Search & Select Supporting Documents (required)'
                        onChange={(values) => setSupportingDocsReqs(values)}
                      />
                    </div>
                    {/* Visa Form Upload */}
                    <div>
                      <label>
                        Visa Forms<span className='text-danger'>*</span>
                      </label>
                      {previousVisaFormFiles && (
                        <div>
                          <label>Previous Visa Files</label>
                          <PreviousUploadPictures
                            data={previousVisaFormFiles}
                            onDeleteClick={(element, index) => {
                              setPreviousVisaFormFiles((prev) => {
                                prev.splice(index, 1);
                                return [...prev];
                              });
                            }}
                          />
                        </div>
                      )}
                      <div
                        className='custom-file-container col-lg-6'
                        data-upload-id='visa-requirements-add-new-visa-forms'
                      ></div>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Update Visa Requirement
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

export default UpdateVisaRequirements;

import { useRouter } from 'next/router';
import { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { createItem, getItem, getList } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import NewFileUploads from '../../../../components/new-file-uploads';
import PreviousUploadPictures from '../../../../components/previous-file-uploads';
import { sendToast } from '../../../../utils/toastify';
import { saveAs } from 'file-saver';

const UpdateVisaApplications = () => {
  const [visaRequirement, setVisaRequirement] = useState(null);
  const [personalDocsReqs, setPersonalDocsReqs] = useState(null);
  const [financialDocsReqs, setFinancialDocsReqs] = useState(null);
  const [supportingDocsReqs, setSupportingDocsReqs] = useState(null);
  const [photoSample, setPhotoSample] = useState(null);
  const [visaFormFiles, setVisaFormFiles] = useState([]);
  const [visaFormUrls, setVisaFormUrls] = useState([]);
  const [previousVisaFormFiles, setPreviousVisaFormFiles] = useState([]);
  const [previousPhotoSample, setPreviousPhotoSample] = useState('');
  const [previousPersonalDocReqs, setPreviousPersonalDocReqs] = useState('');
  const [previousFinancialDocReqs, setPreviousFinancialDocReqs] = useState('');
  const [previousSupportingDocReqs, setPreviousSupportingDocReqs] = useState('');
  const [steps, setSteps] = useState([{ step: 1, name: 'Traveller Photo' }]);
  const [currentStep, setCurrentStep] = useState({ step: 1, name: 'Traveller Photo' });

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      getData();
    }
  }, [router.isReady]);

  const getData = async () => {
    if (router.query.edit) {
      const response = await getItem('visa-applications', router.query.edit);
      const reqDocs = await getList('visa-requirement-documents');
      if (response?.success && reqDocs?.success) {
        // TODO setting steps accordance to visa_requirement data
        let temp = steps;
        let totalSteps = 1;
        if (response.data.visa_requirement) {
          if (
            response.data.visa_requirement.personal_docs_reqs &&
            response.data.visa_requirement.personal_docs_reqs.length > 0
          ) {
            temp.push({ step: ++totalSteps, name: 'Personal Required Documents' });
          }
          if (
            response.data.visa_requirement.financial_docs_reqs &&
            response.data.visa_requirement.financial_docs_reqs.length > 0
          ) {
            temp.push({ step: ++totalSteps, name: 'Financial Required Documents' });
          }
          if (
            response.data.visa_requirement.supporting_docs_reqs &&
            response.data.visa_requirement.supporting_docs_reqs.length > 0
          ) {
            temp.push({ step: ++totalSteps, name: 'Supporting Required Documents' });
          }
          if (
            response.data.visa_requirement.visa_forms &&
            response.data.visa_requirement.visa_forms.length > 0
          ) {
            setVisaFormUrls(response.data.visa_requirement.visa_forms);
            temp.push({ step: ++totalSteps, name: 'Visa Forms' });
          }
        }
        setSteps(temp);
        // Setting previous values
        let personalParse, financialParse, supportingParse;
        // try {
        //   personalParse = JSON.parse(response.data?.personal_docs_scans);
        // } catch (err) {
        personalParse = response.data?.personal_docs_scans;
        // }
        // try {
        // financialParse = JSON.parse(response.data?.financial_docs_scans);
        // } catch (err) {
        financialParse = response.data?.financial_docs_scans;
        // }
        // try {
        // supportingParse = JSON.parse(response.data?.supporting_docs_scans);
        // } catch (err) {
        supportingParse = response.data?.supporting_docs_scans;
        // }
        setVisaRequirement(response.data?.visa_requirement);
        setPreviousPersonalDocReqs(personalParse);
        setPreviousFinancialDocReqs(financialParse);
        setPreviousSupportingDocReqs(supportingParse);
        setPreviousPhotoSample(response.data?.photo_scan);
        setPreviousVisaFormFiles(response.data?.visa_requirement?.visa_forms);
        // Setting Selected Required Docs
        let personalDocs = {};
        let supportDocs = {};
        let financialDocs = {};
        for (let req of reqDocs.data) {
          for (let x of response.data.visa_requirement.personal_docs_reqs) {
            if (+x === req.id) {
              personalDocs[req.name] = null;
            }
          }
          for (let x of response.data.visa_requirement.financial_docs_reqs) {
            if (+x === req.id) {
              financialDocs[req.name] = null;
            }
          }
          for (let x of response.data.visa_requirement.supporting_docs_reqs) {
            if (+x === req.id) {
              supportDocs[req.name] = null;
            }
          }
        }
        setPersonalDocsReqs(personalDocs);
        setFinancialDocsReqs(financialDocs);
        setSupportingDocsReqs(supportDocs);
      } else {
        sendToast(
          'error',
          response.data?.message ||
          response.data?.error ||
          'Unable to fetch required data',
          4000
        );
        router.push('/dashboard/visa-applications');
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Checking if account id is not null
    let visaFormData = new FormData();
    visaFormData.append('photo_scan', previousPhotoSample ?? '');
    if (photoSample) visaFormData.append('photo_scan_file', photoSample ?? '');
    // visaFormData.append(
    //   'personal_docs_scans',
    //   previousPersonalDocReqs ?? '' //? JSON.stringify(previousPersonalDocReqs) : ''
    // );

    // visaFormData.append(
    //   'financial_docs_scans',
    //   previousFinancialDocReqs ?? '' //? JSON.stringify(previousFinancialDocReqs) : ''
    // );
    if (previousPersonalDocReqs) {
      for (let [key, value] of Object.entries(previousPersonalDocReqs))
        visaFormData.append(
          `personal_docs_scans[${key}]`,
          value //?? JSON.stringify(previousSupportingDocReqs) : ''
        );
    }
    if (previousFinancialDocReqs) {
      for (let [key, value] of Object.entries(previousFinancialDocReqs))
        visaFormData.append(
          `financial_docs_scans[${key}]`,
          value //?? JSON.stringify(previousSupportingDocReqs) : ''
        );
    }
    if (previousSupportingDocReqs) {
      for (let [key, value] of Object.entries(previousSupportingDocReqs))
        visaFormData.append(
          `supporting_docs_scans[${key}]`,
          value //?? JSON.stringify(previousSupportingDocReqs) : ''
        );
    }
    for (let [key, value] of Object.entries(personalDocsReqs))
      if (value) visaFormData.append(`personal_docs_scan_files[${key}]`, value);
    for (let [key, value] of Object.entries(financialDocsReqs))
      if (value) visaFormData.append(`financial_docs_scan_files[${key}]`, value);
    for (let [key, value] of Object.entries(supportingDocsReqs))
      if (value) visaFormData.append(`supporting_docs_scan_files[${key}]`, value);
    for (let prevVisa of previousVisaFormFiles) {
      visaFormData.append('visa_forms[]', prevVisa);
    }
    for (let visaForm of visaFormFiles)
      visaFormData.append('visa_form_files[]', visaForm);

    visaFormData.append('_method', 'PUT');
    const response = await createItem(
      'visa-applications/' + router.query.edit,
      visaFormData
    );
    if (response?.success) {
      sendToast('success', 'Updated Visa Application Successfully.', 4000);
      router.push('/dashboard/visa-applications');
    } else {
      sendToast(
        'error',
        response.data?.message || response.data?.error || 'Failed to Visa Application.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Update Visa Application' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
        <div className='col-12'>
          <h1 className='text-30 lh-14 fw-600'>Update Visa Application</h1>
          <div className='text-15 text-light-1'>
            Update an existing visa application.
          </div>
        </div>
        {/* End .col-12 */}
      </div>
      {/* End .row */}
      <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
        <div className='row x-gap-20 y-gap-30 items-center'>
          {steps.map((step, index) => (
            <Fragment key={index}>
              <div className='col-auto'>
                <div
                  className='d-flex items-center cursor-pointer transition'
                  onClick={() => setCurrentStep(step)}
                >
                  <div
                    className={
                      currentStep.step === step.step
                        ? 'active size-40 rounded-full flex-center bg-blue-1'
                        : 'size-40 rounded-full flex-center bg-blue-1-05 text-blue-1 fw-500'
                    }
                  >
                    {currentStep.step === step.step ? (
                      <>
                        <i className='icon-check text-16 text-white'></i>
                      </>
                    ) : (
                      <>
                        <span>{step.step}</span>
                      </>
                    )}
                  </div>

                  <div className='text-15 fw-500 ml-10'> {step.name}</div>
                </div>
              </div>
              {/* End .col */}
              {index + 1 < steps.length && (
                <>
                  <div className='col d-none d-sm-block'>
                    <div className='w-full h-1 bg-border'></div>
                  </div>
                </>
              )}
            </Fragment>
          ))}
        </div>
        <form
          onSubmit={onSubmit}
          className='row col-12 y-gap-20 mt-10 lg:mt-20'
        >
          {/* Photo Sample Upload */}
          {currentStep?.step === 1 && (
            <div className='col-12'>
              <h3>Upload Traveller's Photo</h3>
              <label className='lh-1 text-16 text-light-1'>
                Traveller Photo
              </label>
              {previousPhotoSample && (
                <PreviousUploadPictures
                  data={[previousPhotoSample]}
                  onDeleteClick={() => {
                    setPreviousPhotoSample('');
                  }}
                />
              )}
              <NewFileUploads multiple={false} setUploads={setPhotoSample} />
            </div>
          )}
          {/* Personal Docs */}
          {personalDocsReqs &&
            currentStep.name === 'Personal Required Documents' && (
              <div>
                <h3>Upload Personal Documents</h3>
                {Object.entries(personalDocsReqs).map(([key, value], index) => (
                  <div className='col-12 mb-10'>
                    <label className='lh-1 text-16 text-light-1'>{key}</label>
                    {previousPersonalDocReqs && (
                      <PreviousUploadPictures
                        data={[previousPersonalDocReqs[key]]}
                        onDeleteClick={() => {
                          setPreviousPersonalDocReqs((prev) => {
                            delete prev[key];
                            return { ...prev };
                          });
                        }}
                      />
                    )}
                    <NewFileUploads
                      multiple={false}
                      setUploads={setPersonalDocsReqs}
                      obj={key}
                    />
                  </div>
                ))}
              </div>
            )}
          {/* Supporting Docs */}
          {supportingDocsReqs &&
            currentStep.name === 'Supporting Required Documents' && (
              <div>
                <h3>Upload Supporting Documents</h3>
                {Object.entries(supportingDocsReqs).map(
                  ([key, value], index) => (
                    <div className='col-12 mb-10'>
                      <label className='lh-1 text-16 text-light-1'>{key}</label>
                      {previousSupportingDocReqs && (
                        <PreviousUploadPictures
                          data={[previousSupportingDocReqs[key]]}
                          onDeleteClick={() => {
                            setPreviousSupportingDocReqs((prev) => {
                              delete prev[key];
                              return { ...prev };
                            });
                          }}
                        />
                      )}
                      <NewFileUploads
                        multiple={false}
                        setUploads={setSupportingDocsReqs}
                        obj={key}
                      />
                    </div>
                  )
                )}
              </div>
            )}
          {/* Financial Docs */}
          {financialDocsReqs &&
            currentStep.name === 'Financial Required Documents' && (
              <div>
                <h3>Upload Financial Documents</h3>
                {Object.entries(financialDocsReqs).map(
                  ([key, value], index) => (
                    <div className='col-12 mb-10'>
                      <label className='lh-1 text-16 text-light-1'>{key}</label>
                      {previousFinancialDocReqs && (
                        <PreviousUploadPictures
                          data={[previousFinancialDocReqs[key]]}
                          onDeleteClick={() => {
                            setPreviousFinancialDocReqs((prev) => {
                              delete prev[key];
                              return { ...prev };
                            });
                          }}
                        />
                      )}
                      <NewFileUploads
                        multiple={false}
                        setUploads={setFinancialDocsReqs}
                        obj={key}
                      />
                    </div>
                  )
                )}
              </div>
            )}
          {/* Visa Form Upload */}
          {currentStep.name === 'Visa Forms' && (
            <div>
              <h3>Upload Visa Forms</h3>
              <label>Visa Forms</label><br />
              {visaFormUrls.map((url, idx) => (
                <a className='btn-link' href={url} key={`form-url-${idx}`} target='_blank' download>Download Form #{idx + 1}</a>
              ))}
              {previousVisaFormFiles && (
                <PreviousUploadPictures
                  data={previousVisaFormFiles}
                  onDeleteClick={(element, index) => {
                    setPreviousVisaFormFiles((prev) => {
                      prev.splice(index, 1);
                      return [...prev];
                    });
                  }}
                />
              )}
              {/* <button
                          type='button'
                          onClick={() => {
                            for (let url of previousVisaFormFiles) {
                            }
                          }}
                        >
                          Download
                        </button> */}
              <NewFileUploads multiple={true} setUploads={setVisaFormFiles} />
            </div>
          )}
          <div className='col-12 d-flex justify-between'>
            <div>
              {currentStep && currentStep.step !== 1 && (
                <button
                  type='button'
                  onClick={() =>
                    setCurrentStep((prev) => {
                      if (prev.step > 1) {
                        prev = steps[prev.step - 2];
                      }
                      return { ...prev };
                    })
                  }
                  className='button h-50 px-24 -dark-1 bg-red-1 text-white'
                >
                  Back
                </button>
              )}
            </div>
            {currentStep && currentStep.step < steps.length && (
              <button
                type='button'
                onClick={() =>
                  setCurrentStep((prev) => {
                    if (prev.step + 1 <= steps.length) {
                      prev = steps[prev.step];
                    }
                    return { ...prev };
                  })
                }
                className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
              >
                Next
              </button>
            )}
          </div>
          <div className='d-inline-block'>
            <button
              type='submit'
              className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
            >
              Update Visa Application
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

UpdateVisaApplications.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default UpdateVisaApplications;

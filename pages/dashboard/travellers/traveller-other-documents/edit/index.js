import Seo from '../../../../../components/common/Seo';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getItem } from '../../../../../api/xplorzApi';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import 'file-upload-with-preview/dist/style.css';
import PreviousUploadPictures from '../../../../../components/previous-file-uploads';
import NewFileUploads from '../../../../../components/new-file-uploads';

const UpdateTravellerOtherDocument = () => {
  const [documentName, setDocumentName] = useState('');
  const [documentExpiryDate, setDocumentExpiryDate] = useState(null);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [previousDocuments, setPreviousDocuments] = useState([]);

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
      const response = await getItem('traveller-other-documents', router.query.edit);
      if (response?.success) {
        // Setting previous values
        setDocumentName(response.data?.document_name || '');
        setDocumentExpiryDate(
          response.data?.document_expiry_date
            ? new DateObject({ date: response.data?.document_expiry_date, format: 'YYYY-MM-DD' })
            : null
        );
        if (response.data?.document_file) setPreviousDocuments([response.data?.document_file]);
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
    if (documentFiles.length === 0 && previousDocuments.length === 0) {
      sendToast('error', 'Document file is required.', 4000);
      return;
    }
    const formData = new FormData();
    formData.append('traveller_id', parseInt(router.query.traveller_id));
    formData.append('document_name', documentName);
    if (documentExpiryDate) {
      formData.append('document_expiry_date', documentExpiryDate.format('YYYY-MM-DD'));
    } else {
      formData.append('document_expiry_date', '');
    }

    // Send previous file path if not removed
    if (previousDocuments.length > 0) {
      formData.append('document_file', previousDocuments[0]);
    } else {
      formData.append('document_file', '');
    }

    // Send newly uploaded file if available (overrides previous)
    if (documentFiles.length > 0) {
      formData.append('document_file_scan', documentFiles[0]);
    }

    formData.append('_method', 'PUT');
    const response = await createItem('traveller-other-documents/' + router.query.edit, formData);
    if (response?.success) {
      sendToast('success', 'Updated Document Successfully.', 4000);
      router.push('/dashboard/travellers/view/' + router.query.traveller_id);
    } else {
      sendToast(
        'error',
        response.data?.message ||
        response.data?.error ||
        'Failed to Update Document.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Update Document' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
        <div className='col-12'>
          <h1 className='text-30 lh-14 fw-600'>Update Document</h1>
          <div className='text-15 text-light-1'>
            Update an existing document.
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
                  onChange={(e) => setDocumentName(e.target.value)}
                  value={documentName}
                  placeholder=' '
                  type='text'
                  required
                />
                <label className='lh-1 text-16 text-light-1'>
                  Document Name<span className='text-danger'>*</span>
                </label>
              </div>
            </div>

            <div className='d-block ml-3 form-datepicker'>
              <label>Document Expiry Date</label>
              <DatePicker
                style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                inputClass='custom_input-picker'
                containerClassName='custom_container-picker'
                value={documentExpiryDate}
                onChange={setDocumentExpiryDate}
                numberOfMonths={1}
                offsetY={10}
                format='DD MMMM YYYY'
              />
            </div>

            {/* Document File */}
            <div className='col-lg-6'>
              <label>Document File<span className='text-danger'>*</span></label>{' '}
              {previousDocuments?.length > 0 && (
                <PreviousUploadPictures
                  data={previousDocuments}
                  onDeleteClick={() => {
                    setPreviousDocuments((prev, index) => {
                      prev.splice(index, 1);
                      return [...prev];
                    });
                  }}
                />
              )}
              <NewFileUploads multiple={false} setUploads={setDocumentFiles} />
            </div>

            <div className='col-12 d-inline-block'>
              <button
                type='submit'
                className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
              >
                Update Document
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

UpdateTravellerOtherDocument.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default UpdateTravellerOtherDocument;

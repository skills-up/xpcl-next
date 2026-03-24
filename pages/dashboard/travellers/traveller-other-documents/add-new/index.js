import Seo from '../../../../../components/common/Seo';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem } from '../../../../../api/xplorzApi';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import 'file-upload-with-preview/dist/style.css';
import NewFileUploads from '../../../../../components/new-file-uploads';

const AddNewTravellerOtherDocument = () => {
  const [documentName, setDocumentName] = useState('');
  const [documentExpiryDate, setDocumentExpiryDate] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      if (!router.query.traveller_id) {
        router.push('/dashboard/travellers');
      }
    }
  }, [router.isReady]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!documentFile) {
      sendToast('error', 'Document file is required.', 4000);
      return;
    }
    const formData = new FormData();
    formData.append('traveller_id', parseInt(router.query.traveller_id));
    formData.append('document_name', documentName);
    if (documentExpiryDate) {
      formData.append('document_expiry_date', documentExpiryDate.format('YYYY-MM-DD'));
    }
    if (documentFile) {
      formData.append('document_file_scan', documentFile); // Based on schema, single document file
    }

    const response = await createItem('traveller-other-documents', formData);
    if (response?.success) {
      sendToast('success', 'Created Document Successfully.', 4000);
      router.push('/dashboard/travellers/view/' + router.query.traveller_id);
    } else {
      sendToast(
        'error',
        response.data?.message ||
        response.data?.error ||
        'Failed to Create Document.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Add New Document' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
        <div className='col-12'>
          <h1 className='text-30 lh-14 fw-600'>Add New Document</h1>
          <div className='text-15 text-light-1'>
            Create a new document.
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
              <label>Document File<span className='text-danger'>*</span></label>
              <NewFileUploads multiple={false} setUploads={setDocumentFile} />
            </div>
            <div className='col-12 d-inline-block'>
              <button
                type='submit'
                className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
              >
                Add Document
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

AddNewTravellerOtherDocument.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddNewTravellerOtherDocument;

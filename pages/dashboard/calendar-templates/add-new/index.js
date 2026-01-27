import Seo from '../../../../components/common/Seo';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getList } from '../../../../api/xplorzApi';
import ReactSwitch from 'react-switch';
import Select from 'react-select';
import NewFileUploads from '../../../../components/new-file-uploads';

const AddCalenderTemplate = () => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [summary, setSummary] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    let formData = new FormData();
    formData.append('name', name ?? '');
    formData.append('location', location ?? '');
    formData.append('description', description ?? '');
    formData.append('summary', summary ?? '');
    if (imageFile) formData.append('image_file', imageFile ?? '');
    // Final Call
    const response = await createItem('calendar-templates', formData);
    if (response?.success) {
      sendToast('success', 'Created Calendar Template Successfully.', 4000);
      router.push('/dashboard/calendar-templates');
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Failed to Create Calendar Template.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Add New Calendar Template' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>Add New Calendar Template</h1>
                  <div className='text-15 text-light-1'>
                    Create a new calendar template.
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
                        <textarea
                          rows={2}
                          onChange={(e) => setLocation(e.target.value)}
                          value={location}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Location</label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <textarea
                          rows={3}
                          onChange={(e) => setDescription(e.target.value)}
                          value={description}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Description</label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <textarea
                          rows={3}
                          onChange={(e) => setSummary(e.target.value)}
                          value={summary}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Summary</label>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <label>Upload Image</label>
                      <NewFileUploads
                        multiple={false}
                        fileTypes={['PNG', 'JPG', 'JPEG']}
                        setUploads={setImageFile}
                      />
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Calendar Template
                      </button>
                    </div>
                  </form>
                </div>
                </div>
                </>
  );
};

AddCalenderTemplate.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddCalenderTemplate;

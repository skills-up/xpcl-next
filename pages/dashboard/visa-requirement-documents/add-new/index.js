import Seo from '../../../../components/common/Seo';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getList } from '../../../../api/xplorzApi';
import ReactSwitch from 'react-switch';
import Select from 'react-select';

const AddVisaRequirementDocuments = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(null);
  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  const categoryOptions = [
    { label: 'Personal', value: 'Personal' },
    { label: 'Financial', value: 'Financial' },
    { label: 'Support', value: 'Support' },
  ];

  const onSubmit = async (e) => {
    e.preventDefault();
    if (category?.value) {
      const response = await createItem('visa-requirement-documents', {
        name,
        category: category.value,
      });
      if (response?.success) {
        sendToast('success', 'Created Visa Requirement Document Successfully.', 4000);
        router.push('/dashboard/visa-requirement-documents');
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Failed to Create Visa Requirement Document.',
          4000
        );
      }
    } else {
      sendToast('error', 'You must select a Category', 4000);
    }
  };

  return (
    <>
      <Seo pageTitle='Add New Visa Requirement Document' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>
                    Add New Visa Requirement Document
                  </h1>
                  <div className='text-15 text-light-1'>
                    Create a new visa requirement document.
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
                    <div className='form-input-select'>
                      <label>
                        Select Category<span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={categoryOptions}
                        value={category}
                        placeholder='Search & Select Category (required)'
                        onChange={(id) => setCategory(id)}
                      />
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Visa Requirement Document
                      </button>
                    </div>
                  </form>
                </div>
                </div>
                </>
  );
};

AddVisaRequirementDocuments.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddVisaRequirementDocuments;

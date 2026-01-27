import { useRouter } from 'next/router';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { createItem } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { sendToast } from '../../../../utils/toastify';

const AddCountry = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    // Checking if account id is not null
    const response = await createItem('countries', {
      name,
      code,
    });
    if (response?.success) {
      sendToast('success', 'Created Country Successfully.', 4000);
      router.push('/dashboard/countries');
    } else {
      sendToast(
        'error',
        response.data?.message || response.data?.error || 'Failed to Create Country.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Add New Country' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>Add New Country</h1>
                  <div className='text-15 text-light-1'>Create a new country.</div>
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
                        <input
                          onChange={(e) => setCode(e.target.value)}
                          value={code}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Code<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Country
                      </button>
                    </div>
                  </form>
                </div>
                </div>
                </>
  );
};

AddCountry.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddCountry;

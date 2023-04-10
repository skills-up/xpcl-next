import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { getItem, updateItem } from '../../../../api/xplorzApi';

const EditPermission = () => {
  const [slug, setSlug] = useState('');
  const [desc, setDesc] = useState('');
  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  useEffect(() => {
    // Getting particular permission
    getPermission();
  }, [router.isReady]);

  const getPermission = async () => {
    if (router.query.edit) {
      const response = await getItem('permissions', router.query.edit);
      if (response?.success) {
        setSlug(response.data?.slug);
        setDesc(response.data?.description);
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Could Not Fetch The Requested Permission.'
        );
        router.push('/dashboard/permissions');
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (router.query.edit) {
      if (slug.match(/^[a-z\.\-]+$/)) {
        const response = await updateItem('/permissions', router.query.edit, {
          slug,
          description: desc,
        });
        if (response?.success) {
          sendToast('success', 'Updated Permission Successfully.', 4000);
          router.push('/dashboard/permissions');
        } else {
          sendToast(
            'error',
            response.data?.message ||
              response.data?.error ||
              'Failed to Update Permission.',
            4000
          );
        }
      } else {
        sendToast('error', 'Only lowercase, hyphen (-) and dot (.) are allowed.', 8000);
      }
    }
  };

  return (
    <>
      <Seo pageTitle='Edit Permission' />
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
                  <h1 className='text-30 lh-14 fw-600'>Edit Permission</h1>
                  <div className='text-15 text-light-1'>Edit an existing permission.</div>
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
                          onChange={(e) => setSlug(e.target.value)}
                          value={slug}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Slug<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setDesc(e.target.value)}
                          value={desc}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Description</label>
                      </div>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Update Permission
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

export default EditPermission;

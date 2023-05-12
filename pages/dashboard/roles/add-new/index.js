import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem } from '../../../../api/xplorzApi';
import PermissionSwitch from '../../../../components/permission-switch';

const AddNewRole = () => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    // Checking if its only lower case
    const response = await createItem('roles', {
      name,
      description: desc,
      permission_ids: selectedPermissions,
    });
    if (response?.success) {
      sendToast('success', 'Created Role Successfully.', 4000);
      router.push('/dashboard/roles');
    } else {
      sendToast(
        'error',
        response.data?.message || response.data?.error || 'Failed to Create Role.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Add New Role' />
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
                  <h1 className='text-30 lh-14 fw-600'>Add New Role</h1>
                  <div className='text-15 text-light-1'>Create a new role.</div>
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
                          onChange={(e) => setDesc(e.target.value)}
                          value={desc}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Description</label>
                      </div>
                    </div>
                    <div className='col-lg-auto col-12'>
                      <PermissionSwitch
                        setSelectedPermissions={setSelectedPermissions}
                        errorRedirect={'/dashboard/roles'}
                      />
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Role
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

export default AddNewRole;

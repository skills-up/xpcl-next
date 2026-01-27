import Seo from '../../../../components/common/Seo';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { getItem, updateItem } from '../../../../api/xplorzApi';
import PermissionSwitch from '../../../../components/permission-switch';

const EditRole = () => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  useEffect(() => {
    // Getting particular role
    getRoles();
  }, [router.isReady]);

  const getRoles = async () => {
    if (router.query.edit) {
      const response = await getItem('roles', router.query.edit);
      if (response?.success) {
        setName(response.data?.name);
        setDesc(response.data?.description);
        setRolePermissions(Object.values(response.data?.permissions_list));
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Could Not Fetch The Requested Role.'
        );
        router.push('/dashboard/roles');
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (router.query.edit) {
      const response = await updateItem('roles', router.query.edit, {
        name,
        description: desc,
        permission_ids: selectedPermissions,
      });
      if (response?.success) {
        sendToast('success', 'Updated Role Successfully.', 4000);
        router.push('/dashboard/roles');
      } else {
        sendToast(
          'error',
          response.data?.message || response.data?.error || 'Failed to Update Role.',
          4000
        );
      }
    }
  };

  return (
    <>
      <Seo pageTitle='Edit Role' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>Edit Role</h1>
                  <div className='text-15 text-light-1'>Edit an existing role.</div>
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
                    {rolePermissions?.length > 0 && (
                      <div className='col-lg-auto col-12'>
                        <PermissionSwitch
                          setSelectedPermissions={setSelectedPermissions}
                          errorRedirect={'/dashboard/roles'}
                          presentRoles={rolePermissions}
                        />
                      </div>
                    )}
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Update Role
                      </button>
                    </div>
                  </form>
                </div>
                </div>
                </>
  );
};

EditRole.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditRole;

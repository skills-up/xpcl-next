import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { deleteItem, getItem } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import ConfirmationModal from '../../../../components/confirm-modal';
import PermissionSwitch from '../../../../components/permission-switch';
import ViewTable from '../../../../components/view-table';
import { sendToast } from '../../../../utils/toastify';

const ViewRole = () => {
  const [role, setRole] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  useEffect(() => {
    // Getting particular role
    getRole();
  }, [router.isReady]);

  const getRole = async () => {
    if (router.query.view) {
      const response = await getItem('roles', router.query.view);
      if (response?.success) {
        setRolePermissions(Object.values(response.data?.permissions_list));
        let data = response.data;
        // Converting time columns
        delete data['id'];
        if (data.created_by) {
          data.created_by = (
            <a
              className='text-15 cursor-pointer'
              href={'/dashboard/users/view/' + data.created_by}
            >
              <strong>User #{data.created_by} </strong>[
              {new Date(data.created_at).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
              ]
            </a>
          );
        }
        if (data.updated_by) {
          data.updated_by = (
            <a
              className='text-15 cursor-pointer'
              href={'/dashboard/users/view/' + data.updated_by}
            >
              <strong>User #{data.updated_by} </strong>[
              {new Date(data.updated_at).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
              ]
            </a>
          );
        }
        delete data['created_at'];
        delete data['updated_at'];
        if (data.user_names) {
          data.user_names = (
            <ul className='ml-20'>
              {Object.keys(data.user_names).map((user, index) => (
                <li style={{ listStyleType: 'disc' }} key={index}>
                  <a
                    className='text-15 cursor-pointer'
                    href={'/dashboard/users/view/' + user}
                  >
                    {data.user_names[user]}
                  </a>
                </li>
              ))}
            </ul>
          );
        }
        delete data['permissions_list'];
        setRole(data);
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

  const onCancel = async () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };
  const onSubmit = async () => {
    const response = await deleteItem('roles', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      router.push('/dashboard/roles');
    } else {
      sendToast(
        'error',
        response.data?.message ||
        response.data?.error ||
        'Unexpected Error Occurred While Trying to Delete this Role',
        4000
      );
    }
    onCancel();
  };

  return (
    <>
      <Seo pageTitle='View Role' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
        <div className='col-12'>
          <h1 className='text-30 lh-14 fw-600'>View Role</h1>
          <div className='text-15 text-light-1'>
            Get extended details of a role.
          </div>
        </div>
        {/* End .col-12 */}
      </div>
      {/* End .row */}

      <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
        {confirmDelete && (
          <ConfirmationModal
            onCancel={onCancel}
            onSubmit={onSubmit}
            title='Do you really want to delete this role?'
            content='This will permanently delete the role. Press OK to confirm.'
          />
        )}
        <ViewTable
          data={role}
          onEdit={() => router.push('/dashboard/roles/edit/' + router.query.view)}
          onDelete={() => {
            setIdToDelete(router.query.view);
            setConfirmDelete(true);
          }}
          entitySlug={'roles'}
        />
        {rolePermissions?.length && (
          <PermissionSwitch
            setSelectedPermissions={setSelectedPermissions}
            errorRedirect={'/dashboard/roles'}
            presentRoles={rolePermissions}
            readOnly
          />
        )}
      </div>
    </>
  );
};

ViewRole.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default ViewRole;

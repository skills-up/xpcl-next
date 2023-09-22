import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import ConfirmationModal from '../../../../components/confirm-modal';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { deleteItem, getItem } from '../../../../api/xplorzApi';
import ViewTable from '../../../../components/view-table';

const ViewPermission = () => {
  const [permission, setPermission] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  useEffect(() => {
    // Getting particular permission
    getPermission();
  }, [router.isReady]);

  const getPermission = async () => {
    if (router.query.view) {
      const response = await getItem('permissions', router.query.view);
      if (response?.success) {
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
              {new Date(data.created_at).toLocaleString('en-AE', {
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
              {new Date(data.updated_at).toLocaleString('en-AE', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
              ]
            </a>
          );
        }
        delete data['created_at'];
        delete data['updated_at'];
        if (data.role_names) {
          data.role_names = (
            <ul className='ml-20'>
              {Object.keys(data.role_names).map((role, index) => (
                <li style={{ listStyleType: 'disc' }} key={index}>
                  <a
                    className='text-15 cursor-pointer'
                    href={'/dashboard/roles/view/' + role}
                  >
                    {data.role_names[role]}
                  </a>
                </li>
              ))}
            </ul>
          );
        }
        setPermission(data);
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

  const onCancel = async () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };

  const onSubmit = async () => {
    const response = await deleteItem('permissions', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      router.push('/dashboard/permissions');
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Permission',
        4000
      );
    }
    onCancel();
  };

  return (
    <>
      <Seo pageTitle='View Permission' />
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
                  <h1 className='text-30 lh-14 fw-600'>View Permission</h1>
                  <div className='text-15 text-light-1'>
                    Get extended details of a permission.
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
                    title='Do you really want to delete this permission?'
                    content='This will permanently delete the permission. Press OK to confirm.'
                  />
                )}
                <ViewTable
                  data={permission}
                  onEdit={() =>
                    router.push('/dashboard/permissions/edit/' + router.query.view)
                  }
                  onDelete={() => {
                    setIdToDelete(router.query.view);
                    setConfirmDelete(true);
                  }}
                />
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

export default ViewPermission;

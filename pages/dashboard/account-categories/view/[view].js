import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { deleteItem, getItem } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import ConfirmationModal from '../../../../components/confirm-modal';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import ViewTable from '../../../../components/view-table';
import { sendToast } from '../../../../utils/toastify';

const ViewAccountCategories = () => {
  const [accountCategory, setAccountCategory] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  useEffect(() => {
    // Getting particular account category
    getAccountCategory();
  }, [router.isReady]);

  const getAccountCategory = async () => {
    if (router.query.view) {
      const response = await getItem('account-categories', router.query.view);
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
        if (data?.parent_category_name && data?.parent_category_id) {
          data.parent_category_name = (
            <a href={'/dashboard/account-categories/view/' + data.parent_category_id}>
              {data.parent_category_name}
            </a>
          );
        }
        delete data['parent_category_id'];
        data.child_categories = (
          <ul className='ml-20'>
            {Object.values(data.child_categories).map((cat, index) => (
              <li style={{ listStyleType: 'disc' }} key={index}>
                <a
                  href={`/dashboard/account-categories/view/${cat.id}`}
                  className='text-15 cursor-pointer'
                >
                  {cat?.name}
                </a>
              </li>
            ))}
          </ul>
        );
        data.accounts = (
          <ul className='ml-20'>
            {Object.values(data.accounts).map((acc, index) => (
              <li style={{ listStyleType: 'disc' }} key={index}>
                <a
                  href={`/dashboard/accounts/view/${acc.id}`}
                  className='text-15 cursor-pointer'
                >
                  {acc?.name} {acc?.year ? '- ' + acc.year : ''}
                </a>
              </li>
            ))}
          </ul>
        );
        setAccountCategory(data);
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Could Not Fetch The Requested Account Category.'
        );
        router.push('/dashboard/account-categories');
      }
    }
  };

  const onCancel = async () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };
  const onSubmit = async () => {
    const response = await deleteItem('account-categories', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      router.push('/dashboard/account-categories');
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Account Category',
        4000
      );
    }
    onCancel();
  };

  return (
    <>
      <Seo pageTitle='View Account Category' />
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
                  <h1 className='text-30 lh-14 fw-600'>View Account Category</h1>
                  <div className='text-15 text-light-1'>
                    Get extended details of an account category.
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
                    title='Do you really want to delete this account category?'
                    content='This will permanently delete the account category. Press OK to confirm.'
                  />
                )}
                <ViewTable
                  data={accountCategory}
                  onEdit={() =>
                    router.push('/dashboard/account-categories/edit/' + router.query.view)
                  }
                  onDelete={() => {
                    setIdToDelete(router.query.view);
                    setConfirmDelete(true);
                  }}
                  entitySlug={'account-categories'}
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

export default ViewAccountCategories;

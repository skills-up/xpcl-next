import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { deleteItem, getItem } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import ConfirmationModal from '../../../../components/confirm-modal';
import ViewTable from '../../../../components/view-table';
import { hasPermission } from '../../../../utils/permission-checker';
import { sendToast } from '../../../../utils/toastify';
import ClosingBalances from './ClosingBalances';

const ViewAccounts = () => {
  const [account, setAccount] = useState([]);
  const [accountClosingBalances, setAccountClosingBalances] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  useEffect(() => {
    // Getting particular account
    getAccount();
  }, [router.isReady]);

  const getAccount = async () => {
    if (router.query.view) {
      const response = await getItem('accounts', router.query.view);
      if (response?.success) {
        setAccountClosingBalances(response.data?.closing_balances);
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
        data.year = data.year || 'N/A';
        delete data['created_at'];
        delete data['updated_at'];
        if (data?.account_category_name && data?.account_category_id) {
          data.account_category_name = (
            <a href={'/dashboard/account-categories/view/' + data.account_category_id}>
              {data.account_category_name}
            </a>
          );
        }
        delete data['account_category_id'];
        if (data.account_category) {
          delete data['account_category'];
        }
        if (data.closing_balances) delete data['closing_balances'];
        setAccount(data);
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Could Not Fetch The Requested Account.'
        );
        router.push('/dashboard/accounts');
      }
    }
  };

  const onCancel = async () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };
  const onSubmit = async () => {
    const response = await deleteItem('accounts', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      router.push('/dashboard/accounts');
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Account',
        4000
      );
    }
    onCancel();
  };

  return (
    <>
      <Seo pageTitle='View Account' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>View Account</h1>
                  <div className='text-15 text-light-1'>
                    Get extended details of an account.
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
                    title='Do you really want to delete this account?'
                    content='This will permanently delete the account. Press OK to confirm.'
                  />
                )}
                <ViewTable
                  data={account}
                  onEdit={() =>
                    router.push('/dashboard/accounts/edit/' + router.query.view)
                  }
                  onDelete={() => {
                    setIdToDelete(router.query.view);
                    setConfirmDelete(true);
                  }}
                  entitySlug={'accounts'}
                />
                <hr className='my-4' />
                <div>
                  <div className='mb-3 d-flex items-center justify-between'>
                    <h2>Closing Balances</h2>
                    {hasPermission('accounts.close') && (
                      <button
                        className='btn btn-primary col-lg-2 col-5'
                        onClick={() =>
                          router.push({
                            pathname: '/dashboard/accounts/closing-balances/add-new',
                            query: { account_id: router.query.view },
                          })
                        }
                      >
                        Add New
                      </button>
                    )}
                  </div>
                  <ClosingBalances accountClosingBalances={accountClosingBalances} />
                </div>
              </div>
            </>
  );
};

ViewAccounts.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default ViewAccounts;

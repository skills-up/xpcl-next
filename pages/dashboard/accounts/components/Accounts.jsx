import { useEffect, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import { BsTrash3 } from 'react-icons/bs';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { IoCopyOutline } from 'react-icons/io5';
import { deleteItem, getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import ConfirmationModal from '../../../../components/confirm-modal';
import Datatable from '../../../../components/datatable/ServerDatatable';
import { filterAllowed, hasPermission } from '../../../../utils/permission-checker';
import { sendToast } from '../../../../utils/toastify';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const [pageSize, setPageSize] = useState(10);
  const [accountCategories, setAccountCategories] = useState([]);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    getAccounts();
  }, [debouncedSearchQuery, pageSize]);

  useEffect(()=>{
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // delay in ms

    return () => {
      clearTimeout(handler); // cleanup when value changes
    };
  },[searchQuery])

  const getAccounts = async () => {
    if (accountCategories.length === 0) {
      const response = await getList('account-categories');
      if (response?.success) {
        setAccountCategories(response.data);
      } else {
        sendToast(
          'error',
          response?.data?.message || response?.data?.error || 'Error getting account categories',
          4000
        )
      }
    }
    const response = await getList('accounts', {search: debouncedSearchQuery || null, paginate: pageSize, fields: ['name','year','account_category_id','updated_at']});
    if (response?.success) {
      setAccounts(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting accounts',
        4000
      );
    }
  };

  const columns = [
    {
      Header: 'Name',
      accessor: 'name',
    },
    {
      Header: 'Year',
      accessor: 'year',
      Cell: (data) => {
        return (
          <div>
            {data.row.original.year || 'N/A'}
          </div>
        );
      }
    },
    {
      Header: 'Account Category',
      accessor: 'account_category_id',
      Cell: (data) => {
        return (
          <div>
            {accountCategories[data.row.original.account_category_id]?.name}
          </div>
        )
      }
    },
    {
      Header: 'Last Updated At',
      accessor: 'updated_at',
      Cell: (data) => {
        return (
          <div>
            {data.row.original.updated_at
              ? new Date(data.row.original.updated_at).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : ''}
          </div>
        );
      },
    },
    {
      Header: 'Actions',
      disableSortBy: true,
      alignRight: true,
      // cell: () => <Button variant="danger" data-tag="allowRowEvents" data-action="delete"><FontAwesomeIcon icon={faTrash} /></Button>,
      Cell: (data) => {
        return (
          <div className='d-flex justify-end'>
            <ActionsButton
              options={filterAllowed([
                {
                  label: 'View',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/accounts/view/' + data.row.original.id
                    ),
                  icon: <AiOutlineEye />,
                  permissions: ['accounts.show'],
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/accounts/edit/' + data.row.original.id
                    ),
                  icon: <HiOutlinePencilAlt />,
                  permissions: ['accounts.update'],
                },
                {
                  label: 'Clone',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/accounts/clone/' + data.row.original.id
                    ),
                  icon: <IoCopyOutline />,
                  permissions: ['accounts.store'],
                },
                {
                  label: 'Delete',
                  onClick: () => {
                    setIdToDelete(data.row.original.id);
                    setConfirmDelete(true);
                  },
                  icon: <BsTrash3 />,
                  permissions: ['accounts.destroy'],
                },
              ])}
            />
          </div>
        );
      },
    },
  ];

  const onCancel = async () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };
  const onSubmit = async () => {
    const response = await deleteItem('accounts', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getAccounts();
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
    <div className='col-12'>
      {confirmDelete && (
        <ConfirmationModal
          onCancel={onCancel}
          onSubmit={onSubmit}
          title='Do you really want to delete this account?'
          content='This will permanently delete the account. Press OK to confirm.'
        />
      )}
      {/* Search Bar + Add New */}
      <div className='row mb-3 items-center justify-between mr-4'>
        <div className='col-lg-10 col-7'>
          <input
            type='text'
            className='d-block form-control'
            placeholder='Search'
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
        </div>
        {hasPermission('accounts.store') && (
          <button
            className='btn btn-primary col-lg-2 col-5'
            onClick={() => window.location.assign('/dashboard/accounts/add-new')}
          >
            Add New
          </button>
        )}
      </div>
      {/* Data Table */}
      <Datatable
        onPageSizeChange={(size) => setPageSize(size)}
        viewLink={'/dashboard/accounts'}
        downloadCSV
        CSVName='Accounts.csv'
        columns={columns}
        fullData={accounts}
        data={accounts?.data?.filter((perm) =>
          Object.values(perm).join(',').toLowerCase().includes(searchQuery.toLowerCase())
        ) || []}
      />
    </div>
  );
};

export default Accounts;

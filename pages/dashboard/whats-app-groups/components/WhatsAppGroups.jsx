import { useEffect, useMemo, useState } from 'react';
import { BsTrash3 } from 'react-icons/bs';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { deleteItem, getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import ConfirmationModal from '../../../../components/confirm-modal';
import Datatable from '../../../../components/datatable/Datatable';
import { filterAllowed, hasPermission } from '../../../../utils/permission-checker';
import { sendToast } from '../../../../utils/toastify';

const WhatsAppGroups = () => {
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const response = await getList('whats-app-groups');
    if (response?.success) {
      setGroups(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting WhatsApp groups',
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
      Header: 'Group For',
      accessor: 'group_for',
    },
    {
      Header: 'Phone Numbers',
      accessor: 'phone_numbers',
      Cell: (data) => {
        const numbers = Array.isArray(data.row.original.phone_numbers)
          ? data.row.original.phone_numbers
          : [];
        return <div>{numbers.join(', ')}</div>;
      },
    },
    {
      Header: 'Invite Link',
      accessor: 'invite_link',
      Cell: (data) =>
        data.row.original.invite_link ? (
          <a href={data.row.original.invite_link} target='_blank' rel='noreferrer'>
            {data.row.original.invite_link}
          </a>
        ) : (
          ''
        ),
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
      Cell: (data) => {
        return (
          <div className='d-flex justify-end'>
            <ActionsButton
              options={filterAllowed([
                {
                  label: 'Edit',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/whats-app-groups/edit/' + data.row.original.id
                    ),
                  icon: <HiOutlinePencilAlt />,
                  permissions: ['whats-app-groups.update'],
                },
                {
                  label: 'Delete',
                  onClick: () => {
                    setIdToDelete(data.row.original.id);
                    setConfirmDelete(true);
                  },
                  icon: <BsTrash3 />,
                  permissions: ['whats-app-groups.destroy'],
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
    const response = await deleteItem('whats-app-groups', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getData();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this WhatsApp group',
        4000
      );
    }
    onCancel();
  };

  const filteredGroups = useMemo(
    () =>
      groups.filter((group) =>
        Object.values(group)
          .join(',')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [groups, searchQuery]
  );

  return (
    <div className='col-12'>
      {confirmDelete && (
        <ConfirmationModal
          onCancel={onCancel}
          onSubmit={onSubmit}
          title='Do you really want to delete this WhatsApp group?'
          content='This will permanently delete the WhatsApp group. Press OK to confirm.'
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
        {hasPermission('whats-app-groups.store') && (
          <button
            className='btn btn-primary col-lg-2 col-5'
            onClick={() => window.location.assign('/dashboard/whats-app-groups/add-new')}
          >
            Add New
          </button>
        )}
      </div>
      {/* Data Table */}
      <Datatable
        viewLink={'/dashboard/whats-app-groups'}
        downloadCSV
        CSVName='WhatsAppGroups.csv'
        columns={columns}
        data={filteredGroups}
      />
    </div>
  );
};

export default WhatsAppGroups;

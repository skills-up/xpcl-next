import { useState, useEffect } from 'react';
import { deleteItem, getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import Datatable from '../../../../components/datatable/Datatable';
import { sendToast } from '../../../../utils/toastify';
import ConfirmationModal from '../../../../components/confirm-modal';
import { AiOutlineEye } from 'react-icons/ai';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { BsTrash3 } from 'react-icons/bs';
import { IoCopyOutline } from 'react-icons/io5';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  useEffect(() => {
    getRoles();
  }, []);

  const getRoles = async () => {
    const response = await getList('roles');
    if (response?.success) {
      setRoles(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting roles',
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
      Header: 'Description',
      accessor: 'description',
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
      // cell: () => <Button variant="danger" data-tag="allowRowEvents" data-action="delete"><FontAwesomeIcon icon={faTrash} /></Button>,
      Cell: (data) => {
        return (
          <div className='flex flex-start'>
            <ActionsButton
              options={[
                {
                  label: 'View',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/roles/view/' + data.row.original.id
                    ),
                  icon: <AiOutlineEye />,
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/roles/edit/' + data.row.original.id
                    ),
                  icon: <HiOutlinePencilAlt />,
                },
                {
                  label: 'Clone',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/roles/clone/' + data.row.original.id
                    ),
                  icon: <IoCopyOutline />,
                },
                {
                  label: 'Delete',
                  onClick: () => {
                    setIdToDelete(data.row.original.id);
                    setConfirmDelete(true);
                  },
                  icon: <BsTrash3 />,
                },
              ]}
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
    const response = await deleteItem('roles', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getRoles();
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
    <div className='col-12'>
      {confirmDelete && (
        <ConfirmationModal
          onCancel={onCancel}
          onSubmit={onSubmit}
          title='Do you really want to delete this role?'
          content='This will permanently delete the role. Press OK to confirm.'
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
        <button
          className='btn btn-primary col-lg-2 col-5'
          onClick={() => window.location.assign('/dashboard/roles/add-new')}
        >
          Add New
        </button>
      </div>
      {/* Data Table */}
      <Datatable
        downloadCSV
        CSVName='Roles.csv'
        columns={columns}
        data={roles.filter((perm) =>
          perm.name.toLowerCase().includes(searchQuery.toLowerCase())
        )}
      />
    </div>
  );
};

export default Roles;

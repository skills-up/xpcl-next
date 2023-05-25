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
import { Router, useRouter } from 'next/router';

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  useEffect(() => {
    getOrganizations();
  }, []);

  const router = useRouter();

  const getOrganizations = async () => {
    const response = await getList('organizations');
    if (response?.success) {
      setOrganizations(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting organizations',
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
      Header: 'Address',
      accessor: 'address',
    },
    {
      Header: 'Code',
      accessor: 'code',
    },
    {
      Header: 'Contact Name',
      accessor: 'contact_name',
    },
    {
      Header: 'Contact Email',
      accessor: 'contact_email',
    },
    {
      Header: 'GSTN',
      accessor: 'gstn',
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
              options={[
                {
                  label: 'View',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/organizations/view/' + data.row.original.id
                    ),
                  icon: <AiOutlineEye />,
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/organizations/edit/' + data.row.original.id
                    ),
                  icon: <HiOutlinePencilAlt />,
                },
                {
                  label: 'Clone',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/organizations/clone/' + data.row.original.id
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
    const response = await deleteItem('organizations', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      sessionStorage.removeItem('client-organizations-checked');
      router.reload();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Organization',
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
          title='Do you really want to delete this organization?'
          content='This will permanently delete the organization. Press OK to confirm.'
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
          onClick={() => window.location.assign('/dashboard/organizations/add-new')}
        >
          Add New
        </button>
      </div>
      {/* Data Table */}
      <Datatable
        downloadCSV
        CSVName='Organizations.csv'
        columns={columns}
        data={organizations.filter(
          (perm) =>
            perm?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            perm?.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            perm?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            perm?.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            perm?.contact_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            perm?.gstn?.toLowerCase().includes(searchQuery.toLowerCase())
        )}
      />
    </div>
  );
};

export default Organizations;

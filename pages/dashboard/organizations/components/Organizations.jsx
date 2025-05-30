import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import { BsTrash3 } from 'react-icons/bs';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { IoCopyOutline } from 'react-icons/io5';
import Select from 'react-select';
import { deleteItem, getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import ConfirmationModal from '../../../../components/confirm-modal';
import Datatable from '../../../../components/datatable/Datatable';
import { filterAllowed, hasPermission } from '../../../../utils/permission-checker';
import { sendToast } from '../../../../utils/toastify';

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const [organizationID, setOrganizationID] = useState({ label: 'All', value: 'all' });

  useEffect(() => {
    getOrganizations();
  }, []);

  const router = useRouter();
  const organizationOptions = [
    { label: 'All', value: 'All' },
    { label: 'Airline', value: 'Airline' },
    { label: 'Client', value: 'Client' },
    { label: 'Hotel', value: 'Hotel' },
    { label: 'Vendor', value: 'Vendor' },
  ];

  const getOrganizations = async () => {
    let data = {};
    const response = await getList('organizations', data);
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
      Header: 'Contact Phone',
      accessor: 'contact_phone',
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
              options={filterAllowed([
                {
                  label: 'View',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/organizations/view/' + data.row.original.id
                    ),
                  icon: <AiOutlineEye />,
                  permissions: ['organizations.show'],
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/organizations/edit/' + data.row.original.id
                    ),
                  icon: <HiOutlinePencilAlt />,
                  permissions: ['organizations.update'],
                },
                {
                  label: 'Clone',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/organizations/clone/' + data.row.original.id
                    ),
                  icon: <IoCopyOutline />,
                  permissions: ['organizations.store'],
                },
                {
                  label: 'Delete',
                  onClick: () => {
                    setIdToDelete(data.row.original.id);
                    setConfirmDelete(true);
                  },
                  icon: <BsTrash3 />,
                  permissions: ['organizations.destroy'],
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
      <div className='row y-gap-20 mb-3 items-center justify-between mr-4'>
        <div className='col-lg-6 col-7'>
          <input
            type='text'
            className='d-block form-control'
            placeholder='Search'
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
        </div>
        {hasPermission('organizations.store') && (
          <button
            className='btn btn-primary col-lg-2 col-5'
            onClick={() => window.location.assign('/dashboard/organizations/add-new')}
          >
            Add New
          </button>
        )}
        <div className='col-lg-4 pr-0'>
          <div className='form-input-select'>
            <label>Filter Organization Type</label>
            <Select
              options={organizationOptions}
              value={organizationID}
              placeholder='Search..'
              onChange={(id) => setOrganizationID(id)}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <Datatable
        viewLink={'/dashboard/organizations'}
        downloadCSV
        CSVName='Organizations.csv'
        columns={columns}
        data={organizations
          .filter((perm) => {
            if (organizationID?.value) {
              if (organizationID.label !== 'All') {
                if (perm.type === organizationID.label) {
                  return perm;
                }
              } else {
                return perm;
              }
            } else {
              return perm;
            }
          })
          .filter((perm) =>
            Object.values(perm)
              .join(',')
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )}
      />
    </div>
  );
};

export default Organizations;

import { useEffect, useMemo, useState } from 'react';
import { BsTrash3 } from 'react-icons/bs';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { deleteItem, getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import ConfirmationModal from '../../../../components/confirm-modal';
import Datatable from '../../../../components/datatable/Datatable';
import { filterAllowed, hasPermission } from '../../../../utils/permission-checker';
import { sendToast } from '../../../../utils/toastify';

// Convert camelCase to Title Case
const toTitleCase = (str) => {
  if (!str) return '';
  // Insert space before uppercase letters and capitalize first letter of each word
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
};

const AgentFeatureFlags = () => {
  const [flags, setFlags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const response = await getList('agent-feature-flags');
    if (response?.success) {
      setFlags(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting agent feature flags',
        4000
      );
    }
  };

  const columns = [
    {
      Header: 'Name',
      accessor: 'name',
      Cell: (data) => <div>{toTitleCase(data.row.original.name)}</div>,
    },
    {
      Header: 'Enabled',
      accessor: 'enabled',
      Cell: (data) => (
        <div>
          <span
            className={`badge ${
              data.row.original.enabled ? 'bg-success' : 'bg-secondary'
            }`}
          >
            {data.row.original.enabled ? 'Yes' : 'No'}
          </span>
        </div>
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
                      '/dashboard/agent-feature-flags/edit/' + data.row.original.id
                    ),
                  icon: <HiOutlinePencilAlt />,
                  permissions: ['agent-feature-flags.update'],
                },
                {
                  label: 'Delete',
                  onClick: () => {
                    setIdToDelete(data.row.original.id);
                    setConfirmDelete(true);
                  },
                  icon: <BsTrash3 />,
                  permissions: ['agent-feature-flags.destroy'],
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
    const response = await deleteItem('agent-feature-flags', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getData();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Feature Flag',
        4000
      );
    }
    onCancel();
  };

  const filteredFlags = useMemo(
    () =>
      flags.filter((flag) =>
        Object.values(flag)
          .join(',')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [flags, searchQuery]
  );

  return (
    <div className='col-12'>
      {confirmDelete && (
        <ConfirmationModal
          onCancel={onCancel}
          onSubmit={onSubmit}
          title='Do you really want to delete this feature flag?'
          content='This will permanently delete the feature flag. Press OK to confirm.'
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
        {hasPermission('agent-feature-flags.store') && (
          <button
            className='btn btn-primary col-lg-2 col-5'
            onClick={() => window.location.assign('/dashboard/agent-feature-flags/add-new')}
          >
            Add New
          </button>
        )}
      </div>
      {/* Data Table */}
      <Datatable
        viewLink={'/dashboard/agent-feature-flags'}
        downloadCSV
        CSVName='AgentFeatureFlags.csv'
        columns={columns}
        data={filteredFlags}
      />
    </div>
  );
};

export default AgentFeatureFlags;

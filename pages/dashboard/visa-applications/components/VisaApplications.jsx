import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import { BsTrash3 } from 'react-icons/bs';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import Select from 'react-select';
import { deleteItem, getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import ConfirmationModal from '../../../../components/confirm-modal';
import Datatable from '../../../../components/datatable/Datatable';
import { filterAllowed, hasPermission } from '../../../../utils/permission-checker';
import { sendToast } from '../../../../utils/toastify';

const VisaApplications = () => {
  const searchParams = useSearchParams();
  const queryStatus = searchParams.get('status');
  const [visaApplications, setVisaApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const [status, setStatus] = useState(null);

  const statusOptions = [
    { value: '', label: 'Any Status' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Query', label: 'Query' },
    { value: 'Replied', label: 'Replied' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Processed', label: 'Processed' },
  ];

  useEffect(() => {
    getVisaApplications();
  }, []);

  useEffect(() => {
    if (queryStatus) {
      setStatus({ value: queryStatus, label: queryStatus });
    }
  }, [queryStatus]);

  const getVisaApplications = async () => {
    const response = await getList('visa-applications');
    if (response?.success) {
      setVisaApplications(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message ||
          response?.data?.error ||
          'Error getting visa applications',
        4000
      );
    }
  };

  const columns = [
    {
      Header: 'Country',
      accessor: 'visa_requirement.country_name',
    },
    // {
    //   Header: 'Purpose',
    //   accessor: 'business_travel',
    //   Cell: (data) => (data.row.original.business_travel ? 'Business' : 'Tourist'),
    // },
    {
      Header: 'Status',
      accessor: 'status',
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
                      '/dashboard/visa-applications/view/' + data.row.original.id
                    ),
                  icon: <AiOutlineEye />,
                  permissions: ['visa-applications.show'],
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/visa-applications/edit/' + data.row.original.id
                    ),
                  icon: <HiOutlinePencilAlt />,
                  permissions: ['visa-applications.update'],
                },
                {
                  label: 'Delete',
                  onClick: () => {
                    setIdToDelete(data.row.original.id);
                    setConfirmDelete(true);
                  },
                  icon: <BsTrash3 />,
                  permissions: ['visa-applications.destroy'],
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
    const response = await deleteItem('visa-applications', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getVisaApplications();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Visa application',
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
          title='Do you really want to delete this visa applications?'
          content='This will permanently delete the visa applications. Press OK to confirm.'
        />
      )}
      {/* Search Bar + Add New */}
      <div className='row mb-3 items-center y-gap-20 justify-between mr-4'>
        <div className='col-lg-6'>
          <input
            type='text'
            className='d-block form-control'
            placeholder='Search'
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
        </div>
        <div className='col-lg-4'>
          <Select options={statusOptions} value={status} onChange={setStatus} />
        </div>
        <div className='col-lg-2'>
          {hasPermission('visa-applications.store') && (
            <button
              className='btn btn-primary col-12 h-40'
              onClick={() =>
                window.location.assign('/dashboard/visa-applications/add-new')
              }
            >
              Add New
            </button>
          )}
        </div>
      </div>
      {/* Data Table */}
      <Datatable
        viewLink={'/dashboard/visa-applications'}
        downloadCSV
        CSVName='VisaApplications.csv'
        columns={columns}
        data={visaApplications.filter(
          (perm) =>
            (!status?.value || perm?.status == status.value) &&
            Object.values(perm)
              .join(',')
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        )}
      />
    </div>
  );
};

export default VisaApplications;

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
import Select from 'react-select';
import { useSearchParams } from 'next/navigation';

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
              options={[
                {
                  label: 'View',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/visa-applications/view/' + data.row.original.id
                    ),
                  icon: <AiOutlineEye />,
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/visa-applications/edit/' + data.row.original.id
                    ),
                  icon: <HiOutlinePencilAlt />,
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
      <div className='row mb-3 items-center justify-between mr-4'>
        <div className='col-3 col-lg-6'>
          <input
            type='text'
            className='d-block form-control'
            placeholder='Search'
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
        </div>
        <div className='col-4'>
          <Select options={statusOptions} value={status} onChange={setStatus} />
        </div>
        <button
          className='btn btn-primary col-lg-2 col-5'
          onClick={() => window.location.assign('/dashboard/visa-applications/add-new')}
        >
          Add New
        </button>
      </div>
      {/* Data Table */}
      <Datatable
        downloadCSV
        CSVName='VisaApplications.csv'
        columns={columns}
        data={visaApplications.filter(
          (perm) =>
            (!status?.value || perm?.status == status.value) &&
            (perm?.visa_requirement?.country_name
              ?.toString()
              ?.toLowerCase()
              ?.includes(searchQuery.toLowerCase()) ||
              perm?.status
                ?.toString()
                ?.toLowerCase()
                ?.includes(searchQuery.toLowerCase()))
        )}
      />
    </div>
  );
};

export default VisaApplications;

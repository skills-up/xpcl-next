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
import { useRouter } from 'next/router';

const Refunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const [orgs, setOrgs] = useState([]);

  const router = useRouter();
  useEffect(() => {
    getRefunds();
  }, []);

  const getRefunds = async () => {
    const response = await getList('refunds');
    const orgs = await getList('organizations');

    if (response?.success && orgs?.success) {
      setRefunds(response.data.reverse());
      setOrgs(orgs.data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting refunds',
        4000
      );
    }
  };

  const columns = [
    {
      Header: 'Refund Date',
      accessor: 'refund_date',
    },
    {
      Header: 'Number',
      accessor: 'number',
    },
    {
      Header: 'Sector',
      accessor: 'booking.sector',
    },
    {
      Header: 'Client Name',
      accessor: 'booking.client_name',
    },
    {
      Header: 'Traveller Name',
      accessor: 'booking.client_traveller_name',

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
                    router.push('/dashboard/refunds/view/' + data.row.original.id),
                  icon: <AiOutlineEye />,
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    router.push('/dashboard/refunds/edit/' + data.row.original.id),
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
    const response = await deleteItem('refunds', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getRefunds();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Refund',
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
          title='Do you really want to delete this refund?'
          content='This will permanently delete the refund. Press OK to confirm.'
        />
      )}
      {/* Search Bar + Add New */}
      <div className='row mb-3 items-center justify-between mr-4'>
        <div className='col-12'>
          <input
            type='text'
            className='d-block form-control'
            placeholder='Search'
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
        </div>
      </div>
      {/* Data Table */}
      <Datatable
        viewLink={'/dashboard/refunds'}
        downloadCSV
        CSVName='Refunds.csv'
        columns={columns}
        data={refunds.filter((perm) =>
          Object.values(perm).join(',').toLowerCase().includes(searchQuery.toLowerCase())
        )}
      />
    </div>
  );
};

export default Refunds;

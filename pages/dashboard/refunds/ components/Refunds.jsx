import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import { BsTrash3 } from 'react-icons/bs';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { deleteItem, getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import ConfirmationModal from '../../../../components/confirm-modal';
import Datatable from '../../../../components/datatable/ServerDatatable';
import { sendToast } from '../../../../utils/toastify';

const Refunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const [pageSize, setPageSize] = useState(10);

  const router = useRouter();

  useEffect(() => {
    getRefunds();
  }, [pageSize]);

  const getRefunds = async (paginate = false, pageNumber) => {
    const data = {
      paginate: pageSize,
    };
    if (paginate) {
      data.page = pageNumber;
    }
    const response = await getList('refunds', data);
    if (response?.success) {
      setRefunds(response.data);
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
        onPageSizeChange={(size) => setPageSize(size)}
        viewLink={'/dashboard/refunds'}
        downloadCSV
        CSVName='Refunds.csv'
        columns={columns}
        onPaginate={getRefunds}
        fullData={refunds}
        data={
          refunds?.data?.filter((perm) =>
            Object.values(perm)
              .join(',')
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          ) || []
        }
      />
    </div>
  );
};

export default Refunds;

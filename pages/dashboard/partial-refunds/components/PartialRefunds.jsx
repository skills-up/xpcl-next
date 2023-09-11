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

const PartialRefunds = () => {
  const [partialRefunds, setPartialRefunds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const [orgs, setOrgs] = useState([]);

  const router = useRouter();
  useEffect(() => {
    if (router.isReady) getPartialRefunds();
  }, []);

  const getPartialRefunds = async () => {
    const response = await getList('partial-refunds');
    const orgs = await getList('organizations');
    if (response?.success && orgs?.success) {
      setPartialRefunds(response.data.reverse());
      setOrgs(orgs.data);
    } else {
      sendToast(
        'error',
        response?.data?.message ||
          response?.data?.error ||
          'Error getting partial refunds',
        4000
      );
    }
  };

  const columns = [
    {
      Header: 'Number',
      accessor: 'number',
    },
    {
      Header: 'Comment',
      accessor: 'reason',
    },
    {
      Header: 'Sector',
      accessor: 'booking.sector',
    },
    {
      Header: 'Client Name',
      Cell: (data) => {
        return (
          <span>
            {orgs
              ?.filter((el) => el.id === data.row.original.booking.client_id)
              ?.map((el) => `${el.name}`)}
          </span>
        );
      },
    },
    {
      Header: 'Refund Amount',
      Cell: (data) => {
        return (
          <span>
            {(+data.row.original.refund_amount)?.toLocaleString('en-IN', {
              maximumFractionDigits: 2,
              style: 'currency',
              currency: 'INR',
            })}
          </span>
        );
      },
    },
    {
      Header: 'Refund Date',
      accessor: 'refund_date',
    },
    {
      Header: 'Client Total',
      Cell: (data) => {
        return (
          <span>
            {(+data.row.original.client_total)?.toLocaleString('en-IN', {
              maximumFractionDigits: 2,
              style: 'currency',
              currency: 'INR',
            })}
          </span>
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
                    router.push(
                      '/dashboard/partial-refunds/view/' + data.row.original.id
                    ),
                  icon: <AiOutlineEye />,
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    router.push(
                      '/dashboard/partial-refunds/edit/' + data.row.original.id
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
    const response = await deleteItem('partial-refunds', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getPartialRefunds();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Partial Refund',
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
          title='Do you really want to delete this partial refund?'
          content='This will permanently delete the partial refund. Press OK to confirm.'
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
        viewLink={'/dashboard/partial-refunds'}
        downloadCSV
        CSVName='PartialRefunds.csv'
        columns={columns}
        data={partialRefunds.filter((perm) =>
          perm?.number?.toLowerCase().includes(searchQuery.toLowerCase())
        )}
      />
    </div>
  );
};

export default PartialRefunds;

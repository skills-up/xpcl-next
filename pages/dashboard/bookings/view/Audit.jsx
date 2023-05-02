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

const Audit = () => {
  const [audits, setAudits] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  const router = useRouter();

  useEffect(() => {
    if (router.isReady) getAudits();
  }, [router.isReady]);

  const getAudits = async () => {
    const response = await getList('bookings/' + router.query.view + '/audit-trail');
    if (response?.success) {
      setAudits(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting audits',
        4000
      );
    }
  };

  const columns = [
    {
      Header: 'Date',
      accessor: 'date',
    },
    {
      Header: 'Narration',
      accessor: 'narration',
    },
    {
      Header: 'Debit From',
      accessor: 'dr_account_name',
    },
    {
      Header: 'Credit To',
      accessor: 'cr_account_name',
    },
    {
      Header: 'Amount',
      accessor: 'amount',
    },
    {
      Header: 'Status',
      accessor: 'deleted_at',
      Cell: (data) => {
        if (data.row.original?.deleted_at)
          return (
            <span className='rounded-100 d-inline-block mt-1 py-4 px-10 text-center text-14 fw-500 bg-red-3 text-red-2'>
              Deleted
            </span>
          );
        else
          return (
            <span className='rounded-100 d-inline-block mt-1 py-4 px-10 text-center text-14 fw-500 bg-blue-1-05 text-blue-1'>
              Confirmed
            </span>
          );
      },
    },
  ];

  const onCancel = async () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };
  const onSubmit = async () => {
    const response = await deleteItem('audits', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getAudits();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Audit',
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
          title='Do you really want to delete this audit?'
          content='This will permanently delete the audit. Press OK to confirm.'
        />
      )}
      {/* Data Table */}
      {audits.map((element, index) => {
        return (
          <div>
            <h5>{element?.narration}</h5>
            <Datatable columns={columns} data={element?.journal_entries} />
          </div>
        );
      })}
    </div>
  );
};

export default Audit;

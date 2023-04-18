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

const ClosingBalances = () => {
  const [closingBalances, setClosingBalances] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const router = useRouter();

  useEffect(() => {
    getClosingBalances();
  }, [router.isReady]);

  const getClosingBalances = async () => {
    if (router.query.view) {
      const response = await getList('closing-balances', {
        account_id: router.query.view,
      });
      if (response?.success) {
        setClosingBalances(response.data);
      } else {
        sendToast(
          'error',
          response?.data?.message ||
            response?.data?.error ||
            'Error getting closing balances',
          4000
        );
      }
    }
  };

  const columns = [
    {
      Header: 'Closing Date',
      accessor: 'closing_date',
    },
    {
      Header: 'Amount',
      accessor: 'amount',
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
  ];

  const onCancel = async () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };
  const onSubmit = async () => {
    const response = await deleteItem('closing-balances', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getClosingBalances();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Closing Balance',
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
          title='Do you really want to delete this closing balance?'
          content='This will permanently delete the closing balance. Press OK to confirm.'
        />
      )}

      {/* Data Table */}
      <Datatable
        downloadCSV
        CSVName='ClosingBalances.csv'
        columns={columns}
        data={closingBalances.filter((perm) =>
          perm?.amount?.toLowerCase().includes(searchQuery.toLowerCase())
        )}
      />
    </div>
  );
};

export default ClosingBalances;

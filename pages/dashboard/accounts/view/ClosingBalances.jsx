import { useRouter } from 'next/router';
import { useState } from 'react';
import { BsTrash3 } from 'react-icons/bs';
import { deleteItem } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import ConfirmationModal from '../../../../components/confirm-modal';
import Datatable from '../../../../components/datatable/Datatable';
import { sendToast } from '../../../../utils/toastify';

const ClosingBalances = ({ accountClosingBalances = [] }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const router = useRouter();

  const columns = [
    {
      Header: 'Closing Date',
      accessor: 'closing_date',
    },
    {
      Header: 'Amount',
      accessor: 'amount',
      Cell: (data) => (<div>
        {Math.abs(Number(data.row.original.amount)).toLocaleString('en-IN')} {data.row.original.amount < 0 ? 'Cr' : 'Dr'}
      </div>)
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
    const response = await deleteItem('closing-balances', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      router.reload();
      // getClosingBalances();
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
        data={accountClosingBalances}
      />
    </div>
  );
};

export default ClosingBalances;

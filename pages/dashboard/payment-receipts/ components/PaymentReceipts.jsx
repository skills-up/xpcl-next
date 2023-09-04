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
import { DateObject } from 'react-multi-date-picker';
import Select from 'react-select';

const PaymentReceipts = () => {
  const [paymentReceipts, setPaymentReceipts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const [typeID, setTypeID] = useState({ label: 'All', value: 'all' });

  const router = useRouter();
  const typeOptions = [
    { label: 'All', value: 'All' },
    { label: 'Voucher', value: 'Voucher' },
    { label: 'Receipt', value: 'Receipt' },
    { label: 'Payment', value: 'Payment' },
  ];

  useEffect(() => {
    getPaymentReceipts();
  }, []);

  const getPaymentReceipts = async () => {
    const response = await getList('payment-receipts');
    if (response?.success) {
      setPaymentReceipts(response.data?.reverse());
    } else {
      sendToast(
        'error',
        response?.data?.message ||
          response?.data?.error ||
          'Error getting payment receipts',
        4000
      );
    }
  };

  const columns = [
    {
      Header: 'Date',
      accessor: 'date',
      Cell: (data) => {
        return (
          <span>
            {new Date(data.row.original.date).toLocaleString('en-IN', {
              dateStyle: 'medium',
            })}
          </span>
        );
      },
    },
    {
      Header: 'Number',
      accessor: 'number',
    },
    {
      Header: 'Type',
      accessor: 'type',
    },
    {
      Header: 'Narration',
      accessor: 'narration',
    },
    {
      Header: 'Debit',
      accessor: 'dr_account_name',
    },
    {
      Header: 'Credit',
      accessor: 'cr_account_name',
    },
    {
      Header: 'Amount',
      Cell: (data) => {
        return (
          <span>
            {(+data.row.original.amount).toLocaleString('en-IN', {
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
                      '/dashboard/payment-receipts/view/' + data.row.original.id
                    ),
                  icon: <AiOutlineEye />,
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    router.push(
                      '/dashboard/payment-receipts/edit/' + data.row.original.id
                    ),
                  icon: <HiOutlinePencilAlt />,
                },
                {
                  label: 'Clone',
                  onClick: () =>
                    router.push(
                      '/dashboard/payment-receipts/clone/' + data.row.original.id
                    ),
                  icon: <IoCopyOutline />,
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
    const response = await deleteItem('payment-receipts', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getPaymentReceipts();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Payment/Receipt/Voucher',
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
          title='Do you really want to delete this payment/receipt/voucher?'
          content='This will permanently delete this payment/receipt/voucher. Press OK to confirm.'
        />
      )}
      {/* Search Bar + Add New */}
      <div className='row mb-3 items-center justify-between mr-4'>
        <div className='col-lg-5 col-7'>
          <input
            type='text'
            className='d-block form-control'
            placeholder='Search'
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
        </div>
        <button
          className='btn btn-primary col-lg-2 col-12 my-2'
          onClick={() =>
            router.push({
              pathname: '/dashboard/payment-receipts/add-new',
              query: { type: 'Payment' },
            })
          }
        >
          Add New Payment
        </button>
        <button
          className='btn btn-primary col-lg-2 col-12 my-2'
          onClick={() =>
            router.push({
              pathname: '/dashboard/payment-receipts/add-new',
              query: { type: 'Receipt' },
            })
          }
        >
          Add New Receipt
        </button>
        <button
          className='btn btn-primary col-lg-2 col-12 my-2'
          onClick={() =>
            router.push({
              pathname: '/dashboard/payment-receipts/add-new',
              query: { type: 'Voucher' },
            })
          }
        >
          Add New Voucher
        </button>
      </div>
      <div className='my-3 col-12 pr-0'>
        <div className='form-input-select'>
          <label>Filter Type</label>
          <Select
            options={typeOptions}
            value={typeID}
            placeholder='Search..'
            onChange={(id) => setTypeID(id)}
          />
        </div>
      </div>
      {/* Data Table */}
      <Datatable
        downloadCSV
        CSVName='PaymentReceipts.csv'
        columns={columns}
        data={paymentReceipts
          .filter((perm) => {
            if (typeID?.value) {
              if (typeID.label !== 'All') {
                if (perm.type === typeID.label) {
                  return perm;
                }
              } else {
                return perm;
              }
            } else {
              return perm;
            }
          })
          .filter(
            (perm) =>
              perm?.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              perm?.number?.toLowerCase().includes(searchQuery.toLowerCase())
          )}
      />
    </div>
  );
};

export default PaymentReceipts;

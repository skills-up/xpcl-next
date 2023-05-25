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

const VendorCommissionInvoices = () => {
  const [vendorCommissionInvoices, setVendorCommissionInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  const router = useRouter();
  useEffect(() => {
    getVendorCommissionInvoices();
  }, []);

  const getVendorCommissionInvoices = async () => {
    const response = await getList('vendor-commission-invoices');
    if (response?.success) {
      setVendorCommissionInvoices(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message ||
          response?.data?.error ||
          'Error getting vendor commission invoices',
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
      Header: 'Vendor',
      accessor: 'vendor_name',
    },
    {
      Header: 'GSTN',
      accessor: 'gstn',
    },
    {
      Header: 'Financial Year',
      accessor: 'previous_financial_year',
      Cell: (data) => {
        return (
          <span>
            {data.row.original.previous_financial_year ? 'Previous' : 'Current'}
          </span>
        );
      },
    },
    {
      Header: 'HSN Code',
      accessor: 'hsn_code',
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
                      '/dashboard/vendor-commission-invoices/view/' + data.row.original.id
                    ),
                  icon: <AiOutlineEye />,
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    router.push(
                      '/dashboard/vendor-commission-invoices/edit/' + data.row.original.id
                    ),
                  icon: <HiOutlinePencilAlt />,
                },
                {
                  label: 'Clone',
                  onClick: () =>
                    router.push(
                      '/dashboard/vendor-commission-invoices/clone/' +
                        data.row.original.id
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
    const response = await deleteItem('vendor-commission-invoices', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getVendorCommissionInvoices();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Vendor Commission Invoice',
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
          title='Do you really want to delete this vendor commission invoice?'
          content='This will permanently delete the vendor commission invoice. Press OK to confirm.'
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
        <button
          className='btn btn-primary col-lg-2 col-5'
          onClick={() => router.push('/dashboard/vendor-commission-invoices/add-new')}
        >
          Add New
        </button>
      </div>
      {/* Data Table */}
      <Datatable
        downloadCSV
        CSVName='VendorCommissionInvoices.csv'
        columns={columns}
        data={vendorCommissionInvoices.filter(
          (perm) =>
            perm?.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            perm?.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            perm?.gstn?.toLowerCase().includes(searchQuery.toLowerCase())
        )}
      />
    </div>
  );
};

export default VendorCommissionInvoices;

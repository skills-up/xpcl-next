import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import { BsTrash3 } from 'react-icons/bs';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { IoCopyOutline } from 'react-icons/io5';
import { deleteItem, getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import ConfirmationModal from '../../../../components/confirm-modal';
import Datatable from '../../../../components/datatable/Datatable';
import { filterAllowed, hasPermission } from '../../../../utils/permission-checker';
import { sendToast } from '../../../../utils/toastify';

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
      setVendorCommissionInvoices(response.data?.reverse());
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
              options={filterAllowed([
                {
                  label: 'View',
                  onClick: () =>
                    router.push(
                      '/dashboard/vendor-commission-invoices/view/' + data.row.original.id
                    ),
                  icon: <AiOutlineEye />,
                  permissions: ['vendor-commission-invoices.show'],
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    router.push(
                      '/dashboard/vendor-commission-invoices/edit/' + data.row.original.id
                    ),
                  icon: <HiOutlinePencilAlt />,
                  permissions: ['vendor-commission-invoices.update'],
                },
                {
                  label: 'Clone',
                  onClick: () =>
                    router.push(
                      '/dashboard/vendor-commission-invoices/clone/' +
                        data.row.original.id
                    ),
                  icon: <IoCopyOutline />,
                  permissions: ['vendor-commission-invoices.store'],
                },
                {
                  label: 'Delete',
                  onClick: () => {
                    setIdToDelete(data.row.original.id);
                    setConfirmDelete(true);
                  },
                  icon: <BsTrash3 />,
                  permissions: ['vendor-commission-invoices.destroy'],
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
        {hasPermission('vendor-commission-invoices.store') && (
          <button
            className='btn btn-primary col-lg-2 col-5'
            onClick={() => router.push('/dashboard/vendor-commission-invoices/add-new')}
          >
            Add New
          </button>
        )}
      </div>
      {/* Data Table */}
      <Datatable
        viewLink={'/dashboard/vendor-commission-invoices'}
        downloadCSV
        CSVName='VendorCommissionInvoices.csv'
        columns={columns}
        data={vendorCommissionInvoices.filter((perm) =>
          Object.values(perm).join(',').toLowerCase().includes(searchQuery.toLowerCase())
        )}
      />
    </div>
  );
};

export default VendorCommissionInvoices;

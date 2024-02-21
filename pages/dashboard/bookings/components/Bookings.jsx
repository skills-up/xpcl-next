import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import { BsTrash3 } from 'react-icons/bs';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { IoCopyOutline } from 'react-icons/io5';
import { createItem, deleteItem, getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import SearchParams from '../../../../components/common/SearchParams';
import ConfirmationModal from '../../../../components/confirm-modal';
import Datatable from '../../../../components/datatable/ServerDatatable';
import { filterAllowed, hasPermission } from '../../../../utils/permission-checker';
import { sendToast } from '../../../../utils/toastify';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const [orgs, setOrgs] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [params, setParams] = useState([]);

  useEffect(() => {
    getOrganizations();
  }, []);

  useEffect(() => {
    getBookings();
  }, [pageSize, params]);

  const getOrganizations = async () => {
    const response = await getList('organizations');
    if (response?.success) {
      setOrgs(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message ||
          response?.data?.error ||
          'Error getting organiztions list',
        4000
      );
    }
  };

  const getBookings = async (paginate = false, pageNumber) => {
    const data = {
      paginate: pageSize,
    };
    if (paginate) {
      data.page = pageNumber;
    }
    let response = null;
    if (params.length) {
      data.search = params.filter((x) => x.value);
      response = await createItem('search/bookings', data);
    } else {
      response = await getList('bookings', data);
    }
    if (response?.success) {
      setBookings(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting bookings',
        4000
      );
    }
  };

  const columns = [
    {
      Header: 'Booking Date',
      accessor: 'booking_date',
    },
    {
      Header: 'Invoice Number',
      accessor: 'number',
    },
    {
      Header: 'Ticket Number',
      accessor: 'ticket_number',
    },
    {
      Header: 'Sector',
      accessor: 'sector',
    },
    {
      Header: 'Client Name',
      Cell: (data) => {
        return (
          <span>
            {orgs
              .filter((el) => el.id === data.row.original.client_id)
              .map((el) => `${el.name}`)}
          </span>
        );
      },
    },
    {
      Header: 'Passenger Name',
      accessor: 'client_traveller_name',
    },
    {
      Header: 'Airline / Type',
      accessor: 'airline_name',
    },
    {
      Header: 'Payment Account Name',
      accessor: 'payment_account_name',
    },
    {
      Header: 'Client Total',
      Cell: (data) => {
        return (
          <span>
            {(+data.row.original.client_total).toLocaleString('en-IN', {
              maximumFractionDigits: 2,
              style: 'currency',
              currency: 'INR',
            })}
          </span>
        );
      },
    },
    {
      Header: 'GST Charged',
      Cell: (data) => {
        return (
          <span>
            {(+data.row.original.client_service_charges).toLocaleString('en-IN', {
              maximumFractionDigits: 2,
              style: 'currency',
              currency: 'INR',
            })}
          </span>
        );
      },
    },
    {
      Header: 'Original Booking Number',
      accessor: 'original_booking_number',
    },
    {
      Header: 'Status',
      accessor: 'status',
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
                    window.location.assign(
                      '/dashboard/bookings/view/' + data.row.original.id
                    ),
                  icon: <AiOutlineEye />,
                  permissions: ['bookings.show'],
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/bookings/edit/' + data.row.original.id
                    ),
                  icon: <HiOutlinePencilAlt />,
                  permissions: ['bookings.update'],
                },
                {
                  label: 'Clone',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/bookings/clone/' + data.row.original.id
                    ),
                  icon: <IoCopyOutline />,
                  permissions: ['bookings.store'],
                },
                {
                  label: 'Delete',
                  onClick: () => {
                    setIdToDelete(data.row.original.id);
                    setConfirmDelete(true);
                  },
                  icon: <BsTrash3 />,
                  permissions: ['bookings.destroy'],
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
    const response = await deleteItem('bookings', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getBookings();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Invoice',
        4000
      );
    }
    onCancel();
  };

  const router = useRouter();

  return (
    <div className='col-12'>
      {confirmDelete && (
        <ConfirmationModal
          onCancel={onCancel}
          onSubmit={onSubmit}
          title='Do you really want to delete this invoice?'
          content='This will permanently delete the invoice. Press OK to confirm.'
        />
      )}
      {/* Search Bar + Add New */}
      <div className='row mb-3 y-gap-10 items-center justify-between mr-4 lg:pr-0 lg:mr-0'>
        <div className='col-lg-3'></div>
        {hasPermission('bookings.store') && (
          <div className='col-lg-9'>
            <button
              className='btn btn-primary col-lg-4 col-12'
              onClick={() =>
                router.push({
                  pathname: '/dashboard/bookings/add-new',
                  query: { type: 'domestic' },
                })
              }
            >
              Add Domestic
            </button>
            <button
              className='btn btn-primary col-lg-4 col-12'
              onClick={() =>
                router.push({
                  pathname: '/dashboard/bookings/add-new',
                  query: { type: 'international' },
                })
              }
            >
              Add International
            </button>
            <button
              className='btn btn-primary col-lg-4 col-12'
              onClick={() =>
                router.push({
                  pathname: '/dashboard/bookings/add-new',
                  query: { type: 'misc' },
                })
              }
            >
              Add Miscellaneous
            </button>
          </div>
        )}
      </div>
      {/* Search Box */}
      <SearchParams paramsState={[params, setParams]} entity={'bookings'} />
      {/* Data Table */}
      <Datatable
        onPageSizeChange={(size) => setPageSize(size)}
        downloadCSV
        CSVName='Invoices.csv'
        columns={columns}
        onPaginate={getBookings}
        fullData={bookings}
        data={bookings?.data || []}
      />
    </div>
  );
};

export default Bookings;

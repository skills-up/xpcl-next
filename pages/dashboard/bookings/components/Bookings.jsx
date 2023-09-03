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

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    getBookings();
  }, []);

  const getBookings = async () => {
    const orgs = await getList('organizations');
    const response = await getList('bookings');
    if (response?.success && orgs?.success) {
      setBookings(response.data?.reverse());
      setOrgs(orgs.data);
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
      Header: 'Booking Date',
      Cell: (data) => {
        return (
          <span>
            {data.row?.original?.booking_date?.toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </span>
        );
      },
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
              options={[
                {
                  label: 'View',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/bookings/view/' + data.row.original.id
                    ),
                  icon: <AiOutlineEye />,
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/bookings/edit/' + data.row.original.id
                    ),
                  icon: <HiOutlinePencilAlt />,
                },
                {
                  label: 'Clone',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/bookings/clone/' + data.row.original.id
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
        <div className='col-lg-3'>
          <input
            type='text'
            className='d-block form-control'
            placeholder='Search'
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
        </div>
        <div className='col-lg-3'>
          <button
            className='btn btn-primary col-12'
            onClick={() =>
              router.push({
                pathname: '/dashboard/bookings/add-new',
                query: { type: 'domestic' },
              })
            }
          >
            Add Domestic
          </button>
        </div>
        <div className='col-lg-3'>
          <button
            className='btn btn-primary col-12'
            onClick={() =>
              router.push({
                pathname: '/dashboard/bookings/add-new',
                query: { type: 'international' },
              })
            }
          >
            Add International
          </button>
        </div>
        <div className='col-lg-3'>
          <button
            className='btn btn-primary  col-12'
            onClick={() =>
              router.push({
                pathname: '/dashboard/bookings/add-new',
                query: { type: 'misc' },
              })
            }
          >
            Add Miscellaneous
          </button>
        </div>{' '}
      </div>
      {/* Data Table */}
      <Datatable
        viewLink={'/dashboard/bookings'}
        downloadCSV
        CSVName='Invoices.csv'
        columns={columns}
        data={bookings.filter(
          (perm) =>
            perm?.booking_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            perm?.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            perm?.payment_account_name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            perm?.number?.toLowerCase().includes(searchQuery.toLowerCase())
        )}
      />
    </div>
  );
};

export default Bookings;

import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import ConfirmationModal from '../../../../components/confirm-modal';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { deleteItem, getItem } from '../../../../api/xplorzApi';
import ViewTable from '../../../../components/view-table';
import { HiRefresh } from 'react-icons/hi';
import { RiRefund2Fill } from 'react-icons/ri';
import { ImPagebreak } from 'react-icons/im';
import Audit from '../../../../components/audits';
import { AiOutlinePrinter } from 'react-icons/ai';
import Datatable from '../../../../components/datatable/Datatable';
import { downloadApiPDF } from '../../../../utils/fileDownloader';
import { BsDashSquare, BsPlusSquare } from 'react-icons/bs';

const ViewBooking = () => {
  const [booking, setBooking] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const [bookingSectors, setBookingSectors] = useState(null);
  const [auditExpanded, setAuditExpanded] = useState(false);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  useEffect(() => {
    // Getting particular booking
    getBooking();
  }, [router.isReady]);

  const getBooking = async () => {
    if (router.query.view) {
      const response = await getItem('bookings', router.query.view);
      if (response?.success) {
        let data = response.data;
        // Converting time columns
        delete data['id'];
        if (data.created_by) {
          data.created_by = (
            <a
              className='text-15 cursor-pointer'
              href={'/dashboard/users/view/' + data.created_by}
            >
              <strong>User #{data.created_by} </strong>[
              {new Date(data.created_at).toLocaleString('en-AE', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
              ]
            </a>
          );
        }
        if (data.updated_by) {
          data.updated_by = (
            <a
              className='text-15 cursor-pointer'
              href={'/dashboard/users/view/' + data.updated_by}
            >
              <strong>User #{data.updated_by} </strong>[
              {new Date(data.updated_at).toLocaleString('en-AE', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
              ]
            </a>
          );
        }
        // if (data?.currency_conversion_charges)
        //   data['xplorz_gst_amount'] = data['currency_conversion_charges'];
        // delete data['currency_conversion_charges'];
        delete data['created_at'];
        delete data['updated_at'];
        if (data?.client_name && data?.client_id) {
          data.client_name = (
            <a href={'/dashboard/organizations/view/' + data.client_id}>
              {data.client_name}
            </a>
          );
        }
        delete data['client_id'];
        if (
          data?.client_traveller_name &&
          data?.client_traveller_id &&
          data?.client_traveller
        ) {
          data.client_traveller_name = (
            <a
              href={
                '/dashboard/travellers/client-travellers/view?traveller_id=' +
                data.client_traveller.traveller_id +
                '&view=' +
                data.client_traveller_id
              }
            >
              {data.client_traveller_name}
            </a>
          );
        }
        delete data['client_traveller'];
        delete data['client_traveller_id'];
        if (data?.vendor_name && data?.vendor_id) {
          data.vendor_name = (
            <a href={'/dashboard/organizations/view/' + data.vendor_id}>
              {data.vendor_name}
            </a>
          );
        }
        if (data?.enable_inr) {
          data.enable_inr = data.enable_inr ? true : false;
        }
        delete data['vendor_id'];
        if (data?.airline_name && data?.airline_id) {
          data.airline_name = (
            <a href={'/dashboard/organizations/view/' + data.airline_id}>
              {data.airline_name}
            </a>
          );
        }
        delete data['airline_id'];
        if (data?.payment_account_name && data?.payment_account_id) {
          data.payment_account_name = (
            <a href={'/dashboard/accounts/view/' + data.payment_account_id}>
              {data.payment_account_name}
            </a>
          );
        }
        delete data['payment_account_id'];
        if (data?.client_referrer_name && data?.client_referrer_id) {
          data.client_referrer_name = (
            <a href={'/dashboard/accounts/view/' + data.client_referrer_id}>
              {data.client_referrer_name}
            </a>
          );
        }
        delete data['client_referrer_id'];
        if (data?.reissued_booking) {
          const id = data.reissued_booking.id;
          data.status = (
            <span
              className='rounded-100 cursor-pointer d-inline-block mt-1 py-4 px-10 text-center text-14 fw-500 bg-blue-1-05 text-blue-1'
              onClick={() => window.location.assign('/dashboard/bookings/view/' + id)}
            >
              Reissued Booking
            </span>
          );
        }
        if (data?.partial_refund) {
          const id = data.partial_refund.id;
          data.status = (
            <span
              className='rounded-100 cursor-pointer d-inline-block mt-1 py-4 px-10 text-center text-14 fw-500'
              style={{ backgroundColor: 'orange', color: 'white' }}
              onClick={() =>
                window.location.assign('/dashboard/partial-refunds/view/' + id)
              }
            >
              Partially Refunded
            </span>
          );
        }
        if (data?.refund) {
          const id = data.refund.id;
          data.status = (
            <span
              className='rounded-100 cursor-pointer d-inline-block mt-1 py-4 px-10 text-center text-14 fw-500 bg-red-3 text-red-2'
              onClick={() => window.location.assign('/dashboard/refunds/view/' + id)}
            >
              Refunded
            </span>
          );
        }
        if (data?.booking_sectors)
          if (data?.booking_sectors.length > 0)
            setBookingSectors(data.booking_sectors.slice(0));
        if (data?.original_booking_id && data?.original_booking_number) {
          data['reissued_for'] = (
            <a
              className='text-15 cursor-pointer'
              href={'/dashboard/bookings/view/' + data.original_booking_id}
            >
              {data.original_booking_number}
            </a>
          );
        }
        if (data?.commission_rule_name && data?.commission_rule_id) {
          data.commission_rule_name = (
            <a href={'/dashboard/commission-rules/view/' + data.commission_rule_id}>
              {data.commission_rule_name}
            </a>
          );
        }
        delete data['commission_rule_id'];
        delete data['original_booking_number'];
        delete data['original_booking_id'];
        delete data['sectors'];
        delete data['booking_sectors'];
        delete data['reissued_booking'];
        delete data['partial_refund'];
        delete data['refund'];
        setBooking(data);
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Could Not Fetch The Requested Booking.'
        );
        router.push('/dashboard/bookings');
      }
    }
  };

  const columns = [
    {
      Header: 'From',
      accessor: 'from_airport',
    },
    {
      Header: 'To',
      accessor: 'to_airport',
    },
    {
      Header: 'Travel Date',
      accessor: 'travel_date',
      Cell: (data) => {
        return (
          <div>
            {data.row.original.travel_date
              ? new Date(data.row.original.travel_date).toLocaleString('en-AE', {
                  dateStyle: 'medium',
                })
              : ''}
          </div>
        );
      },
    },
    {
      Header: 'Travel Time',
      accessor: 'travel_time',
    },
    {
      Header: 'Booking Class',
      accessor: 'booking_class',
    },
    {
      Header: 'Boarding Pass',
      accessor: 'boarding_pass',
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
      router.push('/dashboard/bookings');
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

  return (
    <>
      <Seo pageTitle='View Invoice' />
      {/* End Page Title */}

      <div className='header-margin'></div>

      <Header />
      {/* End dashboard-header */}

      <div className='dashboard'>
        <div className='dashboard__sidebar bg-white scroll-bar-1'>
          <Sidebar />
          {/* End sidebar */}
        </div>
        {/* End dashboard__sidebar */}

        <div className='dashboard__main'>
          <div className='dashboard__content d-flex flex-column justify-between bg-light-2'>
            <div>
              <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>
                    View Invoice - {booking?.number}
                  </h1>
                  <div className='text-15 text-light-1'>
                    Get extended details of an invoice.
                  </div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                {confirmDelete && (
                  <ConfirmationModal
                    onCancel={onCancel}
                    onSubmit={onSubmit}
                    title='Do you really want to delete this invoice?'
                    content='This will permanently delete the invoice. Press OK to confirm.'
                  />
                )}
                <ViewTable
                  data={booking}
                  onEdit={() =>
                    router.push('/dashboard/bookings/edit/' + router.query.view)
                  }
                  onDelete={() => {
                    setIdToDelete(router.query.view);
                    setConfirmDelete(true);
                  }}
                  extraButtons={[
                    {
                      icon: <HiRefresh />,
                      text: 'Reissue',
                      onClick: () =>
                        router.push('/dashboard/bookings/reissue/' + router.query.view),
                      classNames: 'btn-success',
                    },
                    {
                      icon: <RiRefund2Fill />,
                      text: 'Refund',
                      onClick: () =>
                        router.push({
                          pathname: '/dashboard/refunds/add-new',
                          query: { booking_id: router.query.view },
                        }),
                      style: { backgroundColor: 'brown', color: 'white' },
                    },
                    {
                      icon: <ImPagebreak />,
                      text: 'Partial Refund',
                      onClick: () =>
                        router.push({
                          pathname: '/dashboard/partial-refunds/add-new',
                          query: { booking_id: router.query.view },
                        }),
                      style: { backgroundColor: 'orange' },
                    },
                    {
                      icon: <AiOutlinePrinter />,
                      text: 'Print',
                      onClick: async () => {
                        downloadApiPDF(
                          'bookings/' + router.query.view + '/pdf',
                          `${booking?.number ?? 'Unkown'}.pdf`
                        );
                      },
                      classNames: 'btn-info text-white',
                    },
                  ]}
                />
                {bookingSectors && (
                  <>
                    <hr className='my-4' />
                    <div>
                      <h2 className='mb-3'>Booking Sectors</h2>
                      <Datatable columns={columns} data={bookingSectors} />
                    </div>
                  </>
                )}
                <hr className='my-4' />
                <div>
                  <h2 className='mb-3 d-flex justify-between items-center'>
                    <span>Audit Log</span>
                    {auditExpanded ? (
                      <BsDashSquare
                        className='cursor-pointer text-blue-1'
                        onClick={() => setAuditExpanded((prev) => !prev)}
                      />
                    ) : (
                      <BsPlusSquare
                        className='cursor-pointer text-blue-1'
                        onClick={() => setAuditExpanded((prev) => !prev)}
                      />
                    )}
                  </h2>
                  {auditExpanded && (
                    <Audit url={'bookings/' + router.query.view + '/audit-trail'} />
                  )}
                </div>
              </div>
            </div>

            <Footer />
          </div>
          {/* End .dashboard__content */}
        </div>
        {/* End dashbaord content */}
      </div>
      {/* End dashbaord content */}
    </>
  );
};

export default ViewBooking;

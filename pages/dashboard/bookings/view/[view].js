import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlinePrinter } from 'react-icons/ai';
import { BsDashSquare, BsPlusSquare } from 'react-icons/bs';
import { HiRefresh } from 'react-icons/hi';
import { ImPagebreak } from 'react-icons/im';
import { RiRefund2Fill } from 'react-icons/ri';
import { useSelector } from 'react-redux';
import { deleteItem, getItem } from '../../../../api/xplorzApi';
import Audit from '../../../../components/audits';
import Seo from '../../../../components/common/Seo';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import ConfirmationModal from '../../../../components/confirm-modal';
import Datatable from '../../../../components/datatable/Datatable';
import ViewTable from '../../../../components/view-table';
import { downloadApiPDF } from '../../../../utils/fileDownloader';
import { filterAllowed, hasPermission } from '../../../../utils/permission-checker';
import { sendToast } from '../../../../utils/toastify';

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
        const res = response.data || {};
        const inrFormat = Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        });
        const data = {
          number: res.number,
          booking_type: res.booking_type,
          booking_date: new Date(res.booking_date).toLocaleDateString('en-IN', {
            dateStyle: 'medium',
          }),
          client_name: (
            <a href={'/dashboard/organizations/view/' + res.client_id}>
              {res.client_name}
            </a>
          ),
          end_client_name: res.end_client_name ? (
            <a href={'/dashboard/organizations/view/' + res.end_client_id}>
              {res.end_client_name}
            </a>
          ) : undefined,
          client_traveller_name: res.client_traveller_name ? (
            <a
              href={
                '/dashboard/travellers/client-travellers/view?traveller_id=' +
                res.client_traveller.traveller_id +
                '&view=' +
                res.client_traveller_id
              }
            >
              {res.client_traveller_name}
            </a>
          ) : undefined,
          vendor_name: (
            <a href={'/dashboard/organizations/view/' + res.vendor_id}>
              {res.vendor_name}
            </a>
          ),
          airline_name: res.airline_name ? (
            <a href={'/dashboard/organizations/view/' + res.airline_id}>
              {res.airline_name}
            </a>
          ) : null,
          ticket_number: res.ticket_number,
          pnr: res.pnr || null,
          sector: res.sector || null,
          vendor_base_amount: inrFormat.format(res.vendor_base_amount),
          vendor_yq_amount: inrFormat.format(res.vendor_yq_amount),
          vendor_tax_amount: inrFormat.format(res.vendor_tax_amount),
          vendor_gst_amount: inrFormat.format(res.vendor_gst_amount),
          reissue_penalty: inrFormat.format(res.reissue_penalty),
          vendor_misc_charges: inrFormat.format(res.vendor_misc_charges),
          vendor_total: inrFormat.format(res.vendor_total),
          commission_rule_name: res.commission_rule_name ? (
            <a href={'/dashboard/commission-rules/view/' + res.commission_rule_id}>
              {res.commission_rule_name}
            </a>
          ) : undefined,
          iata_commission_percent: res.iata_commission_percent,
          plb_commission_percent: res.plb_commission_percent,
          vendor_service_charges: inrFormat.format(res.vendor_service_charges),
          vendor_tds: inrFormat.format(res.vendor_tds),
          commission_receivable: inrFormat.format(res.commission_receivable),
          payment_account_name: res.payment_account_name ? (
            <a href={'/dashboard/accounts/view/' + res.payment_account_id}>
              {res.payment_account_name}
            </a>
          ) : undefined,
          payment_amount: inrFormat.format(res.payment_amount),
          client_base_amount: inrFormat.format(res.client_base_amount),
          client_reissue_fee: inrFormat.format(res.client_reissue_fee),
          client_tax_amount: inrFormat.format(res.client_tax_amount),
          client_gst_amount: inrFormat.format(res.client_gst_amount),
          xplorz_gst_amount: inrFormat.format(res.client_service_charges),
          client_reissue_gst: inrFormat.format(res.client_reissue_gst),
          client_total: inrFormat.format(res.client_total),
          client_referral_fee: inrFormat.format(res.client_referral_fee),
          client_referrer_name: res.client_referrer_name ? (
            <a href={'/dashboard/accounts/view/' + res.client_referrer_id}>
              {res.client_referrer_name}
            </a>
          ) : undefined,
          updated_by: res.updated_by ? (
            <a href={'/dashboard/users/view/' + res.updated_by}>
              <strong>User #{res.updated_by} </strong>[
              {new Date(res.updated_at).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
              ]
            </a>
          ) : undefined,
          status: <span className='text-success fw-600'>Active</span>,
          miscellaneous_type: res.miscellaneous_type,
          is_offshore: res.is_offshore,
          is_personal: res.is_personal,
          is_auto_invoiced: res.is_auto_invoiced,
        };
        if (res?.reissued_booking) {
          data.status = (
            <a
              href={'/dashboard/bookings/view/' + res.reissued_booking.id}
              className='text-blue-1 fw-600'
            >
              Reissued Booking
            </a>
          );
        }
        if (res?.partial_refund) {
          data.status = (
            <a
              href={'/dashboard/partial-refunds/view/' + res.partial_refund.id}
              className='text-yellow-3 fw-600'
            >
              Partially Refunded
            </a>
          );
        }
        if (res?.refund) {
          data.status = (
            <a
              href={'/dashboard/refunds/view/' + res.refund.id}
              className='text-red-2 fw-600'
            >
              Refunded
            </a>
          );
        }
        if (res?.original_booking_id && res?.original_booking_number) {
          data.reissued_for = (
            <a href={'/dashboard/bookings/view/' + data.original_booking_id}>
              {res.original_booking_number}
            </a>
          );
        }
        if (res?.booking_sectors?.length > 0)
          setBookingSectors(res.booking_sectors.slice(0));
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
      Header: 'Flight Details',
      accessor: 'details',
    },
    {
      Header: 'Travel Date',
      accessor: 'travel_date',
      Cell: (data) => {
        return (
          <div>
            {data.row.original.travel_date
              ? new Date(data.row.original.travel_date).toLocaleString('en-IN', {
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
    {
      Header: 'Emission',
      accessor: 'emission',
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
          entitySlug={'bookings'}
          extraButtons={filterAllowed([
            {
              icon: <HiRefresh />,
              text: 'Reissue',
              onClick: () =>
                router.push('/dashboard/bookings/reissue/' + router.query.view),
              classNames: 'btn-success',
              permissions: ['bookings.reissue'],
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
              permissions: ['refunds.store'],
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
              permissions: ['partial-refunds.store'],
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
              permissions: ['bookings.pdf'],
            },
          ])}
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
        {hasPermission('bookings.audit-trail') && (
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
        )}
      </div>
    </>
  );
};

ViewBooking.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default ViewBooking;

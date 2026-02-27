import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlinePrinter } from 'react-icons/ai';
import { BsTicketPerforated } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import { createItem, getItem } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import Datatable from '../../../../components/datatable/Datatable';
import ViewTable from '../../../../components/view-table';
import { filterAllowed } from '../../../../utils/permission-checker';
import { sendToast } from '../../../../utils/toastify';

const ViewAgentBooking = () => {
  const [booking, setBooking] = useState([]);
  const [sectorRows, setSectorRows] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [showRawData, setShowRawData] = useState(false);
  const [showParsedData, setShowParsedData] = useState(false);
  const [isMisc, setIsMisc] = useState(false);

  const router = useRouter();

  useEffect(() => {
    getBooking();
  }, [router.isReady]);

  const getBooking = async () => {
    if (router.query.view) {
      const response = await getItem('agent-bookings', router.query.view);
      if (response?.success) {
        const res = response.data || {};
        const curr = res.currency || 'INR';
        const fmt = (val) => {
          if (val === null || val === undefined) return null;
          return (+val).toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            style: 'currency',
            currency: curr,
          });
        };

        const isMiscType = res.booking_type === 'Miscellaneous';
        setIsMisc(isMiscType);

        // Status display
        let statusDisplay;
        const s = res.status;
        if (s === 'processed' || s === 'completed')
          statusDisplay = <span className='text-success fw-600'>{s}</span>;
        else if (s === 'error' || s === 'failed')
          statusDisplay = <span className='text-danger fw-600'>{s}</span>;
        else statusDisplay = <span className='text-warning fw-600'>{s}</span>;

        const data = {
          provider: res.provider,
          booking_reference: res.booking_reference,
          pnr: res.pnr,
          booking_type: res.booking_type,
          ...(res.misc_sub_type ? { misc_sub_type: res.misc_sub_type } : {}),
          ticket_number: res.ticket_number,
          client_code: res.client_code,
          client_traveller_name: res.client_traveller_name || `ID: ${res.client_traveller_id}`,
          ...(res.airline_code ? { airline_code: res.airline_code } : {}),
          ...(res.vendor_code ? { vendor_code: res.vendor_code } : {}),
          ...(res.hotel_name ? { hotel_name: res.hotel_name } : {}),
          ...(res.hotel_id ? { hotel_id: res.hotel_id } : {}),
          booking_date: res.booking_date
            ? new Date(res.booking_date).toLocaleDateString('en-IN', {
              dateStyle: 'medium',
            })
            : null,
          travel_date: res.travel_date
            ? new Date(res.travel_date).toLocaleDateString('en-IN', {
              dateStyle: 'medium',
            })
            : null,
          ...(res.checkout_date
            ? {
              checkout_date: new Date(res.checkout_date).toLocaleDateString('en-IN', {
                dateStyle: 'medium',
              }),
            }
            : {}),
          base_fare: fmt(res.base_fare),
          taxes: fmt(res.taxes),
          vendor_yq_amount: fmt(res.vendor_yq_amount),
          vendor_gst_amount: fmt(res.vendor_gst_amount),
          vendor_misc_charges: fmt(res.vendor_misc_charges),
          quoted_amount: fmt(res.quoted_amount),
          actual_amount: fmt(res.actual_amount),
          currency: res.currency,
          iata_commission_pct: res.iata_commission_pct,
          plb_commission_pct: res.plb_commission_pct,
          ...(res.commission_rule_name
            ? { commission_rule: res.commission_rule_name }
            : {}),
          ...(res.baggage_allowance
            ? { baggage_allowance: res.baggage_allowance }
            : {}),
          ...(res.seat_numbers ? { seat_numbers: res.seat_numbers } : {}),
          show_client_gst: res.show_client_gst,
          is_personal: res.is_personal,
          show_fare: res.show_fare,
          send_only_to_support: res.send_only_to_support,
          email_travellers: res.email_travellers,
          is_lcc: res.is_lcc,
          tripcentral_billing: res.tripcentral_billing,
          ...(res.tripcentral_billing
            ? { tripcentral_cost_amount: fmt(res.tripcentral_cost_amount) }
            : {}),
          is_ticketed: res.is_ticketed,
          status: statusDisplay,
          ...(res.booking_id ? { booking_id: res.booking_id } : {}),
        };

        if (res.error_message) {
          data.error_message = (
            <span className='text-danger fw-500'>{res.error_message}</span>
          );
        }

        setBooking(data);

        // Sectors
        if (res.sectors && Array.isArray(res.sectors) && res.sectors.length > 0) {
          setSectorRows(res.sectors);
        }

        // Raw Data
        setRawData(res.raw_data);
        setParsedData(res.parsed_data);
      } else {
        sendToast(
          'error',
          response.data?.message ||
          response.data?.error ||
          'Could not fetch the requested booking.'
        );
        router.push('/dashboard/agent-bookings');
      }
    }
  };

  const sectorColumns = [
    {
      Header: 'From',
      accessor: 'from',
    },
    {
      Header: 'To',
      accessor: 'to',
    },
    {
      Header: 'Date',
      accessor: 'date',
      Cell: (data) => {
        return (
          <div>
            {data.row.original.date
              ? new Date(data.row.original.date).toLocaleDateString('en-IN', {
                dateStyle: 'medium',
              })
              : ''}
          </div>
        );
      },
    },
    {
      Header: 'Time',
      accessor: 'time',
    },
    {
      Header: 'Details',
      accessor: 'details',
    },
    {
      Header: 'Flight Number',
      accessor: 'flight_number',
    },
  ];

  return (
    <>
      <Seo pageTitle='View Agent Booking' />

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
        <div className='col-12'>
          <h1 className='text-30 lh-14 fw-600'>
            View Agent Booking - {booking?.booking_reference || router.query.view}
          </h1>
          <div className='text-15 text-light-1'>
            View details of an agent-created booking.
          </div>
        </div>
      </div>

      <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
        <ViewTable
          data={booking}
          onEdit={() =>
            router.push('/dashboard/agent-bookings/edit/' + router.query.view)
          }
          onDelete={() => { }}
          entitySlug={'agent-bookings'}
          extraButtons={filterAllowed([
            {
              icon: <AiOutlinePrinter />,
              text: 'Invoice',
              onClick: async () => {
                const response = await createItem(
                  `agent-bookings/${router.query.view}/invoice`,
                  {}
                );
                if (response?.success) {
                  sendToast('success', 'Invoice created successfully', 4000);
                } else {
                  sendToast(
                    'error',
                    response?.data?.message ||
                    response?.data?.error ||
                    'Failed to create invoice',
                    4000
                  );
                }
              },
              classNames: 'btn-info text-white',
              permissions: ['agent-bookings.invoice'],
            },
            ...(!isMisc
              ? [
                {
                  icon: <BsTicketPerforated />,
                  text: 'Ticket',
                  onClick: async () => {
                    const response = await createItem(
                      `agent-bookings/${router.query.view}/ticket`,
                      {}
                    );
                    if (response?.success) {
                      sendToast('success', 'Ticket created successfully', 4000);
                    } else {
                      sendToast(
                        'error',
                        response?.data?.message ||
                        response?.data?.error ||
                        'Failed to create ticket',
                        4000
                      );
                    }
                  },
                  classNames: 'btn-success',
                  permissions: ['agent-bookings.ticket'],
                },
              ]
              : []),
          ])}
        />

        {/* Sectors */}
        {sectorRows && (
          <>
            <hr className='my-4' />
            <div>
              <h2 className='mb-3'>Sectors</h2>
              <Datatable columns={sectorColumns} data={sectorRows} />
            </div>
          </>
        )}

        {/* Raw Data */}
        {rawData && (
          <>
            <hr className='my-4' />
            <div>
              <h2
                className='mb-3 cursor-pointer d-flex items-center gap-2'
                onClick={() => setShowRawData((prev) => !prev)}
              >
                Raw Data{' '}
                <span className='text-14 text-light-1'>
                  ({showRawData ? 'click to hide' : 'click to show'})
                </span>
              </h2>
              {showRawData && (
                <pre
                  className='p-10 bg-light rounded-4'
                  style={{
                    maxHeight: '400px',
                    overflow: 'auto',
                    fontSize: '12px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {typeof rawData === 'string'
                    ? rawData
                    : JSON.stringify(rawData, null, 2)}
                </pre>
              )}
            </div>
          </>
        )}

        {/* Parsed Data */}
        {parsedData && (
          <>
            <hr className='my-4' />
            <div>
              <h2
                className='mb-3 cursor-pointer d-flex items-center gap-2'
                onClick={() => setShowParsedData((prev) => !prev)}
              >
                Parsed Data{' '}
                <span className='text-14 text-light-1'>
                  ({showParsedData ? 'click to hide' : 'click to show'})
                </span>
              </h2>
              {showParsedData && (
                <pre
                  className='p-10 bg-light rounded-4'
                  style={{
                    maxHeight: '400px',
                    overflow: 'auto',
                    fontSize: '12px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {typeof parsedData === 'string'
                    ? parsedData
                    : JSON.stringify(parsedData, null, 2)}
                </pre>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

ViewAgentBooking.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default ViewAgentBooking;

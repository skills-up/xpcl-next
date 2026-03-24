import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { AiOutlinePrinter } from 'react-icons/ai';
import { BsTicketPerforated } from 'react-icons/bs';
import { createItem, getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import SearchParams from '../../../../components/common/SearchParams';
import ConfirmationModal from '../../../../components/confirm-modal';
import Datatable from '../../../../components/datatable/ServerDatatable';
import { filterAllowed } from '../../../../utils/permission-checker';
import { sendToast } from '../../../../utils/toastify';

const AgentBookings = () => {
  const [agentBookings, setAgentBookings] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [params, setParams] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);

  const router = useRouter();

  useEffect(() => {
    getAgentBookings();
  }, [pageSize, params]);

  const getAgentBookings = async (paginate = false, pageNumber) => {
    const data = {
      paginate: pageSize,
    };
    if (paginate) {
      data.page = pageNumber;
    }
    let response = null;
    if (params.length) {
      data.search = params.filter((x) => x.value);
      response = await createItem('search/agent-bookings', data);
    } else {
      response = await getList('agent-bookings', data);
    }
    if (response?.success) {
      setAgentBookings(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message ||
          response?.data?.error ||
          'Error getting agent bookings',
        4000
      );
    }
  };

  const columns = [
    {
      Header: 'Booking Date',
      accessor: 'booking_date',
      Cell: (data) => {
        return (
          <span>
            {data.row.original.booking_date
              ? new Date(data.row.original.booking_date).toLocaleDateString('en-IN', {
                  dateStyle: 'medium',
                })
              : ''}
          </span>
        );
      },
    },
    {
      Header: 'Provider',
      accessor: 'provider',
    },
    {
      Header: 'Booking Ref',
      accessor: 'booking_reference',
    },
    {
      Header: 'PNR',
      accessor: 'pnr',
    },
    {
      Header: 'Ticket Number',
      accessor: 'ticket_number',
    },
    {
      Header: 'Booking Type',
      accessor: 'booking_type',
    },
    {
      Header: 'Client',
      Cell: (data) => {
        return <span>{data.row.original.client_name} ({data.row.original.client_code})</span>
      },
    },
    {
      Header: 'Traveller',
      accessor: 'client_traveller_name',
    },
    {
      Header: 'Quoted Amount',
      Cell: (data) => {
        const val = data.row.original.quoted_amount;
        if (val === null || val === undefined) return <span>-</span>;
        return (
          <span>
            {(+val).toLocaleString('en-IN', {
              maximumFractionDigits: 2,
              style: 'currency',
              currency: data.row.original.currency || 'INR',
            })}
          </span>
        );
      },
    },
    {
      Header: 'Actual Amount',
      Cell: (data) => {
        const val = data.row.original.actual_amount;
        if (val === null || val === undefined) return <span>-</span>;
        return (
          <span>
            {(+val).toLocaleString('en-IN', {
              maximumFractionDigits: 2,
              style: 'currency',
              currency: data.row.original.currency || 'INR',
            })}
          </span>
        );
      },
    },
    {
      Header: 'Status',
      Cell: (data) => {
        const status = data.row.original.status;
        let className = 'text-warning';
        if (status === 'processed' || status === 'completed') className = 'text-success';
        else if (status === 'error' || status === 'failed') className = 'text-danger';
        return <span className={`fw-500 ${className}`}>{status}</span>;
      },
    },
    {
      Header: 'Actions',
      disableSortBy: true,
      alignRight: true,
      Cell: (data) => {
        const row = data.row.original;
        const isMisc = row.booking_type === 'Miscellaneous';
        return (
          <div className='d-flex justify-end'>
            <ActionsButton
              options={filterAllowed([
                {
                  label: 'View',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/agent-bookings/view/' + row.id
                    ),
                  icon: <AiOutlineEye />,
                  permissions: ['agent-bookings.show'],
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/agent-bookings/edit/' + row.id
                    ),
                  icon: <HiOutlinePencilAlt />,
                  permissions: ['agent-bookings.update'],
                },
                {
                  label: 'Invoice',
                  onClick: () =>
                    setConfirmAction({ id: row.id, type: 'invoice', ref: row.booking_reference }),
                  icon: <AiOutlinePrinter />,
                  permissions: ['agent-bookings.invoice'],
                },
                ...(!isMisc
                  ? [
                      {
                        label: 'Ticket',
                        onClick: () =>
                          setConfirmAction({ id: row.id, type: 'ticket', ref: row.booking_reference }),
                        icon: <BsTicketPerforated />,
                        permissions: ['agent-bookings.ticket'],
                      },
                    ]
                  : []),
              ])}
            />
          </div>
        );
      },
    },
  ];

  const onConfirmAction = async () => {
    if (!confirmAction) return;
    const { id, type } = confirmAction;
    const response = await createItem(`agent-bookings/${id}/${type}`, {});
    if (response?.success) {
      sendToast('success', `${type.charAt(0).toUpperCase() + type.slice(1)} action completed successfully`, 4000);
      getAgentBookings();
    } else {
      sendToast(
        'error',
        response?.data?.message ||
          response?.data?.error ||
          `Failed to trigger ${type} action`,
        4000
      );
    }
    setConfirmAction(null);
  };

  const bookingRows = Array.isArray(agentBookings)
    ? agentBookings
    : agentBookings?.data || [];

  return (
    <div className='col-12'>
      {confirmAction && (
        <ConfirmationModal
          onCancel={() => setConfirmAction(null)}
          onSubmit={onConfirmAction}
          title={`${confirmAction.type} ${confirmAction.ref}?`}
          content={`This will ${confirmAction.type} the booking ${confirmAction.ref}. Press OK to confirm.`}
        />
      )}
      {/* Search Box */}
      <SearchParams paramsState={[params, setParams]} entity={'agent-bookings'} />
      {/* Data Table */}
      <Datatable
        onPageSizeChange={(size) => setPageSize(size)}
        downloadCSV
        CSVName='AgentBookings.csv'
        columns={columns}
        onPaginate={getAgentBookings}
        fullData={agentBookings}
        data={bookingRows}
      />
    </div>
  );
};

export default AgentBookings;

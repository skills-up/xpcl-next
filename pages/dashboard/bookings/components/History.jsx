import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import Datatable from '../../../../components/datatable/Datatable';
import { filterAllowed } from '../../../../utils/permission-checker';
import { sendToast } from '../../../../utils/toastify';

const History = () => {
  const date = new Date();
  date.setDate(1);

  const [bookings, setBookings] = useState([]);
  const [toDate, setToDate] = useState(new DateObject());
  const [fromDate, setFromDate] = useState(new DateObject(date));

  useEffect(() => {
    getBookings();
  }, []);

  const getBookings = async () => {
    const response = await getList('bookings-history', {
      from_date: fromDate.format('YYYY-MM-DD'),
      to_date: toDate.format('YYYY-MM-DD'),
    });
    if (response?.success) {
      setBookings(response.data?.reverse());
    } else {
      sendToast(
        'error',
        response?.data?.message ||
          response?.data?.error ||
          'Error getting bookings history',
        4000
      );
    }
  };

  const columns = [
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
      Header: 'Booking Number',
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
      Header: 'Emission',
      accessor: 'emission',
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
      Header: 'Amount',
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
              ])}
            />
          </div>
        );
      },
    },
  ];

  const router = useRouter();

  return (
    <div className='col-12'>
      <div className='row mb-3 y-gap-10 items-center justify-between mr-4 lg:pr-0 lg:mr-0'>
        <div className='d-block ml-3 form-datepicker col-lg-4'>
          <label>
            From Date<span className='text-danger'>*</span>
          </label>
          <DatePicker
            style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
            inputClass='custom_input-picker'
            containerClassName='custom_container-picker'
            value={fromDate}
            onChange={setFromDate}
            numberOfMonths={1}
            offsetY={10}
            format='DD MMMM YYYY'
          />
        </div>
        <div className='d-block ml-3 form-datepicker col-lg-4'>
          <label>
            To Date<span className='text-danger'>*</span>
          </label>
          <DatePicker
            style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
            inputClass='custom_input-picker'
            containerClassName='custom_container-picker'
            value={toDate}
            onChange={setToDate}
            minDate={fromDate}
            numberOfMonths={1}
            offsetY={10}
            format='DD MMMM YYYY'
          />
        </div>
        <div className='d-block ml-3 col-lg-4'>
          <button className='btn btn-primary col-12' onClick={() => getBookings()}>
            Get History
          </button>
        </div>
      </div>
      {/* Data Table */}
      <Datatable
        viewLink={'/dashboard/bookings'}
        downloadCSV
        CSVName='Invoices.csv'
        columns={columns}
        data={bookings}
      />
    </div>
  );
};

export default History;

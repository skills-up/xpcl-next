import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { jsonToCSV } from 'react-papaparse';
import { getList } from '../../../../api/xplorzApi';
import Datatable from '../../../../components/datatable/Datatable';
import { downloadCSV as CSVDownloader } from '../../../../utils/fileDownloader';
import { sendToast } from '../../../../utils/toastify';

const BillWiseProfitReport = () => {
  const [data, setData] = useState([]);

const date = new DateObject();

const [dates, setDates] = useState([
  new DateObject()
    .setYear(date.year - (date.month.number < 4 ? 1 : 0))
    .setMonth((date.year == 2024 && date.month.number < 4) ? 10 : 4)
    .setDay('1'),
  new DateObject(),
]);

  const router = useRouter();

  const getReport = async () => {
    const response = await getList('reports/booking-pnl', {
      from_date: dates[0].format('YYYY-MM-DD'),
      to_date: dates[1].format('YYYY-MM-DD'),
    });
    if (response?.success) {
      setData(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting report',
        4000
      );
    }
  };

  useEffect(() => {
    if (dates && dates?.length === 2) getReport();
  }, [router.isReady, dates]);

  const columns = [
    {
      Header: 'Date',
      accessor: 'booking_date',
    },
    {
      Header: 'Bill Number',
      accessor: 'number',
    },
    {
      Header: 'Client Name',
      accessor: 'client_name',
    },
    {
      Header: 'Traveller Name',
      accessor: 'client_traveller_name',
    },
    {
      Header: 'Airline Name',
      accessor: 'airline_name',
    },
    {
      Header: 'Profit/Loss',
      accessor: 'profit',
      alignRight: true,
      Cell: (data) => (
        <span>{(+data.row.original.profit).toFixed(2)}</span>
      ),
    },
  ];

  return (
    <div className='col-12'>
      <div className='col-lg-5 col-12 d-block ml-3 form-datepicker'>
        <label>Select Start & End Dates</label>
        <DatePicker
          style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
          inputClass='custom_input-picker'
          containerClassName='custom_container-picker'
          value={dates}
          onChange={setDates}
          numberOfMonths={2}
          offsetY={10}
          range
          rangeHover
          format='DD MMMM YYYY'
        />
      </div>
      <Datatable columns={columns} data={data} />
      {data.length ? (
        <button
          className='btn btn-primary d-flex items-center justify-between gap-1 mx-auto'
          onClick={() => {
            try {
              const temp = data.map(
                ({
                  booking_date,
                  number,
                  client_name,
                  client_traveller_name,
                  airline_name,
                  profit,
                }) => ({
                  booking_date,
                  number,
                  client_name,
                  client_traveller_name,
                  airline_name,
                  profit: profit.toFixed(2),
                })
              );
              CSVDownloader(jsonToCSV(temp), 'Profit-Report.csv');
            } catch (err) {
              sendToast(
                'error',
                err?.message || err?.error || 'Error occurred while converting',
                4000
              );
            }
          }}
        >
          <FiDownload className='text-20' />
          Download CSV
        </button>
      ) : ''}
    </div>
  );
};

export default BillWiseProfitReport;

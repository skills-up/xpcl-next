import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { getList } from '../../../api/xplorzApi';
import Datatable from '../../../components/datatable/Datatable';
import { sendToast } from '../../../utils/toastify';
import BoardingPassUpload from './BoardingPassUpload';

const TravelList = () => {
  const [travelSectors, setTravelSectors] = useState([]);
  const [dates, setDates] = useState([
    new DateObject(),
    new DateObject().add(2, 'days'),
  ]);

  useEffect(() => {
    if (dates?.length === 2) {
      getTravelList();
    }
  }, [dates]);

  const reformatData = (data) => {
    const formattedData = [];
    const keyValues = [];
    for (let sector of data) {
      // Pick only the required fields from bookingData
      const booking = (({
        number,
        client_name,
        client_traveller_name,
        ticket_number,
        pnr,
      }) => ({
        number,
        client_name,
        client_traveller_name,
        ticket_number,
        pnr,
      }))(sector.booking);
      let isDuplicate = false;
      let key = `${booking.client_traveller_name}|${sector.travel_date}|${sector.from_airport}|`;
      let idx = keyValues.indexOf(key);
      if (idx >= 0) {
        isDuplicate = true;
        formattedData[Math.floor(idx/2)].isDuplicate = true;
      } else {
        keyValues.push(key);
      }
      key = `${booking.client_traveller_name}|${sector.travel_date}||${sector.to_airport}`;
      idx = keyValues.indexOf(key);
      if (idx >= 0) {
        isDuplicate = true;
        formattedData[Math.floor(idx/2)].isDuplicate = true;
      } else {
        keyValues.push(key);
      }
      formattedData.push({ ...booking, ...sector, isDuplicate });
    }
    return formattedData;
  };

  const getTravelList = async () => {
    const response = await getList('travel-list', {
      from_date: dates[0].format('YYYY-MM-DD'),
      to_date: dates[1].format('YYYY-MM-DD'),
    });
    if (response?.success) {
      const data = reformatData(response.data);
      setTravelSectors(data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting travel list',
        4000
      );
    }
  };

  const columns = [
    {
      Header: 'Booking #',
      accessor: 'number',
    },
    {
      Header: 'Client',
      accessor: 'client_name',
    },
    {
      Header: 'Traveller',
      accessor: 'client_traveller_name',
    },
    {
      Header: 'Travel Date',
      accessor: 'travel_date',
    },
    {
      Header: 'Time',
      accessor: 'travel_time',
    },
    {
      Header: 'From',
      accessor: 'from_airport',
    },
    {
      Header: 'To',
      accessor: 'to_airport',
    },
    {
      Header: 'Ticket #',
      accessor: 'ticket_number',
    },
    {
      Header: 'PNR',
      accessor: 'pnr',
    },
    {
      Header: 'Flight',
      accessor: 'details',
    },
    {
      Header: 'Class',
      accessor: 'booking_class',
    },
    {
      Header: 'Emission',
      accessor: 'emission',
    },
    {
      Header: 'Boarding Pass',
      accessor: 'boarding_pass',
      Cell: (data) => {
        return (
          <div>
            {data.row.original.boarding_pass ? (
              <a
                href={data.row.original.boarding_pass}
                target='_blank'
                download='boarding_pass'
              >
                Download
              </a>
            ) : (
              '-'
            )}
          </div>
        );
      },
    },
    {
      Header: 'Upload Boarding Pass',
      removeMaxWidth: true,
      Cell: (data) => <BoardingPassUpload id={data.row.original.id} />,
    },
  ];

  return (
    <div className='row mt-20'>
      <div className='col-lg-6 col-12 form-datepicker'>
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
      <div className='overflow-scroll scroll-bar-1 pt-30'>
        <Datatable
          downloadCSV
          CSVName='TravelList.csv'
          columns={columns}
          data={travelSectors}
          getRowClassName={(row) => row.original.isDuplicate ? 'row-duplicate' : (row.original.boarding_pass ? 'row-disabled' : '')}
        />
      </div>
    </div>
  );
};

export default TravelList;

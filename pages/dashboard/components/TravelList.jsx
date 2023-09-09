import { useState, useEffect } from 'react';
import Datatable from '../../../components/datatable/Datatable';
import { getList } from '../../../api/xplorzApi';
import BoardingPassUpload from './BoardingPassUpload';

const TravelList = () => {
  const [travelSectors, setTravelSectors] = useState([]);

  useEffect(() => {
    getTravelList();
  }, []);

  const reformatData = (data) => {
    const formattedData = [];
    for (let bookingData of data) {
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
      }))(bookingData);
      for (let sector of bookingData.sectors) {
        formattedData.push({ ...booking, ...sector });
      }
    }
    return formattedData;
  };

  const getTravelList = async () => {
    const response = await getList('travel-list');
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
      Cell: (data) => <BoardingPassUpload id={data.row.original.id} />,
    },
  ];

  return (
    <div className='overflow-scroll scroll-bar-1 pt-30'>
      <Datatable
        downloadCSV
        CSVName='TravelList.csv'
        columns={columns}
        data={travelSectors}
      />
    </div>
  );
};

export default TravelList;

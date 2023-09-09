import { useState, useEffect } from 'react';
import Datatable from '../../../components/datatable/Datatable';
import { getList } from '../../../api/xplorzApi';

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
        formattedData.push({ booking, sector });
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
      accessor: 'booking.number',
    },
    {
      Header: 'Client',
      accessor: 'booking.client_name',
    },
    {
      Header: 'Traveller',
      accessor: 'booking.client_traveller_name',
    },
    {
      Header: 'Travel Date',
      accessor: 'sector.travel_date',
    },
    {
      Header: 'Time',
      accessor: 'sector.travel_time',
    },
    {
      Header: 'From',
      accessor: 'sector.from_airport',
    },
    {
      Header: 'To',
      accessor: 'sector.to_airport',
    },
    {
      Header: 'Ticket #',
      accessor: 'booking.ticket_number',
    },
    {
      Header: 'PNR',
      accessor: 'booking.pnr',
    },
    {
      Header: 'Flight',
      accessor: 'sector.details',
    },
    {
      Header: 'Class',
      accessor: 'sector.booking_class',
    },
    {
      Header: 'Boarding Pass',
      accessor: 'sector.boarding_pass',
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

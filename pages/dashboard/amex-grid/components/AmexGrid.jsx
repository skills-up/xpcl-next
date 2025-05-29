import { useEffect, useState } from 'react';
import { customAPICall } from '../../../../api/xplorzApi';
import Datatable from '../../../../components/datatable/Datatable';
import { sendToast } from '../../../../utils/toastify';

const AmexGrid = () => {
  const [amexGrids, setAmexGrids] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [_document, setDocument] = useState(null);

  // useEffect(() => {
  //   getAmexGrids();
  // }, [searchQuery]);

  useEffect(() => {
    setDocument(document);
  }, []);

  const getAmexGrids = async () => {
    // Do not fetch data for an empty search query
    if (searchQuery?.trim().length === 0) {
      setAmexGrids(null);
      return;
    }
    const response = await customAPICall('bookings/amex-grid', 'POST', {
      ids: searchQuery
        .split(',')
        .map((id) => id.trim())
        .filter((id) => !!id),
    });
    if (response?.success) {
      setAmexGrids(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message ||
          response?.data?.error ||
          'Error getting travel membership programs',
        4000
      );
    }
  };

  const dmy = (date) =>
    typeof date === 'string'
      ? date.substring(8) + date.substring(5, 2) + date.substring(2, 2)
      : date
          .toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' })
          .replace(/\//g, '');

  const Ymd = (date_str) => date_str.replace(/-/g, '');

  const toWidth = (str, width, pad = '') => {
    const string = new String(str).substring(0, width);
    return pad == '' ? string.padEnd(width) : string.padStart(width, pad);
  };

  const transactionCode = (str) => {
    switch (str) {
      case 'Car Rental':
        return 'X3';
      case 'Hotel Booking':
        return 'X2';
      case 'Foreign Exchange':
        return 'X1';
      case 'Insurance':
        return 'I1';
      case 'Visa Application':
        return 'V9';
      default:
        return 'X0';
    }
  };

  const downloadTxtFile = (text) => {
    const element = _document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `amex-file-${Date.now()}.txt`;
    _document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const buildFile = () => {
    if (_document) {
      const date = new Date();
      const ddmmyy = dmy(date);
      let text = '',
        batch = 0,
        count4 = 0,
        count5 = 0;

      const airTable = _document.getElementById('air-grid');
      const nonAirTable = _document.getElementById('non-air-grid');

      // File header row
      text +=
        (
          '0000' +
          ddmmyy +
          'IXPL0000' +
          (
            '' + Math.floor((Date.now() - new Date(date.getFullYear(), 0, 0)) / 86400000)
          ).padStart(3, '0') +
          ('' + ++batch).padStart(2, '0') +
          '9821287604XPLORZ COM PRIVATE LIMITED    INR'
        ).padEnd(818) + '\n';

      // File contents
      airTable?.querySelectorAll('tbody > tr').forEach((row) => {
        const cells = Array.from(row.querySelectorAll('td')).map((td) => td.textContent);
        const invoice_number = cells[0],
          transaction_date = cells[1],
          traveller_name = cells[2],
          client_name_code = toWidth(cells[13].replace(/\s/g, ''), 6),
          airline_name = cells[14];
        text +=
          (
            '5555' +
            dmy(transaction_date) +
            client_name_code +
            ' '.repeat(4) +
            toWidth(cells[3], 15) +
            toWidth(cells[4], 3, '0') +
            toWidth(cells[5].substring(-10), 11) +
            '  ' +
            toWidth(traveller_name, 20) +
            toWidth(cells[6], 20) +
            dmy(cells[7]) +
            ' '.repeat(15) +
            toWidth(cells[8], 1) +
            ' '.repeat(6) +
            'A' +
            invoice_number.substring(3, 4) +
            invoice_number.substring(9, 5) +
            toWidth(cells[9], 2) +
            toWidth(cells[10].replace(/\D/g, ''), 14, '0') +
            toWidth(cells[11], 45) +
            toWidth(invoice_number) +
            toWidth(airline_name + ' Air Ticket for ' + traveller_name, 20) +
            '0'.repeat(14) +
            'N' +
            'INR' +
            Ymd(transaction_date) +
            toWidth(invoice_number.charAt(1) == 'S' ? 'S' : 'SR', 2) +
            ' '.repeat(9) +
            '0'.repeat(36) +
            '307' +
            toWidth(invoice_number, 20) +
            ' '.repeat(45) +
            '0'.repeat(14) +
            toWidth(cells[12], 11) +
            invoice_number.charAt(0) +
            'Y' +
            ' '.repeat(96)
          )
            .toUpperCase()
            .padEnd(818) + '\n';
        ++count5;
      });
      nonAirTable?.querySelectorAll('tbody > tr').forEach((row) => {
        const cells = Array.from(row.querySelectorAll('td')).map((td) => td.textContent);
        const invoice_number = cells[0],
          transaction_date = cells[1],
          traveller_name = cells[2];
        text +=
          (
            '4444' +
            dmy(transaction_date) +
            ' '.repeat(10) +
            toWidth(cells[3], 15) +
            ' '.repeat(3) +
            toWidth(cells[7], 11) +
            '  ' +
            toWidth(traveller_name, 20) +
            toWidth('ID-' + invoice_number.replace(/-/g, ''), 20) +
            dmy(transaction_date) +
            ' '.repeat(15) +
            toWidth(cells[5], 1) +
            ' '.repeat(6) +
            'N' +
            invoice_number.substring(3, 4) +
            invoice_number.substring(9, 5) +
            toWidth(transactionCode(cells[4].trim(), 2)) +
            toWidth(cells[6].replace(/\D/g, ''), 14, '0') +
            toWidth(cells[7].trim() + ' ' + cells[8].trim() + ' ' + cells[9].trim(), 45) +
            toWidth(invoice_number, 20) +
            toWidth(cells[7], 20) +
            '0'.repeat(14) +
            'N' +
            'INR' +
            Ymd(transaction_date) +
            toWidth(invoice_number.charAt(1) == 'S' ? 'S' : 'SR', 2) +
            ' '.repeat(9) +
            '0'.repeat(36) +
            '399' +
            toWidth(invoice_number, 20) +
            ' '.repeat(24) +
            toWidth(cells[7], 20) +
            ' ' +
            '0'.repeat(14) +
            ' '.repeat(11) +
            'I' +
            'Y' +
            ' '.repeat(96) +
            toWidth(cells[8], 20) +
            ' '.repeat(61) +
            toWidth(cells[9], 20)
          )
            .toUpperCase()
            .padEnd(818) + '\n';
        ++count4;
      });

      // File footer row
      text +=
        (
          '9999' +
          ddmmyy +
          ('' + count4).padStart(6, '0') +
          ('' + count5).padStart(6, '0')
        ).padEnd(818) + '\n';

      downloadTxtFile(text);
    }
  };

  const airColumns = [
    {
      Header: 'Invoice Number',
      accessor: 'invoice_number',
    },
    {
      Header: 'Transaction Date',
      accessor: 'transaction_date',
    },
    {
      Header: 'Traveller Name',
      accessor: 'traveller_name',
    },
    {
      Header: 'Card Number',
      accessor: 'card_number',
    },
    {
      Header: 'Airline Code',
      accessor: 'airline_code',
    },
    {
      Header: 'Ticket Number',
      accessor: 'ticket_number',
    },
    {
      Header: 'Sectors',
      accessor: 'sectors',
    },
    {
      Header: 'Depart Date',
      accessor: 'depart_date',
    },
    {
      Header: 'Charge Type',
      accessor: 'charge_type',
    },
    {
      Header: 'IATA Code',
      accessor: 'iata_code',
    },
    {
      Header: 'Client Amount',
      accessor: 'client_amount',
    },
    {
      Header: 'Narration',
      Cell: (data) =>
        `${data.row.original.traveller_name}'s trip to ${data.row.original.sector_1.to} on ` +
        new Date(data.row.original.depart_date).toLocaleString('en-IN', {
          dateStyle: 'medium',
        }),
    },
    {
      Header: 'PNR',
      accessor: 'pnr',
    },
    {
      Header: 'Client Name',
      accessor: 'client_name',
    },
    {
      Header: 'Airline',
      accessor: 'airline',
    },
    {
      Header: 'Sector 1 Carrier',
      accessor: 'sector_1.carrier',
    },
    {
      Header: 'Sector 1 Date',
      accessor: 'sector_1.date',
    },
    {
      Header: 'Sector 1 From',
      accessor: 'sector_1.from',
    },
    {
      Header: 'Sector 1 To',
      accessor: 'sector_1.to',
    },
    {
      Header: 'Sector 1 Class',
      accessor: 'sector_1.class',
    },
    {
      Header: 'Sector 2 Carrier',
      accessor: 'sector_2.carrier',
    },
    {
      Header: 'Sector 2 Date',
      accessor: 'sector_2.date',
    },
    {
      Header: 'Sector 2 From',
      accessor: 'sector_2.from',
    },
    {
      Header: 'Sector 2 To',
      accessor: 'sector_2.to',
    },
    {
      Header: 'Sector 2 Class',
      accessor: 'sector_2.class',
    },
    {
      Header: 'Sector 3 Carrier',
      accessor: 'sector_3.carrier',
    },
    {
      Header: 'Sector 3 Date',
      accessor: 'sector_3.date',
    },
    {
      Header: 'Sector 3 From',
      accessor: 'sector_3.from',
    },
    {
      Header: 'Sector 3 To',
      accessor: 'sector_3.to',
    },
    {
      Header: 'Sector 3 Class',
      accessor: 'sector_3.class',
    },
    {
      Header: 'Sector 4 Carrier',
      accessor: 'sector_4.carrier',
    },
    {
      Header: 'Sector 4 Date',
      accessor: 'sector_4.date',
    },
    {
      Header: 'Sector 4 From',
      accessor: 'sector_4.from',
    },
    {
      Header: 'Sector 4 To',
      accessor: 'sector_4.to',
    },
    {
      Header: 'Sector 4 Class',
      accessor: 'sector_4.class',
    },
  ];

  const nonAirColumns = [
    {
      Header: 'Invoice Number',
      accessor: 'invoice_number',
    },
    {
      Header: 'Transaction Date',
      accessor: 'transaction_date',
    },
    {
      Header: 'Traveller Name',
      accessor: 'traveller_name',
    },
    {
      Header: 'Card Number',
      accessor: 'card_number',
    },
    {
      Header: 'Transaction Type',
      accessor: 'transaction_type',
    },
    {
      Header: 'Charge Type',
      accessor: 'charge_type',
    },
    {
      Header: 'Client Amount',
      accessor: 'client_amount',
    },
    {
      Header: 'Narration Line 1',
      accessor: 'narration_line_1',
    },
    {
      Header: 'Narration Line 2',
      accessor: 'narration_line_2',
    },
    {
      Header: 'Narration Line 3',
      accessor: 'narration_line_3',
    },
  ];

  return (
    <div className='col-12'>
      {/* Search Bar + Add New */}
      <div className='row mb-3 items-center justify-between mr-4'>
        <div className='col-lg-10 col-7'>
          <input
            type='text'
            className='d-block form-control'
            placeholder='ID(s) separated by comma'
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
        </div>
        <button
          className='btn btn-primary col-lg-2 col-5'
          onClick={() => getAmexGrids()}
          disabled={!searchQuery}
        >
          Search
        </button>
      </div>
      {/* Data Tables */}
      {amexGrids && (
        <div id='amex-grids' className='row'>
          {amexGrids.air && (
            <div id='air-grid' className='col-12'>
              <Datatable columns={airColumns} data={amexGrids.air} contentEditable />
            </div>
          )}
          {amexGrids.non_air && (
            <div id='non-air-grid' className='col-12'>
              <Datatable
                columns={nonAirColumns}
                data={amexGrids.non_air}
                contentEditable
              />
            </div>
          )}
          <button className='btn btn-primary col-12' onClick={() => buildFile()}>
            Generate File
          </button>
        </div>
      )}
    </div>
  );
};

export default AmexGrid;

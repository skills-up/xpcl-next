import { useEffect, useState } from 'react';
import { AiOutlinePrinter } from 'react-icons/ai';
import { FiDownload } from 'react-icons/fi';
import { DateObject } from 'react-multi-date-picker';
import { jsonToCSV } from 'react-papaparse';
import { createItem } from '../../api/xplorzApi';
import { downloadCSV as CSVDownloader } from '../../utils/fileDownloader';
import { sendToast } from '../../utils/toastify';

function LedgerTable({ data, accountID, accountName, dates }) {
  const [newData, setNewData] = useState(null);

  const openDocument = (doc) => {
    if (doc) {
      const ref = `${window.location.protocol}//${window.location.host}/dashboard/${doc.type}/view/${doc.id}`;
      window.open(ref, '_blank');
    }
  };

  const toPdf = async (filename) => {
    const styles = '<style>table{border:1px solid;max-width:80%}th:nth-child(n+4),td:nth-child(n+4){text-align:right;white-space:nowrap}td:nth-child(1){word-break:none}td:nth-child(3n){max-width:30vw;word-wrap:break-word;word-break:break-all}td{padding:6px}tr,td,th{border:1px solid #999}</style>';
    const html = document.querySelector('#pdf-content').innerHTML.replaceAll('₹', '').replaceAll('⟶','->');
    const response = await createItem('/utilities/generate-pdf', {
      html: styles+html,
      filename: filename,
      landscape: true
    });
    if (response?.success && response?.data?.url) {
      window.open(response?.data?.url, '_blank');
    } else {
      sendToast('error', 'Failed to create Ledger PDF', 4000);
    }
  }

  useEffect(() => {
    if (data) {
      let balance = +data?.opening_balance;
      if (balance !== undefined && balance !== null) {
        // Sorting By Date
        data.entries.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        // Balance
        for (let i = 0; i < data.entries.length; i++) {
          balance += +data.entries[i].amount;
          data.entries[i]['total'] = balance;
        }
        data['total'] = balance;
        setNewData(data);
      }
    }
  }, [data]);

  return (
    <div className='ledger-table mt-50'>
      <div id='pdf-content'>
        {accountName && <h1>Ledger: {accountName}</h1>}
        {dates && dates?.length === 2 ? (
          <h2>
            From {dates[0].format('DD-MMMM-YYYY')} To {dates[1].format('DD-MMMM-YYYY')}
          </h2>
        ) : (
          <></>
        )}
        {newData ? (
          <div className='overflow-scroll scroll-bar-1 '>
            <table className='table-3'>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Doc. No.</th>
                  <th>Narration</th>
                  <th className='number-col'>Dr</th>
                  <th className='number-col'>Cr</th>
                  <th className='number-col'>Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr className='balance-display-row'>
                  <th></th>
                  <th></th>
                  <th>Opening Balance</th>
                  <th className='number-col'></th>
                  <th className='number-col'></th>
                  <th className='number-col'>
                    {Math.abs(newData?.opening_balance).toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}{' '}
                    {newData?.opening_balance >= 0 ? 'Dr' : 'Cr'}
                  </th>
                </tr>
                {data?.entries
                  ?.filter((element) => +element?.amount !== 0)
                  .map((element, index) => {
                    return (
                      <tr key={index}>
                        <td>
                          {new Date(element?.date).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                          })}
                        </td>
                        <td className='reference' onClick={() => {
                          openDocument(element?.document);
                        }}>{element?.reference}</td>
                        <td className='narration'>{element?.narration}</td>
                        <td className='number-col'>
                          {+(element?.amount) > 0 &&
                            `${Math.abs(element.amount).toLocaleString('en-IN', {
                              maximumFractionDigits: 2,
                              style: 'currency',
                              currency: 'INR',
                            })}`}
                        </td>
                        <td className='number-col'>
                          {+(element?.amount) < 0 &&
                            `${Math.abs(element.amount).toLocaleString('en-IN', {
                              maximumFractionDigits: 2,
                              style: 'currency',
                              currency: 'INR',
                            })}`}
                        </td>
                        <td className='number-col'>
                          {Math.abs(element?.total).toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR',
                          })}{' '}
                          {element?.total >= 0 ? 'Dr' : 'Cr'}
                        </td>
                      </tr>
                    );
                  })}
                <tr className='balance-display-row'>
                  <th></th>
                  <th></th>
                  <th>Closing Balance</th>
                  <th></th>
                  <th></th>
                  <th className='number-col'>
                    {Math.abs(newData?.total).toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}{' '}
                    {newData?.total >= 0 ? 'Dr' : 'Cr'}
                  </th>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <span className='no-records'>No Records</span>
        )}
      </div>
      {newData && (
        <div className='my-4 d-flex justify-center'>
          <button
            className='btn btn-primary d-flex items-center justify-between gap-1'
            onClick={() => {
              try {
                let temp = [];
                // Manipulating Array
                // Adding Opening Balance
                temp.push({
                  date: '',
                  reference: '',
                  narration: 'Opening Balance',
                  dr: '',
                  cr: '',
                  balance: newData?.opening_balance,
                });
                // Adding Entries
                for (let entry of newData?.entries) {
                  temp.push({
                    date: new DateObject({
                      date: entry?.date,
                      format: 'YYYY-MM-DD',
                    }).format('DD-MMMM-YYYY'),
                    reference: entry?.reference,
                    narration: entry?.narration,
                    dr:
                      +entry?.amount > 0
                        ? Math.abs(entry?.amount) : '',
                    cr:
                      +entry?.amount < 0
                        ? Math.abs(entry?.amount) : '',
                    balance: entry?.total,
                  });
                }
                // Adding Closing Balance
                temp.push({
                  date: '',
                  reference: '',
                  narration: 'Closing Balance',
                  dr: '',
                  cr: '',
                  balance: newData?.total,
                });
                CSVDownloader(jsonToCSV(temp), 'Ledger.csv');
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
          <button className='btn btn-info ml-20 text-white' onClick={() => toPdf(`Ledger-${accountName}-${dates[0].format('DD-MMMM-YYYY')}-to-${dates[1].format('DD-MMMM-YYYY')}.pdf`)}>
            <AiOutlinePrinter className='text-22' /> Generate PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default LedgerTable;

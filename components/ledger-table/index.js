import { useState, useEffect } from 'react';
import { FiDownload } from 'react-icons/fi';
import { DateObject } from 'react-multi-date-picker';
import { jsonToCSV } from 'react-papaparse';
import { downloadCSV as CSVDownloader } from '../../utils/fileDownloader';
import { sendToast } from '../../utils/toastify';
import ReactToPdf from 'react-to-pdf';
import { createRef } from 'react';
import { AiOutlinePrinter } from 'react-icons/ai';

function LedgerTable({ data, accountID }) {
  const [newData, setNewData] = useState(null);
  const pdfRef = createRef();

  useEffect(() => {
    if (data) {
      if (data?.entries?.length === 0) {
        setNewData(null);
        return;
      }
      let balance = +data?.opening_balance;
      if (balance !== undefined && balance !== null && data?.entries?.length > 0) {
        // Sorting By Date
        data.entries.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        // Balance
        for (let i = 0; i < data.entries.length; i++) {
          let amount = +data.entries[i].amount;
          if (data.entries[i].dr_account_id === accountID) balance += amount;
          else balance -= amount;
          data.entries[i]['total'] = balance;
        }
        data['total'] = balance;
        setNewData(data);
      }
    }
  }, [data]);

  return (
    <div className='overflow-scroll scroll-bar-1 ledger-table mt-50'>
      {newData ? (
        <table className='table-3' id='ledger-table' ref={pdfRef}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Narration</th>
              <th className='number-col'>Dr</th>
              <th className='number-col'>Cr</th>
              <th className='number-col'>Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr className='balance-display-row'>
              <th></th>
              <th>Opening Balance</th>
              <th className='number-col'></th>
              <th className='number-col'></th>
              <th className='number-col'>
                {(+newData?.opening_balance).toLocaleString('en-IN', {
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
                    <td className='narration'>{element?.narration}</td>
                    <td className='number-col'>
                      {accountID === element.dr_account_id &&
                        `${(+element.amount).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'INR',
                        })}`}
                    </td>
                    <td className='number-col'>
                      {accountID === element.cr_account_id &&
                        `${(+element.amount).toLocaleString('en-IN', {
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
      ) : (
        <span className='no-records'>No Records</span>
      )}
      {newData && (
        <div className='my-4 d-flex justify-center'>
          <button
            className='btn btn-primary d-flex items-center justify-between gap-1'
            onClick={() => {
              try {
                console.log(newData);
                let temp = [];
                // Manipulating Array
                // Adding Opening Balance
                temp.push({
                  date: '',
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
                    narration: 'Opening Balance',
                    dr:
                      +entry?.amount >= 0
                        ? Math.abs(entry?.amount).toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR',
                          })
                        : '',
                    cr:
                      +entry?.amount < 0
                        ? Math.abs(newData?.amount).toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR',
                          })
                        : '',
                    balance: entry?.total,
                  });
                }
                // Adding Closing Balance
                temp.push({
                  date: '',
                  narration: 'Closing Balance',
                  dr: '',
                  cr: '',
                  balance: newData?.total,
                });

                console.log(temp);
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
          <ReactToPdf targetRef={pdfRef} scale={0.55} y={30} filename='div-blue.pdf'>
            {({ toPdf }) => (
              <button className='btn btn-info ml-20 text-white' onClick={toPdf}>
                <AiOutlinePrinter className='text-22' /> Generate PDF
              </button>
            )}
          </ReactToPdf>
        </div>
      )}
    </div>
  );
}

export default LedgerTable;

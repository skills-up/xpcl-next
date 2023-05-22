import { useState, useEffect } from 'react';

function LedgerTable({ data, accountID }) {
  const [newData, setNewData] = useState(null);
  useEffect(() => {
    if (data) {
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
        <table className='table-3'>
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
                  <tr>
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
    </div>
  );
}

export default LedgerTable;

import { useState, useEffect } from 'react';

function LedgerTable({ data, accountID }) {
  const [newData, setNewData] = useState(null);
  useEffect(() => {
    if (data) {
      let balance = +data?.opening_balance;
      if (balance !== undefined && balance !== null && data?.entries?.length > 0) {
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
              <th>
                <span className='mb-40 d-block'>Narration</span>Opening Balance
              </th>
              <th>Dr</th>
              <th>Cr</th>
              <th>
                <span className='mb-40 d-block'>Balance</span>
                {(+newData?.opening_balance).toLocaleString('en-IN', {
                  maximumFractionDigits: 2,
                  style: 'currency',
                  currency: 'INR',
                })}{' '}
                {newData?.opening_balance >= 0 ? 'Dr' : 'Cr'}
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.entries
              ?.filter((element) => +element?.amount !== 0)
              .map((element, index) => {
                console.log(element);
                return (
                  <tr>
                    <td>
                      {new Date(element?.date).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                      })}
                    </td>
                    <td className='narration'>{element?.narration}</td>
                    <td>
                      {accountID === element.dr_account_id &&
                        `${(+element.amount).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'INR',
                        })}`}
                    </td>
                    <td>
                      {accountID === element.cr_account_id &&
                        `${(+element.amount).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'INR',
                        })}`}
                    </td>
                    <td>
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
          </tbody>
          <tfoot>
            <tr>
              <th></th>
              <th>Closing Balance</th>
              <th></th>
              <th></th>
              <th>
                {Math.abs(newData?.total).toLocaleString('en-IN', {
                  maximumFractionDigits: 2,
                  style: 'currency',
                  currency: 'INR',
                })}{' '}
                {newData?.total >= 0 ? 'Dr' : 'Cr'}
              </th>
            </tr>
          </tfoot>
        </table>
      ) : (
        <span className='no-records'>No Records</span>
      )}
    </div>
  );
}

export default LedgerTable;

import { useEffect, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { getItem, getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import { sendToast } from '../../../../utils/toastify';

const Journals = () => {
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [dates, setDates] = useState(new DateObject());

  const getBalanceSheet = async () => {
    const response = await getList('reports/balance-sheet', {
      date: dates.format('YYYY-MM-DD'),
    });
    if (response?.success) {
      let data = response.data;
      // Calculating Totals
      data = await recurseThroughout(data);
      console.log(data);
      setBalanceSheet(data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting journals',
        4000
      );
    }
  };

  // Recursing on each object
  const recurseThroughout = async (data) => {
    if (data) {
      // 1) If data is obj then set a total first, and set its total
      data['_'] = await getRecursiveCalc(data);
      // 2) Recurse search for objects as a child,
      for (let obj of Object.keys(data)) {
        if (typeof data[obj] === 'object') {
          if (!Array.isArray(data[obj])) {
            data[obj] = await recurseThroughout(data[obj]);
          }
        }
      }
      return data;
    }
  };

  // Recursive Total of the data
  const getRecursiveCalc = async (data, total = 0) => {
    if (data) {
      for (let obj of Object.values(data)) {
        if (typeof obj !== 'object') {
          total += +obj;
        } else {
          if (!Array.isArray(obj)) {
            total = await getRecursiveCalc(obj, total);
          }
        }
      }
      return total;
    } else {
      return 0;
    }
  };

  useEffect(() => {
    if (dates) getBalanceSheet();
  }, [dates]);

  const RecursiveComponent = ({ data, level }) => {
    const colorLevels = {
      1: '(0,0,0)',
      2: '(75,75,75)',
      3: '(100,100,100)',
      4: '(150,150,150)',
      5: '(200,200,200)',
      6: '(225,225,225)',
    };

    if (data) {
      return (
        <div>
          <div>
            {Object.keys(data).map((element, index) => (
              <>
                {typeof data[element] === 'object' ? (
                  !Array.isArray(data[element]) ? (
                    <div key={index}>
                      <div
                        style={{
                          fontWeight: '700',
                          paddingLeft: `${level}rem`,
                          color: `rgb${colorLevels[level]}`,
                        }}
                        className='d-flex justify-between'
                      >
                        <span>{element}</span>
                        <span>
                          {Math.abs(+data[element]['_']).toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR',
                          })}{' '}
                          {data[element]['_'] >= 0 ? 'Dr' : 'Cr'}
                        </span>
                      </div>
                      <RecursiveComponent data={data[element]} level={level + 1} />
                    </div>
                  ) : (
                    <></>
                  )
                ) : (
                  element !== '_' && (
                    <div
                      className='d-flex justify-between'
                      style={{ paddingLeft: `${level}rem`, color: 'blue', gap: '6rem' }}
                    >
                      <span>{element}</span>
                      <span className='mr-70'>
                        {Math.abs(+data[element]).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'INR',
                        })}{' '}
                        {data[element] >= 0 ? 'Dr' : 'Cr'}
                      </span>
                    </div>
                  )
                )}
              </>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className='col-12'>
      {/* Date Picker */}
      <div className='row mb-3 items-center justify-between mr-4'>
        <div className='col-lg-4 col-12 d-block ml-4'>
          <label style={{ fontWeight: '700' }}>Select Start & End Dates</label>
          <DatePicker
            style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
            inputClass='custom_input-picker'
            containerClassName='custom_container-picker'
            value={dates}
            onChange={setDates}
            numberOfMonths={1}
            offsetY={10}
            format='DD MMMM YYYY'
          />
        </div>
      </div>
      {/* Generated Balance Sheet */}
      <div className='balance-sheet d-flex'>
        <div className='liabilities'>
          <div
            className='title p-3'
            style={{
              fontWeight: '700',
            }}
          >
            Liabilities
          </div>
          <div className='records p-3'>
            {balanceSheet && (
              <RecursiveComponent data={balanceSheet?.Liabilities} level={0} />
            )}
          </div>
          <div className='total d-flex justify-between p-3' style={{ fontWeight: '700' }}>
            <span>Total</span>
            <span>
              {balanceSheet ? (
                <>
                  {Math.abs(+balanceSheet?.Liabilities?._).toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}{' '}
                  Cr
                </>
              ) : (
                '0 Cr'
              )}
            </span>
          </div>
        </div>
        <div className='assets'>
          <div
            className='title p-3'
            style={{
              fontWeight: '700',
            }}
          >
            Assets
          </div>
          <div className='records p-3'>
            {balanceSheet && <RecursiveComponent data={balanceSheet?.Assets} level={0} />}
          </div>
          <div
            className='total  p-3 d-flex justify-between'
            style={{ fontWeight: '700' }}
          >
            <span>Total</span>
            <span>
              {balanceSheet ? (
                <>
                  {Math.abs(+balanceSheet?.Assets?._).toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}{' '}
                  Dr
                </>
              ) : (
                '0 Dr'
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journals;

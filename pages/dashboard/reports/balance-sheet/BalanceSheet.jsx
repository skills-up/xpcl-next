import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { getItem, getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import { sendToast } from '../../../../utils/toastify';

const Journals = () => {
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [dates, setDates] = useState(new DateObject());

  const router = useRouter();

  const getBalanceSheet = async () => {
    const response = await getList('reports/balance-sheet', {
      date: dates.format('YYYY-MM-DD'),
    });
    if (response?.success) {
      let data = response.data;
      // Calculating Totals
      data = await recurseThroughout(data);
      setBalanceSheet(data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting balance sheet',
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
      0: '(0,0,0)',
      1: '(75,75,75)',
      2: '(100,100,100)',
      3: '(150,150,150)',
      4: '(200,200,200)',
      5: '(225,225,225)',
    };
    const [expand, setExpand] = useState([]);
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
                        onClick={() =>
                          setExpand((prev) => {
                            if (prev.includes(element)) {
                              prev = prev.filter((e) => e !== element);
                            } else {
                              prev.push(element);
                            }
                            return [...prev];
                          })
                        }
                        className='d-flex justify-between cursor-pointer'
                      >
                        <span>{element}</span>
                        <span>
                          {Math.abs(+data[element]['_']).toLocaleString('en-AE', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'AED',
                          })}{' '}
                          {data[element]['_'] >= 0 ? 'Dr' : 'Cr'}
                        </span>
                      </div>
                      {!expand.includes(element) && (
                        <RecursiveComponent data={data[element]} level={level + 1} />
                      )}
                    </div>
                  ) : (
                    <></>
                  )
                ) : (
                  element !== '_' && Math.abs(+data[element]) !== 0 && (
                    <a
                      className='d-flex justify-between cursor-pointer'
                      style={{ paddingLeft: `${level}rem`, color: 'blue' }}
                      href={
                        '/dashboard/journals/ledger?account_id=' + element.split('|')[0]
                      }
                      target='_blank'
                    >
                      <span>{element.split('|')[1]}</span>
                      <span>
                        {Math.abs(+data[element]).toLocaleString('en-AE', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'AED',
                        })}{' '}
                        {data[element] >= 0 ? 'Dr' : 'Cr'}
                      </span>
                    </a>
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
        <div className='col-lg-4 col-12 d-block ml-3 form-datepicker'>
          <label>Select Date</label>
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
      <div className='balance-sheet'>
        <div className='liabilities'>
          <div
            className='title px-3 py-2'
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
            {balanceSheet ? (
              balanceSheet?._ >= 0 && (
                <div
                  style={{ fontWeight: '700' }}
                  className='d-flex mt-20 justify-between'
                >
                  <span>Profit</span>
                  <span>
                    {Math.abs(+balanceSheet?._).toLocaleString('en-AE', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'AED',
                    })}{' '}
                    Cr
                  </span>
                </div>
              )
            ) : (
              <></>
            )}
          </div>
          <div
            className='total d-flex justify-between px-3 py-2'
            style={{ fontWeight: '700' }}
          >
            <span>Total</span>
            <span>
              {balanceSheet ? (
                <>
                  {(Math.abs(+balanceSheet?.Assets?._) >
                  Math.abs(+balanceSheet?.Liabilities?._)
                    ? Math.abs(+balanceSheet?.Assets?._)
                    : Math.abs(+balanceSheet?.Liabilities?._)
                  ).toLocaleString('en-AE', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'AED',
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
            className='title px-3 py-2'
            style={{
              fontWeight: '700',
            }}
          >
            Assets
          </div>
          <div className='records p-3'>
            {balanceSheet && <RecursiveComponent data={balanceSheet?.Assets} level={0} />}
            {balanceSheet ? (
              balanceSheet?._ < 0 && (
                <div
                  style={{ fontWeight: '700' }}
                  className='d-flex mt-20 justify-between'
                >
                  <span>Loss</span>
                  <span>
                    {Math.abs(+balanceSheet?._).toLocaleString('en-AE', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'AED',
                    })}{' '}
                    Dr
                  </span>
                </div>
              )
            ) : (
              <></>
            )}
          </div>
          <div
            className='total px-3 py-2 d-flex justify-between'
            style={{ fontWeight: '700' }}
          >
            <span>Total</span>
            <span>
              {balanceSheet ? (
                <>
                  {(Math.abs(+balanceSheet?.Assets?._) >
                  Math.abs(+balanceSheet?.Liabilities?._)
                    ? Math.abs(+balanceSheet?.Assets?._)
                    : Math.abs(+balanceSheet?.Liabilities?._)
                  ).toLocaleString('en-AE', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'AED',
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

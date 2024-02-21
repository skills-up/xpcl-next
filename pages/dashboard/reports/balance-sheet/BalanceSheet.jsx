import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlinePrinter } from 'react-icons/ai';
import { FiDownload } from 'react-icons/fi';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { jsonToCSV } from 'react-papaparse';
import { getList } from '../../../../api/xplorzApi';
import { downloadCSV as CSVDownloader } from '../../../../utils/fileDownloader';
import { sendToast } from '../../../../utils/toastify';

const Journals = () => {
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [dates, setDates] = useState(new DateObject());

  const router = useRouter();

  const getBalanceSheet = async (pdf = false) => {
    const response = await getList('reports/balance-sheet', {
      date: dates.format('YYYY-MM-DD'),
      pdf: pdf ? 1 : 0,
    });
    if (response?.success) {
      let data = response.data;
      if (pdf) {
        window.open().document.write(data);
      } else {
        // Calculating Totals
        data = await recurseThroughout(data);
        setBalanceSheet(data);
      }
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

  useEffect(() => {
    document.body.classList.add('-is-sidebar-open');
  });

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
                        <span style={{ paddingRight: '1em', maxWidth: '60%' }}>
                          {element}
                        </span>
                        <span style={{ whiteSpace: 'nowrap' }}>
                          {Math.abs(+data[element]['_']).toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR',
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
                  element !== '_' &&
                  Math.abs(+data[element]) !== 0 && (
                    <a
                      className='d-flex justify-between cursor-pointer'
                      style={{ paddingLeft: `${level}rem`, color: 'blue' }}
                      href={
                        '/dashboard/journals/ledger?account_id=' + element.split('|')[0]
                      }
                      target='_blank'
                    >
                      <span style={{ paddingRight: '1em', maxWidth: '60%' }}>
                        {element.split('|')[1]}
                      </span>
                      <span style={{ whiteSpace: 'nowrap' }}>
                        {Math.abs(+data[element]).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'INR',
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

  const recusivelyFill = (temp, obj, level) => {
    for (let [k, v] of Object.entries(obj || {})) {
      if (typeof v === 'object' && !Array.isArray(v)) {
        temp.push({ head: ' '.repeat(level) + k, amount: '' });
        temp = recusivelyFill(temp, v, level + 1);
      } else if (k.indexOf('|') > 0 && v !== 0) {
        temp.push({ head: ' '.repeat(level) + k.split('|')[1], amount: v });
      }
    }
    return temp;
  };

  const toCSV = (filename) => {
    try {
      let temp = [];
      temp.push({ head: 'Assets', amount: '' });
      temp = recusivelyFill(temp, balanceSheet?.Assets, 0);
      temp.push({ head: 'Liabilities', amount: '' });
      temp = recusivelyFill(temp, balanceSheet?.Liabilities, 0);
      if (balanceSheet?._ !== 0) {
        temp.push({ head: 'Profit/(Loss)', amount: balanceSheet?._ });
      }
      CSVDownloader(jsonToCSV(temp), filename);
    } catch (err) {
      sendToast(
        'error',
        err?.message || err?.error || 'Error occurred while converting',
        4000
      );
    }
  };

  const downloadPDF = async () => {
    getBalanceSheet(1);
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
                    {Math.abs(+balanceSheet?._).toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
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
                  ).toLocaleString('en-IN', {
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
                    {Math.abs(+balanceSheet?._).toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
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
                  ).toLocaleString('en-IN', {
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
      {balanceSheet && (
        <div className='my-4 d-flex justify-center'>
          <button
            className='btn btn-primary d-flex items-center justify-between gap-1'
            onClick={() => toCSV(`Balance-Sheet-${dates.format('DD-MMMM-YYYY')}.csv`)}
          >
            <FiDownload className='text-20' />
            Download CSV
          </button>
          <button className='btn btn-info ml-20 text-white' onClick={downloadPDF}>
            <AiOutlinePrinter className='text-22' /> Generate PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default Journals;

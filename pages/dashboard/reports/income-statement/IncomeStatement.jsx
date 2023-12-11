import { useEffect, useState } from 'react';
import { AiOutlinePrinter } from 'react-icons/ai';
import { FiDownload } from 'react-icons/fi';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { jsonToCSV } from 'react-papaparse';
import { createItem, getList } from '../../../../api/xplorzApi';
import { sendToast } from '../../../../utils/toastify';
import { downloadCSV as CSVDownloader } from '../../../../utils/fileDownloader';

const Journals = () => {
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [dates, setDates] = useState([
    new DateObject().setMonth('4').setDay('1'),
    new DateObject(),
  ]);

  const getBalanceSheet = async () => {
    const response = await getList('reports/income-statement', {
      from_date: dates[0].format('YYYY-MM-DD'),
      to_date: dates[1].format('YYYY-MM-DD'),
    });
    if (response?.success) {
      let data = response.data;
      // Calculating Totals
      data = await recurseThroughout(data);
      setBalanceSheet(data);
    } else {
      sendToast(
        'error',
        response?.data?.message ||
          response?.data?.error ||
          'Error getting income statement',
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
    if (dates && dates.length === 2) getBalanceSheet();
  }, [dates]);

  useEffect(() => {
    document.body.classList.add('-is-sidebar-open');
  });

  const RecursiveComponent = ({ data, level }) => {
    const colorLevels = {
      1: '(0,0,0)',
      2: '(75,75,75)',
      3: '(100,100,100)',
      4: '(150,150,150)',
      5: '(200,200,200)',
      6: '(225,225,225)',
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
                        <div style={{ paddingRight: '1em', maxWidth: '60%' }}>
                          {element}
                        </div>
                        <div style={{ whiteSpace: 'nowrap' }}>
                          {Math.abs(+data[element]['_']).toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR',
                          })}{' '}
                          {data[element]['_'] >= 0 ? 'Dr' : 'Cr'}
                        </div>
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
                      <div style={{ paddingRight: '1em', maxWidth: '60%' }}>
                        {element.split('|')[1]}
                      </div>
                      <div style={{ whiteSpace: 'nowrap' }}>
                        {Math.abs(+data[element]).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'INR',
                        })}{' '}
                        {data[element] >= 0 ? 'Dr' : 'Cr'}
                      </div>
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

  const toPdf = async (filename) => {
    const styles =
      // '<style>table{border:1px solid;max-width:80%}th:nth-child(n+4),td:nth-child(n+4){text-align:right;white-space:nowrap}td:nth-child(1){word-break:none}td:nth-child(3n){max-width:30vw;word-wrap:break-word;word-break:break-all}td{padding:6px}tr,td,th{border:1px solid #999}</style>';
      //span:nth-child(2){position:relative;right:0}
      '<style>.income-statement{display:table;width:100%;font-size:smaller}.assets,.liabilities{width:50%;display:table-cell;position:relative}.records,.title,.total{border:1px solid #d3d3d3;padding:6px 12px}a{display:block;text-decoration:none}.justify-between{display:flex;justify-content:space-between}.justify-between div{display:inline-block}.justify-between div:nth-child(2){position:relative;right:0}</style>';
    const html = document
      .querySelector('#pdf-content')
      .innerHTML.replaceAll('₹', '');
    const response = await createItem('/utilities/generate-pdf', {
      html: styles + html,
      filename: filename,
      landscape: false,
    });
    if (response?.success && response?.data?.url) {
      window.open(response?.data?.url, '_blank');
    } else {
      sendToast('error', 'Failed to create Ledger PDF', 4000);
    }
  };

  const recusivelyFill = (temp, obj, level) => {
    for (let [k, v] of Object.entries(obj || {})) {
      if (typeof v === 'object' && !Array.isArray(v)) {
        temp.push({head: ' '.repeat(level)+k, amount: ''});
        temp = recusivelyFill(temp, v, level + 1);
      } else if (k.indexOf('|') > 0 && v !== 0) {
        temp.push({head: ' '.repeat(level)+k.split('|')[1], amount: -v});
      }
    }
    return temp;
  }

  const formatTo2Decimal = (num) => {
    return num.toLocaleString('en-IN', {maximumFractionDigits: 2});
  }

  const toCSV = (filename) => {
    try {
      let temp = [];
      temp.push({head: 'Incomes', amount: ''});
      temp = recusivelyFill(temp, balanceSheet?.Incomes, 0);
      temp.push({head: 'Expenses', amount: ''});
      temp = recusivelyFill(temp, balanceSheet?.Expenses, 0);
      if (balanceSheet?._ !== 0) {
        temp.push({head: 'Profit/(Loss)', amount: -balanceSheet?._});
      }
      CSVDownloader(jsonToCSV(temp), filename);
    } catch (err) {
      sendToast(
        'error',
        err?.message || err?.error || 'Error occurred while converting',
        4000
      );
    }
  }

  return (
    <div className='col-12'>
      {/* Date Picker */}
      <div className='row mb-3 items-center justify-between mr-4'>
        <div className='col-lg-4 col-12 d-block ml-3 form-datepicker'>
          <label>Select Start & End Dates</label>
          <DatePicker
            style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
            inputClass='custom_input-picker'
            containerClassName='custom_container-picker'
            value={dates}
            onChange={setDates}
            numberOfMonths={2}
            offsetY={10}
            range
            rangeHover
            format='DD MMMM YYYY'
          />
        </div>
      </div>
      {/* Generated Balance Sheet */}
      {balanceSheet && (
        <div id='pdf-content'>
          <h2 className='text-center'>Profit & Lost Statement</h2>
          {dates && dates?.length === 2 ? (
            <h4 className='text-center my-2'>
              From {dates[0].format('DD-MMMM-YYYY')} To {dates[1].format('DD-MMMM-YYYY')}
            </h4>
          ) : (
            <></>
          )}
          <div className='income-statement'>
            <div className='liabilities'>
              <div
                className='title px-3 py-2'
                style={{
                  fontWeight: '700',
                }}
              >
                Expenses
              </div>
              <div className='records p-3'>
                <RecursiveComponent data={balanceSheet?.Expenses} level={0} />
              </div>
              <div className='total px-3'>
                {balanceSheet?._ < 0 ? (
                  <div
                    className='d-flex justify-between items-center'
                    style={{ fontWeight: '700', width: '100%' }}
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
                ) : <div> &nbsp; </div>}
              </div>
            </div>
            <div className='assets'>
              <div
                className='title px-3 py-2'
                style={{
                  fontWeight: '700',
                }}
              >
                Incomes
              </div>
              <div className='records p-3'>
                <RecursiveComponent data={balanceSheet?.Incomes} level={0} />
              </div>
              <div className='total px-3' >
                {balanceSheet?._ >= 0 ? (
                  <div
                    className='d-flex justify-between items-center'
                    style={{ fontWeight: '700', width: '100%' }}
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
                ) : <div> &nbsp; </div>}
              </div>
            </div>
          </div>
        </div>
      )}
      {balanceSheet && (
        <div className='my-4 d-flex justify-center'>
          <button
            className='btn btn-primary d-flex items-center justify-between gap-1'
            onClick={() =>
              toCSV(
                `PnL-${dates[0].format('DD-MMMM-YYYY')}-to-${dates[1].format(
                  'DD-MMMM-YYYY'
                )}.csv`
              )
            }
          >
            <FiDownload className='text-20' />
            Download CSV
          </button>
          {/* <button
            className='btn btn-info ml-20 text-white'
            onClick={() =>
              toPdf(
                `PnL-${dates[0].format('DD-MMMM-YYYY')}-to-${dates[1].format(
                  'DD-MMMM-YYYY'
                )}.pdf`
              )
            }
          >
            <AiOutlinePrinter className='text-22' /> Generate PDF
          </button> */}
        </div>
      )}
    </div>
  );
};

export default Journals;

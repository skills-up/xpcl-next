import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import Select from 'react-select';
import { getList } from '../../../../api/xplorzApi';
import { sendToast } from '../../../../utils/toastify';

const Journals = () => {
  const [balanceSheet, setBalanceSheet] = useState(null);
  const date = new DateObject();
  const monthStart = new DateObject().setDay(1);
  const fyStart = new DateObject()
    .setYear(date.year - (date.month.number < 4 ? 1 : 0))
    .setMonth(4)
    .setDay(1);
  const prevFyStart = new DateObject()
    .setYear(fyStart.year - 1)
    .setMonth(4)
    .setDay(1);
  const prevFyEnd = new DateObject().setYear(fyStart.year).setMonth(3).setDay(31);
  const less90d = new DateObject().subtract(90, 'days');
  const rangeOptions = [
    { value: 'current', label: 'Current FY' },
    { value: 'previous', label: 'Previous FY' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'month', label: 'Current Month' },
    { value: 'custom', label: 'Custom' },
  ];
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [dates, setDates] = useState([fyStart, date]);

  const setDateOptions = (value) => {
    setShowDateSelector(false);
    console.log('Selected', value);
    switch (value.value) {
      case 'current':
        setDates([fyStart, date]);
        break;
      case 'previous':
        setDates([prevFyStart, prevFyEnd]);
        break;
      case '90days':
        setDates([less90d, date]);
        break;
      case 'month':
        setDates([monthStart, date]);
        break;
      case 'custom':
        setShowDateSelector(true);
        break;
    }
  };

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
                        <span style={{ paddingRight: '1em', maxWidth: '60%' }}>
                          {element}
                        </span>
                        <span style={{ whiteSpace: 'nowrap' }}>
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
        <div className='col-lg-3 col-12 form-input-select'>
          <label>Select Period</label>
          <Select
            options={rangeOptions}
            defaultValue={rangeOptions[0]}
            onChange={setDateOptions}
          />
        </div>
        {showDateSelector && (
          <div className='col-lg-4 col-12 form-datepicker'>
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
              minDate='2023-10-01'
            />
          </div>
        )}
      </div>
      {/* Generated Balance Sheet */}
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
            {balanceSheet && (
              <RecursiveComponent data={balanceSheet?.Expenses} level={0} />
            )}
          </div>
          <div className='total px-3'>
            {balanceSheet ? (
              balanceSheet?._ < 0 && (
                <div
                  className='d-flex justify-between items-center'
                  style={{ fontWeight: '700', width: '100%' }}
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
            {balanceSheet && (
              <RecursiveComponent data={balanceSheet?.Incomes} level={0} />
            )}
          </div>
          <div className='total px-3'>
            {balanceSheet ? (
              balanceSheet?._ >= 0 && (
                <div
                  className='d-flex justify-between items-center'
                  style={{ fontWeight: '700', width: '100%' }}
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
        </div>
      </div>
    </div>
  );
};

export default Journals;

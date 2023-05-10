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
      console.log(await recurseThroughout(data));
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
                        style={{ paddingLeft: `${level}rem` }}
                        className='d-flex justify-between'
                      >
                        <span>{element}</span> :{' '}
                        <span>{Math.abs(+data[element]['_'])}</span>
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
                      style={{ paddingLeft: `${level}rem` }}
                    >
                      <span>{element}</span> <span>{data[element]}</span>
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
      <div className='balance-sheet'>
        <div className='liabilities'>
          <div className='title'>Liabilities</div>
          <div className='records'>
            {balanceSheet && (
              <RecursiveComponent data={balanceSheet?.Liabilities} level={1} />
            )}
          </div>
          <div className='total'>
            <span>Total</span>
            <span>X Cr</span>
          </div>
        </div>
        <div className='assets'>
          <div className='title'>Assets</div>
          <div className='records'></div>
          <div className='total'>
            <span>Total</span>
            <span>X Dr</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journals;

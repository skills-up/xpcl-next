import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { createItem, getItem, getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import { sendToast } from '../../../../utils/toastify';

const Journals = () => {
  const [depreciations, setDepreciations] = useState(null);
  const [dates, setDates] = useState(new DateObject());
  const [state, setState] = useState(true);
  const [closingDate, setClosingDate] = useState(new DateObject());
  const [totalTaxExpenses, setTotalTaxExpenses] = useState('');

  const router = useRouter();

  const generate = async () => {
    if (dates) {
      const response = await createItem('/reports/close-books', {
        year: +dates.format('YYYY'),
      });
      if (response?.success) {
        setClosingDate(
          new DateObject({ date: response.data.closing_date, format: 'YYYY-MM-DD' })
        );
        let tempDepr = [];
        for (let obj of Object.values(response.data.balances)) {
          if (typeof obj === 'object' && !Array.isArray(obj)) {
            for (let key of Object.keys(obj)) {
              tempDepr.push({
                id: key.split('|')[0],
                name: key.split('|')[1],
                amount: '',
                value: obj[key],
              });
            }
          }
        }
        setDepreciations(tempDepr);
        setState(false);
      } else {
        sendToast(
          'error',
          response.data?.message || response.data?.error || 'Error getting depreciations',
          4000
        );
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    let tempDepr = depreciations.slice(0);
    if (tempDepr) {
      for (let i = tempDepr.length - 1; i >= 0; i--) {
        if (tempDepr[i].amount.trim().length === 0) {
          tempDepr.splice(i, 1);
        }
      }
      // Sending Close Accounts API Call
      let data = {
        year: +dates.format('YYYY'),
        depreciation: tempDepr.map((el) => ({
          account_id: +el.id,
          amount: +el.amount,
        })),
      };
      if (totalTaxExpenses.trim().length !== 0) {
        data['tax_expenses'] = +totalTaxExpenses;
      }
      const response = await createItem('reports/close-books', data);
      if (response?.success) {
        router.push('/dashboard');
        sendToast('success', 'Accounts Closed Successfully!', 4000);
      } else {
        sendToast(
          'error',
          response.data?.message || response.data?.error || 'Error Closing Accounts',
          4000
        );
      }
    }
  };

  return (
    <div className='col-12'>
      {/* Date Picker */}
      {state && (
        <div className='row mb-3 items-center justify-between mr-4'>
          <div className='col-lg-7 col-12 d-block ml-3 form-datepicker'>
            <label>Select Year</label>
            <DatePicker
              onlyYearPicker
              style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
              inputClass='custom_input-picker'
              containerClassName='custom_container-picker'
              value={dates}
              onChange={setDates}
              numberOfMonths={1}
              offsetY={10}
              format='YYYY'
            />
          </div>
          <button className='col-lg-5 col-12 d-block btn btn-success' onClick={generate}>
            Get Depreciation
          </button>
        </div>
      )}
      {/* Generated Closing Account */}
      {!state && (
        <form className='close-books' onSubmit={onSubmit}>
          <h1> Closing Accounts on {closingDate.format('DD-MMMM-YYYY')}</h1>
          <div className='col-7 my-4'>
            <div className='form-input'>
              <input
                onChange={(e) => setTotalTaxExpenses(e.target.value)}
                value={totalTaxExpenses}
                placeholder=' '
                type='number'
                onWheel={(e) => e.target.blur()}
              />
              <label className='lh-1 text-16 text-light-1'>Tax Expenses</label>
            </div>
          </div>
          <h2>Depreciation</h2>
          <div className='row mt-20'>
            {depreciations &&
              depreciations.map((element, index) => (
                <div className='col-lg-6 col-12 my-2' key={index}>
                  <div className='form-input'>
                    <input
                      onChange={(e) =>
                        setDepreciations((prev) => {
                          prev[index].amount = e.target.value;
                          return [...prev];
                        })
                      }
                      value={element.amount}
                      placeholder=' '
                      type='number'
                      onWheel={(e) => e.target.blur()}
                    />
                    <label className='lh-1 text-16 text-light-1'>
                      {element.name} (Value:{' '}
                      {(+element.value).toLocaleString('en-IN', {
                        maximumFractionDigits: 2,
                        style: 'currency',
                        currency: 'INR',
                      })}
                      )
                    </label>
                  </div>
                </div>
              ))}
          </div>
          <button className='btn btn-success mt-20' type='submit'>
            Close Accounts
          </button>
        </form>
      )}
    </div>
  );
};

export default Journals;

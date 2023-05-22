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

  const router = useRouter();

  const generate = async () => {
    if (dates) {
      const response = await createItem('/reports/close-books', {
        year: +dates.format('YYYY'),
      });
      if (response?.success) {
        console.log(response.data);
        setClosingDate(
          new DateObject({ date: response.data.closing_date, format: 'YYYY-MM-DD' })
        );
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

  return (
    <div className='col-12'>
      {/* Date Picker */}
      {state && (
        <div className='row mb-3 items-center justify-between mr-4'>
          <div className='col-lg-7 col-12 d-block ml-3 form-datepicker'>
            <label>Select Date</label>
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
        <div className='close-books'>
          <h1> Closing Accounts on {closingDate.format('DD-MMMM-YYYY')}</h1>
        </div>
      )}
    </div>
  );
};

export default Journals;

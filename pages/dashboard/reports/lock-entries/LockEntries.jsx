import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaLock, FaUnlock } from 'react-icons/fa';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { createItem, getList } from '../../../../api/xplorzApi';
import { sendToast } from '../../../../utils/toastify';

const LockEntries = () => {
  const date = new DateObject();
  const [data, setData] = useState([]);

  const [dates, setDates] = useState(date.setMonth(date.month - 1));

  const router = useRouter();

  const getEntries = async () => {
    const response = await getList('reports/get-references', {
      end_date: dates.format('YYYY-MM-DD'),
    });
    if (response?.success) {
      setData(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting entries',
        4000
      );
    }
  };

  useEffect(() => {
    if (dates) getEntries();
  }, [router.isReady, dates]);

  const lockEntries = async () => {
    const response = await createItem('reports/lock-references', {
      references: data.filter((d) => !d.locked).map((d) => d.reference),
    });
    if (response?.success) {
      sendToast('success', 'Entries locked successfully', 4000);
      router.reload();
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error locking entries',
        4000
      );
    }
  };

  return (
    <div className='col-12'>
      <div className='col-lg-5 col-12 d-block ml-3 form-datepicker'>
        <label>Select End Date</label>
        <DatePicker
          onlyMonthPicker
          style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
          inputClass='custom_input-picker'
          containerClassName='custom_container-picker'
          value={dates}
          onChange={setDates}
          numberOfMonths={1}
          offsetY={10}
          format='MMMM YYYY'
        />
      </div>
      <div className='row my-4'>
        {data.length
          ? data.map((d) => (
              <div key={d.reference} className='col-12 col-md-4 col-lg-3 align-middle'>
                {d.locked ? (
                  <FaLock className='text-danger text-12 me-2' />
                ) : (
                  <FaUnlock className='text-success text-12 me-2' />
                )}
                {d.reference}
              </div>
            ))
          : null}
      </div>
      {data.length ? (
        <button
          className='btn btn-primary d-flex items-center justify-between gap-1 mx-auto'
          onClick={lockEntries}
        >
          <FaLock className='text-20' />
          Lock Entries
        </button>
      ) : null}
    </div>
  );
};

export default LockEntries;

import Seo from '../../../../components/common/Seo';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getList } from '../../../../api/xplorzApi';
import Select from 'react-select';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import ReactSwitch from 'react-switch';

const AddNewCommissionRule = () => {
  const [dates, setDates] = useState([new DateObject(), new DateObject().add(1, 'day')]);
  const [allowDates, setAllowDates] = useState(false);
  const [iataBasic, setIataBasic] = useState(false);
  const [iataYQ, setIataYQ] = useState(false);
  const [name, setName] = useState('');
  const [plbBasic, setPlbBasic] = useState(false);
  const [plbYQ, setPlbYQ] = useState(false);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    const response = await createItem('commission-rules', {
      name,
      iata_basic: iataBasic,
      iata_yq: iataYQ,
      plb_basic: plbBasic,
      plb_yq: plbYQ,
      start_date: allowDates ? dates[0]?.format('YYYY-MM-DD') : undefined,
      end_date: allowDates ? dates[1]?.format('YYYY-MM-DD') : undefined,
    });
    if (response?.success) {
      sendToast('success', 'Created Commission Rule Successfully.', 4000);
      router.push('/dashboard/commission-rules');
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Failed to Create Commission Rule.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Add New Commission Rule' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>Add New Commission Rule</h1>
                  <div className='text-15 text-light-1'>
                    Create a new commission rule.
                  </div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setName(e.target.value)}
                          value={name}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Name<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='d-flex items-center gap-3'>
                      <ReactSwitch
                        onChange={() => setIataBasic((prev) => !prev)}
                        checked={iataBasic}
                      />
                      <label>Charge IATA Commission on Basic</label>
                    </div>
                    <div className='d-flex items-center gap-3'>
                      <ReactSwitch
                        onChange={() => setIataYQ((prev) => !prev)}
                        checked={iataYQ}
                      />
                      <label>Charge IATA Commission on YQ</label>
                    </div>
                    <div className='d-flex items-center gap-3'>
                      <ReactSwitch
                        onChange={() => setPlbBasic((prev) => !prev)}
                        checked={plbBasic}
                      />
                      <label>Charge PLB Commission on Basic</label>
                    </div>
                    <div className='d-flex items-center gap-3'>
                      <ReactSwitch
                        onChange={() => setPlbYQ((prev) => !prev)}
                        checked={plbYQ}
                      />
                      <label>Charge PLB Commission on YQ</label>
                    </div>
                    <div className='d-flex items-center gap-3'>
                      <ReactSwitch
                        onChange={() => setAllowDates((prev) => !prev)}
                        checked={allowDates}
                      />
                      <label>Select Dates?</label>
                    </div>
                    {allowDates && (
                      <div className='d-block ml-3 form-datepicker'>
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
                    )}
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Commission Rule
                      </button>
                    </div>
                  </form>
                </div>
                </div>
                </>
  );
};

AddNewCommissionRule.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddNewCommissionRule;

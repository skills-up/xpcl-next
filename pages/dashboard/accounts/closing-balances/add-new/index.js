import Seo from '../../../../../components/common/Seo';
import Footer from '../../../../../components/footer/dashboard-footer';
import Header from '../../../../../components/header/dashboard-header';
import Sidebar from '../../../../../components/sidebars/dashboard-sidebars';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getList } from '../../../../../api/xplorzApi';
import ReactSwitch from 'react-switch';
import Select from 'react-select';
import DatePicker, { DateObject } from 'react-multi-date-picker';

const AddNewClosingBalance = () => {
  const [day, setDay] = useState(new DateObject());
  const [amount, setAmount] = useState(0);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      if (!router.query.account_id) {
        router.push('/dashboard/accounts');
      }
    }
  }, [router.isReady]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const response = await createItem('closing-balances', {
      account_id: router.query.account_id,
      closing_date: day.format('YYYY-MM-DD'),
      amount,
    });
    if (response?.success) {
      sendToast('success', 'Created Closing Balance Successfully.', 4000);
      router.push('/dashboard/accounts/view/' + router.query.account_id);
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Failed to Create Closing Balance.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Add New Closing Balance' />
      {/* End Page Title */}

      <div className='header-margin'></div>

      <Header />
      {/* End dashboard-header */}

      <div className='dashboard'>
        <div className='dashboard__sidebar bg-white scroll-bar-1'>
          <Sidebar />
          {/* End sidebar */}
        </div>
        {/* End dashboard__sidebar */}

        <div className='dashboard__main'>
          <div className='dashboard__content d-flex flex-column justify-between bg-light-2'>
            <div>
              <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>Add New Closing Balance</h1>
                  <div className='text-15 text-light-1'>
                    Create a new closing balance.
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
                          onChange={(e) => setAmount(e.target.value)}
                          value={amount}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Amount<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='d-block ml-3 form-datepicker'>
                      <label>
                        Closing Date<span className='text-danger'>*</span>
                      </label>
                      <DatePicker
                        style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                        inputClass='custom_input-picker'
                        containerClassName='custom_container-picker'
                        value={day}
                        onChange={setDay}
                        numberOfMonths={1}
                        offsetY={10}
                        format='DD MMMM YYYY'
                      />
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Closing Balance
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <Footer />
          </div>
          {/* End .dashboard__content */}
        </div>
        {/* End dashbaord content */}
      </div>
      {/* End dashbaord content */}
    </>
  );
};

export default AddNewClosingBalance;

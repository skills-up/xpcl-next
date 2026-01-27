import Seo from '../../../../../components/common/Seo';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getList } from '../../../../../api/xplorzApi';
import ReactSwitch from 'react-switch';
import Select from 'react-select';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import validateCreditCard from '../../../../../utils/validateCreditCard';

const AddNewCreditCard = () => {
  const [number, setNumber] = useState('');
  const [cardType, setCardType] = useState('');
  const [cardValid, setCardValid] = useState(true);
  const [name, setName] = useState('');
  const [expiryDate, setExpiryDate] = useState(new DateObject());

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      if (!router.query.traveller_id) {
        router.push('/dashboard/travellers');
      }
    }
  }, [router.isReady]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!cardValid) {
      sendToast('error', 'Please enter a valid credit card number', 4000);
      return;
    }
    // Checking if account id is not null
    const response = await createItem('credit-cards', {
      traveller_id: parseInt(router.query.traveller_id),
      card_number: number,
      name_on_card: name,
      expiry_date: expiryDate.format('YYYY-MM-DD'),
    });
    if (response?.success) {
      sendToast('success', 'Created Credit Card Successfully.', 4000);
      router.push('/dashboard/travellers/view/' + router.query.traveller_id);
    } else {
      sendToast(
        'error',
        response.data?.message || response.data?.error || 'Failed to Create Credit Card.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Add New Credit Card' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>Add New Credit Card</h1>
                  <div className='text-15 text-light-1'>Create a new credit card.</div>
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
                          onChange={(e) => {
                            const cardNumber = e.target.value.trim();
                            setNumber(cardNumber);
                            if (cardNumber) {
                              const {valid, type} = validateCreditCard(cardNumber);
                              setCardType(type || '');
                              setCardValid(valid);
                            } else {
                              setCardType('');
                              setCardValid(true);
                            }
                          }}
                          type='tel'
                          pattern='[0-9]{14,16}'
                          inputMode='numeric'
                          autoComplete='cc-number'
                          title='Credit card number should have between 14 to 16 digits'
                          value={number}
                          placeholder='xxxxxxxxxxxxxxxx'
                          className='cc-input'
                          required
                        />
                        <small style={{position: 'absolute', right: '0.5em', bottom: '.25em'}}>{cardType && cardType}</small>
                        <label className='lh-1 text-16 text-light-1'>
                          Card Number<span className='text-danger'>*</span>
                        </label>
                      </div>
                      <small className='text-danger'>{cardValid || 'Invalid Card Number'}</small>
                    </div>
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
                          Name on Card<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='d-block ml-3 form-datepicker'>
                      <label>
                        Expiry Date<span className='text-danger'>*</span>
                      </label>
                      <DatePicker
                        onlyMonthPicker
                        style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                        inputClass='custom_input-picker'
                        containerClassName='custom_container-picker'
                        value={expiryDate}
                        onChange={setExpiryDate}
                        numberOfMonths={1}
                        offsetY={10}
                        format='MMMM YYYY'
                      />
                    </div>

                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Credit Card
                      </button>
                    </div>
                  </form>
                </div>
                </div>
                </>
  );
};

AddNewCreditCard.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddNewCreditCard;

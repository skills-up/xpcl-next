import Seo from '../../../../../components/common/Seo';
import Footer from '../../../../../components/footer/dashboard-footer';
import Header from '../../../../../components/header/dashboard-header';
import Sidebar from '../../../../../components/sidebars/dashboard-sidebars';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getItem, getList, updateItem } from '../../../../../api/xplorzApi';
import ReactSwitch from 'react-switch';
import Select from 'react-select';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { BsEye, BsPencil } from 'react-icons/bs';

const UpdateCreditCard = () => {
  const [number, setNumber] = useState(0);
  const [maskedNumber, setMaskedNumber] = useState('');
  const [name, setName] = useState('');
  const [expiryDate, setExpiryDate] = useState(new DateObject());
  const [isMasked, setIsMasked] = useState(true);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      if (!router.query.traveller_id) {
        router.push('/dashboard/travellers');
      }
      getData();
    }
  }, [router.isReady]);

  const getData = async () => {
    if (router.query.edit) {
      const response = await getItem('credit-cards', router.query.edit);
      if (response?.success) {
        setName(response.data?.name_on_card);
        setMaskedNumber(response.data?.masked_number);
        setExpiryDate(
          new DateObject({ date: response.data?.expiry_date, format: 'YYYY-MM-DD' })
        );
        // Getting original  number
        const original = await getItem(
          'credit-cards',
          router.query.edit + '/show-number'
        );
        if (original?.success) setNumber(parseInt(atob(original.data?.number)));
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Unable to fetch required data',
          4000
        );
        router.push('/dashboard/travellers/view/' + router.query.traveller_id);
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Checking if account id is not null
    const response = await updateItem('credit-cards', router.query.edit, {
      traveller_id: parseInt(router.query.traveller_id),
      card_number: number,
      name_on_card: name,
      expiry_date: expiryDate.format('YYYY-MM-DD'),
    });
    if (response?.success) {
      sendToast('success', 'Updated Credit Card Successfully.', 4000);
      router.push('/dashboard/travellers/view/' + router.query.traveller_id);
    } else {
      sendToast(
        'error',
        response.data?.message || response.data?.error || 'Failed to Update Credit Card.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Update Credit Card' />
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
                  <h1 className='text-30 lh-14 fw-600'>Update Credit Card</h1>
                  <div className='text-15 text-light-1'>
                    Update an existing credit card.
                  </div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    {isMasked ? (
                      <div className='row pr-0'>
                        <div className='col-lg-11 col-10'>
                          <div className='form-input'>
                            <input
                              onChange={(e) => setMaskedNumber(e.target.value)}
                              value={maskedNumber}
                              placeholder=' '
                              type='text'
                              required
                              disabled
                            />
                            <label className='lh-1 text-16 text-light-1'>
                              Masked Card Number<span className='text-danger'>*</span>
                            </label>
                          </div>
                        </div>
                        <div
                          className='col-lg-1 col-2 d-flex items-center justify-center btn btn-outline-success'
                          onClick={() => setIsMasked(false)}
                        >
                          <BsPencil style={{ fontSize: '2rem' }} />
                        </div>
                      </div>
                    ) : (
                      <div className='col-12'>
                        <div className='form-input'>
                          <input
                            onChange={(e) => setNumber(e.target.value)}
                            value={number}
                            placeholder=' '
                            type='number'
                            required
                          />
                          <label className='lh-1 text-16 text-light-1'>
                            Card Number<span className='text-danger'>*</span>
                          </label>
                        </div>
                      </div>
                    )}
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
                    <div className='d-block ml-4'>
                      <label>
                        Expiry Date<span className='text-danger'>*</span>
                      </label>
                      <DatePicker
                        style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                        inputClass='custom_input-picker'
                        containerClassName='custom_container-picker'
                        value={expiryDate}
                        onChange={setExpiryDate}
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
                        Update Credit Card
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

export default UpdateCreditCard;

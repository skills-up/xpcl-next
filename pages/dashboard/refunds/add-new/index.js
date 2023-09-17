import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getItem, getList } from '../../../../api/xplorzApi';
import ReactSwitch from 'react-switch';
import Select from 'react-select';
import DatePicker, { DateObject } from 'react-multi-date-picker';

const AddNewRefund = () => {
  const [refundDate, setRefundDate] = useState(new DateObject());
  const [accounts, setAccounts] = useState([]);
  const [accountID, setAccountID] = useState(null);
  const [airlineCancellationCharges, setAirlineCancellationCharges] = useState('');
  const [vendorServiceFee, setVendorServiceFee] = useState('');
  const [clientCancellationCharges, setClientCancellationCharges] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [reason, setReason] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [refundBookingData, setRefundBookingData] = useState(null);
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [paymentAccountID, setPaymentAccountID] = useState(null);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      if (!router.query.booking_id) {
        router.push('/dashboard/bookings');
      }
      getData();
    }
  }, [router.isReady]);

  const getData = async () => {
    const paymentAccounts = await getList('accounts', { category: 'Credit Cards' });
    const accounts = await getList('organizations', { is_client: 1 });
    const bookingData = await getItem('bookings', router.query.booking_id);
    let refundData;
    if (accounts?.success && bookingData?.success && paymentAccounts?.success) {
      if (bookingData?.data?.original_booking_id) {
        refundData = await getItem('bookings', bookingData.data.original_booking_id);
        if (refundData?.success) {
          setRefundBookingData(refundData.data);
        } else {
          sendToast('error');
        }
      }
      setAccounts(
        accounts.data.map((element) => ({
          value: element.account_id,
          label: element.name,
        }))
      );
      setPaymentAccounts(
        paymentAccounts.data.map((element) => ({
          value: element.id,
          label: element.name,
        }))
      );
      setBookingData(bookingData.data);
      // Setting Payment Account
      for (let opt of paymentAccounts.data) {
        if (opt.id === bookingData.data.payment_account_id)
          setPaymentAccountID({ label: opt.name, value: opt.id });
      }
      // Setting Refund To Account
      for (let opt of accounts.data) {
        if (opt.id === bookingData.data.client_id)
          setAccountID({ label: opt.name, value: opt.account_id });
      }
    } else {
      sendToast('error', 'Unable to fetch required data', 4000);
      router.push('/dashboard/refunds');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!accountID?.value) {
      sendToast('error', 'You must select a Refund To Account', 4000);
      return;
    }
    const response = await createItem('refunds', {
      booking_id: router.query.booking_id,
      refund_date: refundDate.format('YYYY-MM-DD'),
      refund_to_account_id: accountID.value,
      airline_cancellation_charges: airlineCancellationCharges
        ? airlineCancellationCharges /
          (bookingData?.enable_inr ? bookingData.exchange_rate : 1)
        : 0,
      vendor_service_fee: vendorServiceFee
        ? vendorServiceFee / (bookingData?.enable_inr ? bookingData.exchange_rate : 1)
        : 0,
      client_cancellation_charges: clientCancellationCharges || 0,
      payment_account_id: paymentAccountID?.value || undefined,
      refund_amount:
        +refundAmount === 0
          ? undefined
          : refundAmount / (bookingData?.enable_inr ? bookingData.exchange_rate : 1) ||
            undefined,
      reason,
    });
    if (response?.success) {
      sendToast('success', 'Created Refund Successfully.', 4000);
      router.push('/dashboard/refunds');
    } else {
      sendToast(
        'error',
        response.data?.message || response.data?.error || 'Failed to Create Refund.',
        4000
      );
    }
  };

  // Calculation
  useEffect(() => {
    if (bookingData && paymentAccountID) {
      const payment = Number(
        (
          ((+bookingData?.payment_amount || 0) +
            (+refundBookingData?.payment_amount || 0)) *
            (bookingData?.enable_inr ? bookingData.exchange_rate : 1) || 0
        ).toFixed(0)
      );
      if (payment) setRefundAmount((+payment || 0) - (+airlineCancellationCharges || 0));
    }
  }, [bookingData, airlineCancellationCharges, paymentAccountID, refundBookingData]);

  return (
    <>
      <Seo pageTitle='Add New Refund' />
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
                  <h1 className='text-30 lh-14 fw-600'>Add New Refund</h1>
                  <div className='text-15 text-light-1'>Create a new refund.</div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-10 x-gap-10'>
                    <div className='d-block col-lg-4 ml-3 form-datepicker'>
                      <label>
                        Refund Date<span className='text-danger'>*</span>
                      </label>
                      <DatePicker
                        style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                        inputClass='custom_input-picker'
                        containerClassName='custom_container-picker'
                        value={refundDate}
                        onChange={setRefundDate}
                        numberOfMonths={1}
                        offsetY={10}
                        format='DD MMMM YYYY'
                      />
                    </div>
                    <div className='form-input-select col-lg-4'>
                      <label>
                        Refund To<span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={accounts}
                        value={accountID}
                        onChange={(id) => setAccountID(id)}
                      />
                    </div>
                    <div className='form-input-select col-lg-4'>
                      <label>Payment Account</label>
                      <Select
                        isClearable
                        options={paymentAccounts}
                        value={paymentAccountID}
                        onChange={(id) => setPaymentAccountID(id)}
                      />
                    </div>
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setAirlineCancellationCharges(e.target.value)}
                          value={airlineCancellationCharges}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Airline Cancellation Charges
                        </label>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setVendorServiceFee(e.target.value)}
                          value={vendorServiceFee}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor Service Fee
                        </label>
                      </div>
                    </div>
                    <div className=' col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setClientCancellationCharges(e.target.value)}
                          value={clientCancellationCharges}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Cancellation Charges
                        </label>
                      </div>
                    </div>
                    {bookingData && paymentAccountID && (
                      <div className=' col-lg-4'>
                        <div className='form-input'>
                          <input
                            onChange={(e) => setRefundAmount(e.target.value)}
                            value={refundAmount}
                            placeholder=' '
                            type='number'
                            onWheel={(e) => e.target.blur()}
                          />
                          <label className='lh-1 text-16 text-light-1'>
                            Refund Amount
                          </label>
                        </div>
                      </div>
                    )}
                    <div className=' col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setReason(e.target.value)}
                          value={reason}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Comment</label>
                      </div>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Refund
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

export default AddNewRefund;

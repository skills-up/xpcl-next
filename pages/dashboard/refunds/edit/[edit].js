import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { getItem, getList, updateItem } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { capitalize } from '../../../../utils/text-utils';
import { sendToast } from '../../../../utils/toastify';

const UpdateRefund = () => {
  const [refundDate, setRefundDate] = useState(new DateObject());
  const [accounts, setAccounts] = useState([]);
  const [accountID, setAccountID] = useState(null);
  const [airlineCancellationCharges, setAirlineCancellationCharges] = useState('');
  const [vendorServiceFee, setVendorServiceFee] = useState('');
  const [clientCancellationCharges, setClientCancellationCharges] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [reason, setReason] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [refundBookingData, setRefundBookingData] = useState([]);
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [paymentAccountID, setPaymentAccountID] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [number, setNumber] = useState('');

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      getData();
    }
  }, [router.isReady]);

  const getData = async () => {
    if (router.query.edit) {
      const response = await getItem('refunds', router.query.edit);
      if (response?.success) {
        // Setting values
        setRefundDate(
          new DateObject({ date: response.data.refund_date, format: 'YYYY-MM-DD' })
        );
        setAirlineCancellationCharges(
          (+response.data.airline_cancellation_charges || 0).toFixed(0)
        );
        setVendorServiceFee((+response.data.vendor_service_fee || 0).toFixed(0));
        setClientCancellationCharges(
          (+response.data.client_cancellation_charges || 0).toFixed(0)
        );
        setRefundAmount((+response.data.refund_amount || 0).toFixed(0));
        setReason(response.data?.reason);
        setNumber(response.data.number);

        const paymentAccounts = await getList('accounts', { category: 'Credit Cards' });
        const accounts = await getList('organizations', { is_client: 1 });
        const bookingData = await getItem('bookings', response.data.booking_id);
        if (accounts?.success && bookingData?.success && paymentAccounts?.success) {
          if (bookingData?.data?.original_booking_id) {
            let obData = bookingData.data;
            const originalBookings = [];
            while (obData.original_booking_id) {
              const ob = await getItem('bookings', obData.original_booking_id);
              if (ob?.success) {
                obData = ob.data;
                originalBookings.push(obData);
              } else {
                sendToast('error');
              }
            }
            setRefundBookingData(originalBookings);
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
            if (opt.id === response.data.payment_account_id)
              setPaymentAccountID({ label: opt.name, value: opt.id });
          }
          // Setting Refund To Account
          for (let account of accounts.data)
            if (account.account_id === response.data.refund_to_account_id)
              setAccountID({ value: account.account_id, label: account.name });
          setTimeout(() => {
            setLoaded(true);
          }, 1000);
        } else {
          sendToast('error', 'Unable to fetch required data', 4000);
          router.push('/dashboard/refunds');
        }
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Unable to fetch required data',
          4000
        );
        router.push('/dashboard/refunds');
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!accountID?.value) {
      sendToast('error', 'You must select an Account', 4000);
      return;
    }
    const response = await updateItem('refunds', router.query.edit, {
      refund_date: refundDate.format('YYYY-MM-DD'),
      refund_to_account_id: accountID.value,
      airline_cancellation_charges: airlineCancellationCharges || 0,
      vendor_service_fee: vendorServiceFee || 0,
      client_cancellation_charges: clientCancellationCharges || 0,
      payment_account_id: paymentAccountID?.value || undefined,
      refund_amount: +refundAmount === 0 ? undefined : refundAmount || undefined,
      reason: capitalize(reason),
    });
    if (response?.success) {
      sendToast('success', 'Updated Refund Successfully.', 4000);
      router.push('/dashboard/refunds');
    } else {
      sendToast(
        'error',
        response.data?.message || response.data?.error || 'Failed to Update Refund.',
        4000
      );
    }
  };

  // Calculation
  useEffect(() => {
    if (loaded)
      if (bookingData && paymentAccountID) {
        const payment =
        (+bookingData?.payment_amount || 0) + refundBookingData.reduce((a, b) => a + (+b.payment_amount || 0), 0) - (+bookingData?.reissue_penalty || 0) - refundBookingData.reduce((a, b) => a + (+b.reissue_penalty || 0), 0);
        if (payment > 0) setRefundAmount((+payment || 0) - (+airlineCancellationCharges || 0));
      }
  }, [bookingData, airlineCancellationCharges, paymentAccountID, refundBookingData]);

  return (
    <>
      <Seo pageTitle={`Update Refund ${number}`} />
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
                  <h1 className='text-30 lh-14 fw-600'>Update Refund - {number}</h1>
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
                    <div className='col-lg-4'>
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
                      <div className='col-lg-4'>
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
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setReason(e.target.value)}
                          value={reason}
                          placeholder=' '
                          type='text'
                          className='capitalize'
                        />
                        <label className='lh-1 text-16 text-light-1'>Comment</label>
                      </div>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Update Refund
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

export default UpdateRefund;

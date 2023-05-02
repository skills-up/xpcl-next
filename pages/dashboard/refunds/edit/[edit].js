import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getItem, getList, updateItem } from '../../../../api/xplorzApi';
import ReactSwitch from 'react-switch';
import Select from 'react-select';
import DatePicker, { DateObject } from 'react-multi-date-picker';

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
        setAirlineCancellationCharges(response.data.airline_cancellation_charges);
        setVendorServiceFee(response.data.vendor_service_fee);
        setClientCancellationCharges(response.data.client_cancellation_charges);
        setRefundAmount(response.data.refund_amount);
        setReason(response.data?.reason);

        const bookingData = await getItem('bookings', response.data?.booking_id);
        const accounts = await getList('accounts');
        if (accounts?.success && bookingData?.success) {
          setAccounts(
            accounts.data.map((element) => ({ value: element.id, label: element.name }))
          );
          setBookingData(bookingData.data);
          // Setting Account ID
          for (let account of accounts.data)
            if (account.id === response.data.account_id)
              setAccountID({ value: account.id, label: account.name });
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
      account_id: accountID.value,
      airline_cancellation_charges: airlineCancellationCharges,
      vendor_service_fee: vendorServiceFee,
      client_cancellation_charges: clientCancellationCharges,
      refund_amount: refundAmount,
      reason,
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
    if (bookingData) {
      const payment = +bookingData?.vendor_total || bookingData?.payment_amount;
      setRefundAmount(+payment - +airlineCancellationCharges);
    }
  }, [bookingData, airlineCancellationCharges]);

  return (
    <>
      <Seo pageTitle='Update Refund' />
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
                  <h1 className='text-30 lh-14 fw-600'>Update Refund</h1>
                  <div className='text-15 text-light-1'>Create a new refund.</div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <div className='d-block ml-4'>
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
                    <div>
                      <label>
                        Account<span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={accounts}
                        value={accountID}
                        placeholder='Search & Select Account (required)'
                        onChange={(id) => setAccountID(id)}
                      />
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setAirlineCancellationCharges(e.target.value)}
                          value={airlineCancellationCharges}
                          placeholder=' '
                          type='number'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Airline Cancellation Charges
                          <span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setVendorServiceFee(e.target.value)}
                          value={vendorServiceFee}
                          placeholder=' '
                          type='number'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor Service Fee<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setClientCancellationCharges(e.target.value)}
                          value={clientCancellationCharges}
                          placeholder=' '
                          type='number'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Cancellation Charges
                          <span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setRefundAmount(e.target.value)}
                          value={refundAmount}
                          placeholder=' '
                          type='number'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Refund Amount<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>

                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setReason(e.target.value)}
                          value={reason}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Reason</label>
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

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

const AddNewPartialRefund = () => {
  const [vendorBaseAmount, setVendorBaseAmount] = useState('');
  const [vendorYQAmount, setVendorYQAmount] = useState('');
  const [vendorTaxAmount, setVendorTaxAmount] = useState('');
  const [vendorGSTAmount, setVendorGSTAmount] = useState('');
  const [vendorTotal, setVendorTotal] = useState('');
  const [IATACommissionPercent, setIATACommissionPercent] = useState('');
  const [plbCommissionPercent, setPLBCommissionPercent] = useState('');
  const [vendorServiceCharges, setVendorServiceCharges] = useState('');
  const [vendorTDS, setVendorTDS] = useState('');
  const [commissionReceivable, setCommissionReceivable] = useState('');
  const [clientReferralFee, setClientReferralFee] = useState(0);
  const [clientBaseAmount, setClientBaseAmount] = useState('');
  const [clientTaxAmount, setClientTaxAmount] = useState('');
  const [clientGSTAmount, setClientGSTAmount] = useState('');
  const [clientServiceCharges, setClientServicesCharges] = useState('');
  const [clientTotal, setClientTotal] = useState('');
  const [airlineCancellationCharges, setAirlineCancellationCharges] = useState('');
  const [clientCancellationCharges, setClientCancellationCharges] = useState('');
  const [vendorServiceFee, setVendorServiceFee] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [reason, setReason] = useState('');
  const [grossCommission, setGrossCommission] = useState(0);
  const [bookingData, setBookingData] = useState(null);

  // Percentages
  const [vendorServiceChargePercent, setVendorServiceChargePercent] = useState(18);
  const [vendorTDSPercent, setVendorTDSPercent] = useState(5);
  const [clientServiceChargePercent, setClientServiceChargePercent] = useState(0);

  // Dates
  const [refundDate, setRefundDate] = useState(new DateObject());

  // Dropdowns
  const [vendorID, setVendorID] = useState(null);
  const [commissionRuleID, setCommissionRuleID] = useState(null);
  const [clientReferrerID, setClientReferrerID] = useState(null);
  const [accountID, setAccountID] = useState(null);

  const [vendors, setVendors] = useState([]);
  const [commissionRules, setCommissionRules] = useState([]);
  const [clients, setClients] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [xplorzGSTFocused, setXplorzGSTFocused] = useState(false);
  const [vendorGSTFocused, setVendorGSTFocused] = useState(false);
  const [vendorTDSPercentFocused, setVendorTDSPercentFocused] = useState(false);

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
    const accounts = await getList('accounts');
    const vendors = await getList('organizations', { is_vendor: 1 });
    const commissionRules = await getList('commission-rules');
    const clients = await getList('accounts', { category: 'Referrers' });
    const bookingData = await getItem('bookings', router.query.booking_id);

    if (
      accounts?.success &&
      vendors?.success &&
      commissionRules?.success &&
      clients?.success &&
      bookingData?.success
    ) {
      setAccounts(
        accounts.data.map((element) => ({ value: element.id, label: element.name }))
      );
      setVendors(
        vendors.data.map((element) => ({
          value: element.id,
          label: element.name,
        }))
      );
      setCommissionRules(
        commissionRules.data.map((element) => ({
          value: element.id,
          label: element.name,
          iata_basic: element.iata_basic,
          iata_yq: element.iata_yq,
          plb_basic: element.plb_basic,
          plb_yq: element.plb_yq,
        }))
      );
      setClients(
        clients.data.map((element) => ({
          value: element.id,
          label: element.name,
        }))
      );
      setBookingData(bookingData.data);
      // Prefilling
      setVendorBaseAmount(bookingData.data.vendor_base_amount);
      setVendorYQAmount(bookingData.data.vendor_yq_amount);
      setVendorTaxAmount(bookingData.data.vendor_tax_amount);
      setVendorGSTAmount(bookingData.data.vendor_gst_amount);
      setIATACommissionPercent(bookingData.data.iata_commission_percent);
      setPLBCommissionPercent(bookingData.data.plb_commission_percent);
      setVendorServiceCharges(bookingData.data.vendor_service_charges);
      setVendorTDS(bookingData.data.vendor_tds);
      setClientReferralFee(bookingData.data.client_referral_fee);
      setClientBaseAmount(bookingData.data.client_base_amount);
      setClientTaxAmount(bookingData.data.client_tax_amount);
      setClientGSTAmount(bookingData.data.client_gst_amount);
      setClientServicesCharges(bookingData.data.client_service_charges);
      for (let vendor of vendors.data)
        if (vendor.id === bookingData.data.vendor_id)
          setVendorID({ value: vendor.id, label: vendor.name });
      for (let cr of commissionRules.data)
        if (cr.id === bookingData.data.commission_rule_id)
          setCommissionRuleID({
            value: cr.id,
            label: cr.name,
            iata_basic: cr.iata_basic,
            iata_yq: cr.iata_yq,
            plb_basic: cr.plb_basic,
            plb_yq: cr.plb_yq,
          });
      for (let ref of clients.data)
        if (ref.id === bookingData.data.client_referrer_id)
          setClientReferrerID({ value: ref.id, label: ref.name });
    } else {
      sendToast('error', 'Unable to fetch required data', 4000);
      router.push('/dashboard/partial-refunds');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!accountID?.value) {
      sendToast('error', 'You must select an Account', 4000);
      return;
    }
    if (!vendorID?.value) {
      sendToast('error', 'You must select a Vendor', 4000);
      return;
    }
    const response = await createItem('partial-refunds', {
      booking_id: router.query.booking_id,
      refund_date: refundDate.format('YYYY-MM-DD'),
      vendor_id: vendorID.value,
      vendor_base_amount: vendorBaseAmount,
      vendor_yq_amount: vendorYQAmount,
      vendor_tax_amount: vendorTaxAmount,
      vendor_gst_amount: vendorGSTAmount,
      vendor_total: vendorTotal,
      commission_rule_id: commissionRuleID?.value,
      iata_commission_percent: IATACommissionPercent,
      plb_commission_percent: plbCommissionPercent,
      vendor_service_charges: vendorServiceCharges,
      vendor_tds: vendorTDS,
      commission_receivable: commissionReceivable,
      client_referrer_id: clientReferrerID?.value,
      client_referral_fee: clientReferralFee,
      client_base_amount: clientBaseAmount,
      client_tax_amount: clientTaxAmount,
      client_gst_amount: clientGSTAmount,
      client_service_charges: clientServiceCharges,
      client_total: clientTotal,
      airline_cancellation_charges: airlineCancellationCharges,
      vendor_service_fee: vendorServiceFee,
      client_cancellation_charges: clientCancellationCharges,
      refund_amount: refundAmount,
      account_id: accountID.value,
      reason,
    });
    if (response?.success) {
      sendToast('success', 'Created Partial Refund Successfully.', 4000);
      router.push('/dashboard/partial-refunds');
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Failed to Create Partial Refund.',
        4000
      );
    }
  };

  // Vendor Calculations
  useEffect(
    () => updateVendorTotal(),
    [vendorBaseAmount, vendorYQAmount, vendorTaxAmount, vendorGSTAmount]
  );

  // Vendor Total
  const updateVendorTotal = () => {
    setVendorTotal(
      Number(+vendorBaseAmount + +vendorYQAmount + +vendorTaxAmount + +vendorGSTAmount)
    );
  };

  // Vendor Commission Receivable
  useEffect(() => {
    if (vendorTDSPercentFocused) {
      setVendorTDS(
        Number(
          ((+grossCommission - +vendorServiceCharges) * +vendorTDSPercent) / 100
        ).toFixed(4)
      );
    }
  }, [vendorTDSPercent, grossCommission]);

  useEffect(() => {
    if (!vendorTDSPercentFocused) {
      setVendorTDSPercent(
        Number((100 * vendorTDS) / (+grossCommission - +vendorServiceCharges)).toFixed(4)
      );
    }
  }, [vendorTDS, grossCommission]);

  useEffect(() => {
    if (vendorGSTFocused) {
      setVendorServiceCharges(
        Number((+grossCommission * +vendorServiceChargePercent) / 100).toFixed(4)
      );
    }
  }, [vendorServiceChargePercent, grossCommission]);

  useEffect(() => {
    if (!vendorGSTFocused) {
      setVendorServiceChargePercent(
        Number((100 * +vendorServiceCharges) / +grossCommission).toFixed(4)
      );
    }
  }, [vendorServiceCharges, grossCommission]);

  useEffect(() => {
    calculateGrossCommission();
  }, [
    commissionRuleID,
    IATACommissionPercent,
    plbCommissionPercent,
    vendorBaseAmount,
    vendorYQAmount,
  ]);

  useEffect(() => {
    updateVendorCommission();
  }, [grossCommission, vendorServiceCharges, vendorTDS]);

  // Vendor Commission Receivable Total
  const updateVendorCommission = () => {
    setCommissionReceivable(
      Math.round(+grossCommission - +vendorTDS - +vendorServiceCharges)
    );
  };

  const calculateGrossCommission = () => {
    if (commissionRuleID) {
      const iata_comm = Number(
        (+IATACommissionPercent *
          (+commissionRuleID.iata_basic * +vendorBaseAmount +
            +commissionRuleID.iata_yq * +vendorYQAmount)) /
          100
      ).toFixed(4);
      const plb_comm = Number(
        (+plbCommissionPercent *
          (+commissionRuleID.plb_basic * +vendorBaseAmount +
            +commissionRuleID.plb_yq * +vendorYQAmount -
            iata_comm)) /
          100
      ).toFixed(4);
      setGrossCommission(Number(+plb_comm + +iata_comm));
    }
  };

  // Client Calculations
  useEffect(() => {
    if (xplorzGSTFocused) {
      setClientServicesCharges(
        Number(
          ((+clientBaseAmount + +clientReferralFee) * +clientServiceChargePercent) / 100
        ).toFixed(0)
      );
    }
  }, [clientServiceChargePercent, clientReferralFee, clientBaseAmount]);

  useEffect(() => {
    if (!xplorzGSTFocused) {
      setClientServiceChargePercent(
        Number(
          (100 * +clientServiceCharges) / (+clientBaseAmount + +clientReferralFee)
        ).toFixed(4)
      );
    }
  }, [clientServiceCharges]);

  useEffect(() => {
    updateClientTotal();
  }, [
    clientServiceCharges,
    clientTaxAmount,
    clientGSTAmount,
    clientReferralFee,
    clientBaseAmount,
  ]);

  // Client Total
  const updateClientTotal = () => {
    setClientTotal(
      Number(
        +clientBaseAmount +
          +clientGSTAmount +
          +clientTaxAmount +
          +clientServiceCharges +
          +clientReferralFee
      )
    );
  };

  return (
    <>
      <Seo pageTitle='Add New Partial Refund' />
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
                  <h1 className='text-30 lh-14 fw-600'>Add New Partial Refund</h1>
                  <div className='text-15 text-light-1'>Create a new partial refund.</div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <div className='d-block ml-3 form-datepicker'>
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
                    <div className='form-input-select'>
                      <label>
                        Vendor<span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={vendors}
                        value={vendorID}
                        placeholder='Search & Select Vendor (required)'
                        onChange={(id) => setVendorID(id)}
                      />
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setVendorBaseAmount(e.target.value)}
                          value={vendorBaseAmount}
                          placeholder=' '
                          type='number'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor Base Amount
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setVendorYQAmount(e.target.value)}
                          value={vendorYQAmount}
                          placeholder=' '
                          type='number'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor YQ Amount
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setVendorTaxAmount(e.target.value)}
                          value={vendorTaxAmount}
                          placeholder=' '
                          type='number'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor Tax Amount
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setVendorGSTAmount(e.target.value)}
                          value={vendorGSTAmount}
                          placeholder=' '
                          type='number'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor GST Amount
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setVendorTotal(e.target.value)}
                          value={vendorTotal}
                          placeholder=' '
                          type='number'
                          disabled
                        />
                        <label className='lh-1 text-16 text-light-1'>Vendor Total</label>
                      </div>
                    </div>
                    <div className='form-input-select'>
                      <label>Commission Rule</label>
                      <Select
                        options={commissionRules}
                        value={commissionRuleID}
                        placeholder='Search & Select Commission Rule'
                        onChange={(id) => setCommissionRuleID(id)}
                      />
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setIATACommissionPercent(e.target.value)}
                          value={IATACommissionPercent}
                          placeholder=' '
                          type='number'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          IATA Commission Percent
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setPLBCommissionPercent(e.target.value)}
                          value={plbCommissionPercent}
                          placeholder=' '
                          type='number'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          PLB Commission Percent
                        </label>
                      </div>
                    </div>
                    <div className='col-12 row pr-0'>
                      <div className='form-input col-4'>
                        <input
                          onChange={(e) => setVendorServiceChargePercent(e.target.value)}
                          value={vendorServiceChargePercent}
                          placeholder=' '
                          type='number'
                          onFocus={() => setVendorGSTFocused(true)}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor Service Charge Percent
                        </label>
                        <div className='d-flex items-center ml-30'>%</div>
                      </div>
                      <div className='form-input col-8 pr-0'>
                        <input
                          onChange={(e) => setVendorServiceCharges(e.target.value)}
                          value={vendorServiceCharges}
                          placeholder=' '
                          type='number'
                          onFocus={() => setVendorGSTFocused(false)}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor Service Charges
                        </label>
                      </div>
                    </div>
                    <div className='col-12 row pr-0'>
                      <div className='form-input col-4'>
                        <input
                          onChange={(e) => setVendorTDSPercent(e.target.value)}
                          value={vendorTDSPercent}
                          placeholder=' '
                          type='number'
                          onFocus={() => setVendorTDSPercentFocused(true)}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor TDS Percent
                        </label>
                        <div className='d-flex items-center ml-30'>%</div>
                      </div>
                      <div className='form-input col-8 pr-0'>
                        <input
                          onChange={(e) => setVendorTDS(e.target.value)}
                          value={vendorTDS}
                          placeholder=' '
                          type='number'
                          onFocus={() => setVendorTDSPercentFocused(false)}
                        />
                        <label className='lh-1 text-16 text-light-1'>Vendor TDS</label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setCommissionReceivable(e.target.value)}
                          value={commissionReceivable}
                          placeholder=' '
                          type='number'
                          disabled
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Commission Receivable
                        </label>
                      </div>
                    </div>
                    <div className='form-input-select'>
                      <label>Client Referrer</label>
                      <Select
                        options={clients}
                        value={clientReferrerID}
                        placeholder='Search & Select Client Referrer'
                        onChange={(id) => setClientReferrerID(id)}
                      />
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setClientReferralFee(e.target.value)}
                          value={clientReferralFee}
                          placeholder=' '
                          type='number'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Referral Fee
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setClientBaseAmount(e.target.value)}
                          value={clientBaseAmount}
                          placeholder=' '
                          type='number'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Base Amount
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setClientTaxAmount(e.target.value)}
                          value={clientTaxAmount}
                          placeholder=' '
                          type='number'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Tax Amount
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setClientGSTAmount(e.target.value)}
                          value={clientGSTAmount}
                          placeholder=' '
                          type='number'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client GST Amount
                        </label>
                      </div>
                    </div>
                    <div className='col-12 row pr-0 items-center'>
                      <div className='form-input col-4'>
                        <input
                          onChange={(e) => setClientServiceChargePercent(e.target.value)}
                          value={clientServiceChargePercent}
                          placeholder=' '
                          onFocus={() => setXplorzGSTFocused(true)}
                          type='number'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Xplorz GST Percent
                        </label>
                        <span className='d-flex items-center ml-30'>%</span>
                      </div>
                      <div className='form-input col-8 pr-0'>
                        <input
                          onChange={(e) => setClientServicesCharges(e.target.value)}
                          value={clientServiceCharges}
                          placeholder=' '
                          type='number'
                          onFocus={() => setXplorzGSTFocused(false)}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Services Charges
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setClientTotal(e.target.value)}
                          value={clientTotal}
                          placeholder=' '
                          type='number'
                          disabled
                        />
                        <label className='lh-1 text-16 text-light-1'>Client Total</label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setAirlineCancellationCharges(e.target.value)}
                          value={airlineCancellationCharges}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Airline Cancellation Charges
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setVendorServiceFee(e.target.value)}
                          value={vendorServiceFee}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor Service Fee
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setClientCancellationCharges(e.target.value)}
                          value={clientCancellationCharges}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Cancellation Charges
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setRefundAmount(e.target.value)}
                          value={refundAmount}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Refund Amount</label>
                      </div>
                    </div>
                    <div className='form-input-select'>
                      <label>
                        Payment Refunded To<span className='text-danger'>*</span>
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
                          onChange={(e) => setReason(e.target.value)}
                          value={reason}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Reason</label>
                      </div>
                    </div>
                    <div>
                      <p>
                        <strong>Vendor Base Amount:</strong>{' '}
                        {bookingData?.vendor_base_amount || 0}
                      </p>
                      <p>
                        <strong>Vendor YQ Amount:</strong>{' '}
                        {bookingData?.vendor_yq_amount || 0}
                      </p>
                      <p>
                        <strong>Vendor Tax Amount:</strong>{' '}
                        {bookingData?.vendor_tax_amount || 0}
                      </p>
                      <p>
                        <strong>Vendor Misc. Amount:</strong>{' '}
                        {bookingData?.vendor_misc_charges || 0}
                      </p>
                      <p>
                        <strong>Reissue Penalty:</strong>{' '}
                        {bookingData?.reissue_penalty || 0}
                      </p>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Partial Refund
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

export default AddNewPartialRefund;

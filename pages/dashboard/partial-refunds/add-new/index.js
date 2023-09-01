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
  const [vendorBaseAmount, setVendorBaseAmount] = useState(0);
  const [vendorYQAmount, setVendorYQAmount] = useState(0);
  const [vendorTaxAmount, setVendorTaxAmount] = useState(0);
  const [vendorGSTAmount, setVendorGSTAmount] = useState(0);
  const [vendorTotal, setVendorTotal] = useState(0);
  const [IATACommissionPercent, setIATACommissionPercent] = useState('');
  const [plbCommissionPercent, setPLBCommissionPercent] = useState('');
  const [vendorServiceCharges, setVendorServiceCharges] = useState(0);
  const [vendorTDS, setVendorTDS] = useState(0);
  const [commissionReceivable, setCommissionReceivable] = useState(0);
  const [clientReferralFee, setClientReferralFee] = useState(0);
  const [clientBaseAmount, setClientBaseAmount] = useState(0);
  const [clientTaxAmount, setClientTaxAmount] = useState(0);
  const [clientGSTAmount, setClientGSTAmount] = useState(0);
  const [clientServiceCharges, setClientServicesCharges] = useState(0);
  const [clientTotal, setClientTotal] = useState(0);
  const [airlineCancellationCharges, setAirlineCancellationCharges] = useState(0);
  const [clientCancellationCharges, setClientCancellationCharges] = useState(0);
  const [vendorServiceFee, setVendorServiceFee] = useState(0);
  const [refundAmount, setRefundAmount] = useState('');
  const [reason, setReason] = useState('');
  const [grossCommission, setGrossCommission] = useState(0);
  const [bookingData, setBookingData] = useState(null);
  const [clientQuotedAmount, setClientQuotedAmount] = useState(0);

  // Percentages
  const [vendorServiceChargePercent, setVendorServiceChargePercent] = useState(18);
  const [vendorTDSPercent, setVendorTDSPercent] = useState(5);
  const [clientServiceChargePercent, setClientServiceChargePercent] = useState(0);
  const [clientGSTPercent, setClientGSTPercent] = useState(null);

  // Dates
  const [refundDate, setRefundDate] = useState(new DateObject());

  // Dropdowns
  const [vendorID, setVendorID] = useState(null);
  const [commissionRuleID, setCommissionRuleID] = useState(null);
  const [clientReferrerID, setClientReferrerID] = useState(null);
  const [accountID, setAccountID] = useState(null);
  const [clientAccountID, setClientAccountID] = useState(null);

  const [vendors, setVendors] = useState([]);
  const [commissionRules, setCommissionRules] = useState([]);
  const [clients, setClients] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [clientAccounts, setClientAccounts] = useState([]);

  const [xplorzGSTFocused, setXplorzGSTFocused] = useState(false);
  const [vendorGSTFocused, setVendorGSTFocused] = useState(true);
  const [vendorTDSPercentFocused, setVendorTDSPercentFocused] = useState(true);
  const [clientBaseAmountFocused, setClientBaseAmountFocused] = useState(false);

  const clientGSTOptions = [
    { value: 'None', label: 'None' },
    { value: 'Vendor GST', label: 'Vendor GST' },
    { value: '5% of Base', label: '5% of Base' },
    { value: '12% of Base', label: '12% of Base' },
  ];

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
    const clientAccounts = await getList('organizations', { is_client: 1 });
    const accounts = await getList('accounts', { category: 'Credit Cards' });
    const vendors = await getList('organizations', { is_vendor: 1 });
    const commissionRules = await getList('commission-rules');
    const clients = await getList('accounts', { category: 'Referrers' });
    const bookingData = await getItem('bookings', router.query.booking_id);

    if (
      accounts?.success &&
      vendors?.success &&
      commissionRules?.success &&
      clients?.success &&
      bookingData?.success &&
      clientAccounts?.success
    ) {
      setClientAccounts(
        clientAccounts.data.map((element) => ({
          value: element.account_id,
          label: element.name,
        }))
      );
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
      for (let opt of clientAccounts.data)
        if (opt.id === bookingData.data.client_id)
          setClientAccountID({ label: opt.name, value: opt.account_id });
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
      payment_account_id: accountID.value,
      refund_to_account_id: clientAccountID?.value,
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
      Number(
        (+vendorBaseAmount || 0) +
          (+vendorYQAmount || 0) +
          (+vendorTaxAmount || 0) +
          (+vendorGSTAmount || 0)
      )
    );
  };

  // Vendor Commission Receivable
  useEffect(() => {
    if (vendorTDSPercentFocused) {
      setVendorTDS(
        Number(
          (((+grossCommission || 0) - (+vendorServiceCharges || 0)) *
            (+vendorTDSPercent || 0)) /
            100
        ).toFixed(4)
      );
    }
  }, [vendorTDSPercent, grossCommission]);

  useEffect(() => {
    if (!vendorTDSPercentFocused) {
      setVendorTDSPercent(
        Number(
          (100 * vendorTDS) / ((+grossCommission || 0) - (+vendorServiceCharges || 0))
        ).toFixed(4)
      );
    }
  }, [vendorTDS, grossCommission]);

  useEffect(() => {
    if (vendorGSTFocused) {
      setVendorServiceCharges(
        Number(
          ((+grossCommission || 0) * (+vendorServiceChargePercent || 0)) / 100
        ).toFixed(4)
      );
    }
  }, [vendorServiceChargePercent, grossCommission]);

  useEffect(() => {
    if (!vendorGSTFocused) {
      setVendorServiceChargePercent(
        Number((100 * (+vendorServiceCharges || 0)) / (+grossCommission || 0)).toFixed(4)
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
      Math.round(
        (+grossCommission || 0) - (+vendorTDS || 0) - (+vendorServiceCharges || 0)
      )
    );
  };

  const calculateGrossCommission = () => {
    if (commissionRuleID) {
      const iata_comm = Number(
        ((+IATACommissionPercent || 0) *
          ((+commissionRuleID.iata_basic || 0) * (+vendorBaseAmount || 0) +
            (+commissionRuleID.iata_yq || 0) * (+vendorYQAmount || 0))) /
          100
      ).toFixed(4);
      const plb_comm = Number(
        ((+plbCommissionPercent || 0) *
          ((+commissionRuleID.plb_basic || 0) * (+vendorBaseAmount || 0) +
            (+commissionRuleID.plb_yq || 0) * (+vendorYQAmount || 0) -
            iata_comm)) /
          100
      ).toFixed(4);
      setGrossCommission(Number((+plb_comm || 0) + (+iata_comm || 0)));
    }
  };

  useEffect(() => {
    if (vendorTaxAmount) setClientTaxAmount(vendorTaxAmount);
  }, [vendorTaxAmount]);

  // Client Calculations
  useEffect(() => {
    if (xplorzGSTFocused) {
      let temp = Number(
        (((+clientBaseAmount || 0) + (+clientReferralFee || 0)) *
          (+clientServiceChargePercent || 0)) /
          100
      ).toFixed(0);
      if (temp && temp !== 'NaN') setClientServicesCharges(temp);
    }
  }, [clientServiceChargePercent, clientReferralFee, clientBaseAmount]);

  useEffect(() => {
    if (!xplorzGSTFocused) {
      setClientServiceChargePercent(
        Number(
          (100 * (+clientServiceCharges || 0)) /
            ((+clientBaseAmount || 0) + (+clientReferralFee || 0))
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

  useEffect(() => {
    if (clientGSTPercent?.value !== null && clientGSTPercent?.value !== undefined) {
      if (clientGSTPercent.label === 'None') setClientGSTAmount(0);
      else if (clientGSTPercent.label === 'Vendor GST')
        setClientGSTAmount(+vendorGSTAmount);
      else if (clientGSTPercent.label === '5% of Base') {
        setClientGSTAmount(
          Number(
            (((+clientQuotedAmount || 0) - (+clientTaxAmount || 0)) * (5 / 100)).toFixed(
              4
            )
          )
        );
      } else if (clientGSTPercent.label === '12% of Base') {
        setClientGSTAmount(
          Number(
            (((+clientQuotedAmount || 0) - (+clientTaxAmount || 0)) * (12 / 100)).toFixed(
              4
            )
          )
        );
      }
    }
  }, [clientGSTPercent]);

  useEffect(() => {
    if (clientBaseAmountFocused)
      setClientQuotedAmount(
        (+clientBaseAmount || 0) + (+clientTaxAmount || 0) + (+clientGSTAmount || 0)
      );
  }, [clientBaseAmount]);

  useEffect(() => {
    if (!clientBaseAmountFocused) updateClientBase();
  }, [clientTaxAmount, clientGSTAmount, clientQuotedAmount]);

  // Client Total
  const updateClientBase = () => {
    if (+clientQuotedAmount > 0)
      setClientBaseAmount(
        (+clientQuotedAmount || 0) - (+clientTaxAmount || 0) - (+clientGSTAmount || 0)
      );
  };

  const updateClientTotal = () => {
    setClientTotal(
      Number(
        (+clientBaseAmount || 0) +
          (+clientGSTAmount || 0) +
          (+clientTaxAmount || 0) +
          (+clientServiceCharges || 0) +
          (+clientReferralFee || 0)
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
                  <form onSubmit={onSubmit} className='row col-12 y-gap-15'>
                    <div className='d-block ml-3 col-lg-4 form-datepicker'>
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
                      <label>Refund To</label>
                      <Select
                        options={clientAccounts}
                        value={clientAccountID}
                        onChange={(id) => setClientAccountID(id)}
                      />
                    </div>
                    <h2>Refund Amount Classification</h2>
                    <div className='form-input-select col-lg-4'>
                      <label>Client Referrer</label>
                      <Select
                        options={clients}
                        value={clientReferrerID}
                        placeholder='Search & Select Client Referrer'
                        onChange={(id) => setClientReferrerID(id)}
                      />
                    </div>
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setClientReferralFee(e.target.value)}
                          value={clientReferralFee}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Referral Fee
                        </label>
                      </div>
                    </div>
                    <h3>Supplier Details</h3>
                    <div className='form-input-select col-lg-4 '>
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
                    <div className='col-lg-4 '>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setVendorBaseAmount(e.target.value)}
                          value={vendorBaseAmount}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor Base Amount
                        </label>
                      </div>
                    </div>
                    <div className='col-lg-4 '>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setVendorYQAmount(e.target.value)}
                          value={vendorYQAmount}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor YQ Amount
                        </label>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setVendorTaxAmount(e.target.value)}
                          value={vendorTaxAmount}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor Tax Amount
                        </label>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setVendorGSTAmount(e.target.value)}
                          value={vendorGSTAmount}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor GST Amount
                        </label>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          className='bg-light'
                          onChange={(e) => setVendorTotal(e.target.value)}
                          value={vendorTotal}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                          disabled
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor Total<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='form-input-select col-lg-4'>
                      <label>Commission Rule</label>
                      <Select
                        options={commissionRules}
                        value={commissionRuleID}
                        placeholder='Search & Select Commission Rule'
                        onChange={(id) => setCommissionRuleID(id)}
                      />
                    </div>
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setIATACommissionPercent(e.target.value)}
                          value={IATACommissionPercent}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          IATA Commission Percent
                        </label>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setPLBCommissionPercent(e.target.value)}
                          value={plbCommissionPercent}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          PLB Commission Percent
                        </label>
                      </div>
                    </div>
                    <div className='col-lg-4 pr-0'>
                      <div className='row'>
                        <label className='col-12 fw-500 mb-4'>
                          Vendor Service Charges
                        </label>
                        <div className='form-input col-4'>
                          <input
                            style={{
                              height: '50px',
                              minHeight: 'unset',
                              paddingTop: 'unset',
                              backgroundColor: '#ffe',
                            }}
                            onChange={(e) =>
                              setVendorServiceChargePercent(e.target.value)
                            }
                            value={vendorServiceChargePercent}
                            placeholder=' '
                            type='number'
                            onWheel={(e) => e.target.blur()}
                            onFocus={() => setVendorGSTFocused(true)}
                          />
                          <label className='lh-1 text-16 text-light-1'></label>
                          <div className='d-flex items-center ml-10'>%</div>
                        </div>{' '}
                        <div className='d-flex col-8 items-center gap-2 pr-30 lg:pr-0'>
                          <label>Amount</label>
                          <div className='form-input'>
                            <input
                              style={{
                                height: '50px',
                                minHeight: 'unset',
                                paddingTop: 'unset',
                              }}
                              onChange={(e) => setVendorServiceCharges(e.target.value)}
                              value={vendorServiceCharges}
                              placeholder=' '
                              type='number'
                              onWheel={(e) => e.target.blur()}
                              onFocus={() => setVendorGSTFocused(false)}
                            />
                            <label className='lh-1 text-16 text-light-1'></label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-4 pr-0'>
                      <div className='row'>
                        <label className='col-12 fw-500 mb-4'>Vendor TDS Amount</label>
                        <div className='form-input col-4'>
                          <input
                            style={{
                              height: '50px',
                              minHeight: 'unset',
                              paddingTop: 'unset',
                              backgroundColor: '#ffe',
                            }}
                            onChange={(e) => setVendorTDSPercent(e.target.value)}
                            value={vendorTDSPercent}
                            placeholder=' '
                            type='number'
                            onWheel={(e) => e.target.blur()}
                            onFocus={() => setVendorTDSPercentFocused(true)}
                          />
                          <label className='lh-1 text-16 text-light-1'></label>
                          <div className='d-flex items-center ml-10'>%</div>
                        </div>
                        <div className='d-flex col-8 items-center gap-2 pr-30 lg:pr-0'>
                          <label>Amount</label>
                          <div className='form-input'>
                            <input
                              style={{
                                height: '50px',
                                minHeight: 'unset',
                                paddingTop: 'unset',
                              }}
                              onChange={(e) => setVendorTDS(e.target.value)}
                              value={vendorTDS}
                              placeholder=' '
                              type='number'
                              onWheel={(e) => e.target.blur()}
                              onFocus={() => setVendorTDSPercentFocused(false)}
                            />
                            <label className='lh-1 text-16 text-light-1'></label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-4 pt-35 lg:pt-10'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setCommissionReceivable(e.target.value)}
                          value={commissionReceivable}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                          disabled
                          className='bg-light'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Commission Receivable
                        </label>
                      </div>
                    </div>
                    <h3>Client Details</h3>
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setClientQuotedAmount(e.target.value)}
                          value={clientQuotedAmount}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                          onFocus={() => setXplorzGSTFocused(true)}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Quoted Amount
                        </label>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setClientBaseAmount(e.target.value)}
                          value={clientBaseAmount}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Base Amount
                        </label>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setClientTaxAmount(e.target.value)}
                          value={clientTaxAmount}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Tax Amount
                        </label>
                      </div>
                    </div>
                    <div className='col-lg-4 pr-0'>
                      <div className='row'>
                        <label className='col-12 fw-500 mb-4'>Client GST Amount</label>
                        <div className='form-input-select col-6'>
                          <label></label>
                          <Select
                            className='small'
                            onChange={(id) => setClientGSTPercent(id)}
                            defaultValue={{ value: 0, label: 'None' }}
                            options={clientGSTOptions}
                            value={clientGSTPercent}
                          />
                        </div>
                        <div className='form-input col-lg-6 pr-30 lg:pr-0'>
                          <input
                            style={{
                              height: '50px',
                              minHeight: 'unset',
                              paddingTop: 'unset',
                            }}
                            onChange={(e) => setClientGSTAmount(e.target.value)}
                            value={clientGSTAmount}
                            placeholder=' '
                            type='number'
                            onWheel={(e) => e.target.blur()}
                            required
                            disabled
                            className='bg-light'
                          />
                          <label className='lh-1 text-16 text-light-1'></label>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-4 pr-0'>
                      <div className='row'>
                        <label className='col-12 fw-500 mb-4'>Xplorz GST Amount</label>
                        <div className='form-input col-4'>
                          <input
                            style={{
                              height: '50px',
                              minHeight: 'unset',
                              paddingTop: 'unset',
                              backgroundColor: '#ffe',
                            }}
                            onChange={(e) =>
                              setClientServiceChargePercent(e.target.value)
                            }
                            value={clientServiceChargePercent}
                            placeholder=' '
                            onFocus={() => setXplorzGSTFocused(true)}
                            type='number'
                            onWheel={(e) => e.target.blur()}
                          />
                          <label className='lh-1 text-16 text-light-1'></label>
                          <span className='d-flex items-center ml-10'>%</span>
                        </div>
                        <div className='d-flex col-8 items-center gap-2 pr-30 lg:pr-0'>
                          <label>Amount</label>
                          <div className='form-input'>
                            <input
                              style={{
                                height: '50px',
                                minHeight: 'unset',
                                paddingTop: 'unset',
                              }}
                              onChange={(e) => setClientServicesCharges(e.target.value)}
                              value={clientServiceCharges}
                              placeholder=' '
                              type='number'
                              onWheel={(e) => e.target.blur()}
                              onFocus={() => setXplorzGSTFocused(false)}
                            />
                            <label className='lh-1 text-16 text-light-1'></label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-4 pt-35 lg:pt-10'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setClientTotal(e.target.value)}
                          value={clientTotal}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                          required
                          disabled
                          className='bg-light'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Total<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-lg-4'>
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
                    <div className='col-lg-4'>
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
                    <div className='col-lg-4'>
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
                    <div className='form-input-select col-lg-4'>
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
                    <div className='col-lg-4'>
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
                    <div className='col-lg-4'>
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

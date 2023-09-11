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
  const [refundBookingData, setRefundBookingData] = useState(null);
  const [clientQuotedAmount, setClientQuotedAmount] = useState(0);
  const [isOffshore, setIsOffshore] = useState(false);
  const [bookingType, setBookingType] = useState(null);
  const [number, setNumber] = useState('');
  const [clientRefundAmount, setClientRefundAmount] = useState(0);

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

  const [loaded, setLoaded] = useState(false);

  const [xplorzGSTFocused, setXplorzGSTFocused] = useState(false);
  const [vendorGSTFocused, setVendorGSTFocused] = useState(false);
  const [vendorTDSPercentFocused, setVendorTDSPercentFocused] = useState(false);
  const [clientBaseAmountFocused, setClientBaseAmountFocused] = useState(false);

  // Checks
  const [grossFirstTime, setGrossFirstTime] = useState(false);

  const clientGSTOptions = [
    { value: 'None', label: 'None' },
    { value: 'Vendor GST', label: 'Vendor GST' },
    { value: '5% of Base', label: '5% of Base' },
    { value: '12% of Base', label: '12% of Base' },
  ];
  // Dropdown Options
  const bookingOptions = [
    { value: 'Domestic Flight Ticket', label: 'Domestic Flight Ticket' },
    { value: 'International Flight Ticket', label: 'International Flight Ticket' },
    { value: 'Miscellaneous', label: 'Miscellaneous' },
  ];

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      getData();
    }
  }, [router.isReady]);

  const getData = async () => {
    if (router.query.edit) {
      const response = await getItem('partial-refunds', router.query.edit);
      if (response?.success) {
        const clientAccounts = await getList('organizations', { is_client: 1 });
        const accounts = await getList('accounts', { category: 'Credit Cards' });
        const vendors = await getList('organizations', { is_vendor: 1 });
        const commissionRules = await getList('commission-rules');
        const clients = await getList('accounts', { category: 'Referrers' });
        const bookingData = await getItem('bookings', response.data.booking_id);
        let refundData;
        if (
          accounts?.success &&
          vendors?.success &&
          commissionRules?.success &&
          clients?.success &&
          bookingData?.success &&
          clientAccounts?.success
        ) {
          if (bookingData?.data?.original_booking_id) {
            refundData = await getItem('bookings', bookingData.data.original_booking_id);
            if (refundData?.success) {
              setRefundBookingData(refundData.data);
            } else {
              sendToast('error');
            }
          }
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
          setNumber(response.data.number);
          setBookingData(bookingData.data);
          // Prefilling
          setAirlineCancellationCharges(
            (+response.data.airline_cancellation_charges || 0).toFixed(0)
          );
          setRefundAmount((+response.data.refund_amount || 0).toFixed(0));
          setVendorServiceFee((+response.data.vendor_service_fee || 0).toFixed(0));
          setClientCancellationCharges(
            (+response.data.client_cancellation_charges || 0).toFixed(0)
          );
          setVendorBaseAmount((+response.data.vendor_base_amount || 0).toFixed(0));
          setVendorYQAmount((+response.data.vendor_yq_amount || 0).toFixed(0));
          setVendorTaxAmount((+response.data.vendor_tax_amount || 0).toFixed(0));
          setVendorGSTAmount((+response.data.vendor_gst_amount || 0).toFixed(0));
          setIATACommissionPercent(response.data.iata_commission_percent);
          setPLBCommissionPercent(response.data.plb_commission_percent);
          setVendorServiceCharges(
            (+response.data.vendor_service_charges || 0).toFixed(0)
          );
          setVendorTDS((+response.data.vendor_tds || 0).toFixed(0));
          setClientReferralFee((+response.data.client_referral_fee || 0).toFixed(0));
          setReason(response.data.reason);
          setClientBaseAmount((+response.data.client_base_amount || 0).toFixed(0));
          setClientGSTAmount((+response.data.client_gst_amount || 0).toFixed(0));
          setIsOffshore(response.data?.is_offshore);
          setClientServicesCharges(
            (+response.data.client_service_charges || 0).toFixed(0)
          );
          setClientTaxAmount((+response.data.client_tax_amount || 0).toFixed(0));
          setVendorTotal((+response.data.vendor_total || 0).toFixed(0));
          setClientQuotedAmount(
            (
              +response.data.client_base_amount +
              +response.data.client_tax_amount +
              +response.data.client_gst_amount
            ).toFixed(0)
          );
          // Setting Client GST Percent
          if (
            Number(
              (
                (+response.data.client_gst_amount * 100) /
                (+response.data.client_base_amount + +response.data.client_gst_amount)
              ).toFixed(0)
            ) === 5
          )
            setClientGSTPercent({ value: '5% of Base', label: '5% of Base' });
          else if (
            Number(
              (
                (+response.data.client_gst_amount * 100) /
                (+response.data.client_base_amount + +response.data.client_gst_amount)
              ).toFixed(0)
            ) === 12
          )
            setClientGSTPercent({ value: '12% of Base', label: '12% of Base' });
          else if (response.data.client_gst_amount === 0)
            setClientGSTPercent({ value: 'None', label: 'None' });
          else if (response.data.client_gst_amount === response.data.vendor_gst_amount)
            setClientGSTPercent({ value: 'Vendor GST', label: 'Vendor GST' });

          // Setting Vendor
          for (let vendor of vendors.data)
            if (vendor.id === response.data.vendor_id)
              setVendorID({ value: vendor.id, label: vendor.name });
          //  Commission Rule
          for (let cr of commissionRules.data)
            if (cr.id === response.data.commission_rule_id)
              setCommissionRuleID({
                value: cr.id,
                label: cr.name,
                iata_basic: cr.iata_basic,
                iata_yq: cr.iata_yq,
                plb_basic: cr.plb_basic,
                plb_yq: cr.plb_yq,
              });
          // Booking Type
          for (let option of bookingOptions)
            if (option.value === bookingData.data.booking_type) setBookingType(option);
          // Setting Refund To Acc
          for (let opt of clientAccounts.data)
            if (opt.account_id === response.data.refund_to_account_id)
              setClientAccountID({ label: opt.name, value: opt.account_id });
          // Setting Payment Refunded To Acc
          for (let opt of accounts.data)
            if (opt.id === response.data.payment_account_id)
              setAccountID({ label: opt.name, value: opt.id });
          // Setting Client Referrer
          for (let ref of clients.data)
            if (ref.id === response.data.client_referrer_id)
              setClientReferrerID({ value: ref.id, label: ref.name });
          setTimeout(() => {
            setLoaded(true);
          }, 1000);
        } else {
          sendToast('error', 'Unable to fetch required data', 4000);
          router.push('/dashboard/partial-refunds');
        }
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Failed to Fetch Required Data.',
          4000
        );
        router.push('/dashboard/partial-refunds');
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!clientAccountID?.value) {
      sendToast('error', 'You must select a Refund To Account', 4000);
      return;
    }
    if (!vendorID?.value) {
      sendToast('error', 'You must select a Vendor', 4000);
      return;
    }
    const response = await updateItem('partial-refunds', router.query.edit, {
      refund_date: refundDate.format('YYYY-MM-DD'),
      vendor_id: vendorID.value,
      vendor_base_amount: vendorBaseAmount || 0,
      vendor_yq_amount: vendorYQAmount || 0,
      vendor_tax_amount: vendorTaxAmount || 0,
      vendor_gst_amount: vendorGSTAmount || 0,
      vendor_total: vendorTotal || 0,
      commission_rule_id: commissionRuleID?.value,
      iata_commission_percent: IATACommissionPercent || 0,
      plb_commission_percent: plbCommissionPercent || 0,
      vendor_service_charges: vendorServiceCharges || 0,
      vendor_tds: vendorTDS || 0,
      commission_receivable: commissionReceivable,
      client_referrer_id: clientReferrerID?.value,
      client_referral_fee: clientReferralFee || 0,
      client_base_amount: clientBaseAmount || 0,
      client_tax_amount: clientTaxAmount || 0,
      client_gst_amount: clientGSTAmount || 0,
      client_service_charges: isOffshore ? 0 : clientServiceCharges || 0,
      client_total: clientTotal || 0,
      airline_cancellation_charges: airlineCancellationCharges || 0,
      vendor_service_fee: vendorServiceFee || 0,
      client_cancellation_charges: clientCancellationCharges || 0,
      refund_amount: +refundAmount === 0 ? undefined : refundAmount || undefined,
      payment_account_id: accountID?.value || undefined,
      refund_to_account_id: clientAccountID?.value || undefined,
      reason,
    });
    if (response?.success) {
      sendToast('success', 'Updated Partial Refund Successfully.', 4000);
      router.push('/dashboard/partial-refunds');
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Failed to Update Partial Refund.',
        4000
      );
    }
  };

  // Calculation
  useEffect(() => {
    if (loaded)
      if (bookingData && accountID) {
        const payment =
          (+vendorBaseAmount || 0) +
          (+vendorYQAmount || 0) +
          (+vendorTaxAmount || 0) +
          (+vendorGSTAmount || 0);
        if (payment)
          setRefundAmount((+payment || 0) - (+airlineCancellationCharges || 0));
      }
  }, [bookingData, airlineCancellationCharges, accountID, refundBookingData]);

  useEffect(() => {
    if (bookingType?.value) {
      const payment = (
        (+clientTotal || 0) -
        (bookingType?.value === 'Domestic Flight Ticket' ? 1.009 : 1.018) *
          (+clientCancellationCharges || 0)
      ).toFixed(0);
      if (payment) setClientRefundAmount(payment);
    }
  }, [clientTotal, clientCancellationCharges, bookingType]);

  // Offshore
  useEffect(() => {
    if (isOffshore) {
      setClientServiceChargePercent(0);
      setClientServicesCharges(0);
    }
  }, [isOffshore]);

  useEffect(() => {
    if (vendorID?.value) {
      setVendorServiceChargePercent(vendorID?.vendor_service_charge_percentage);
      setVendorTDSPercent(vendorID?.vendor_tds_percentage);
    }
  }, [vendorID]);

  // Vendor Calculations

  // Vendor Total
  useEffect(
    () => updateVendorTotal(),
    [vendorBaseAmount, vendorYQAmount, vendorTaxAmount, vendorGSTAmount]
  );

  const updateVendorTotal = () => {
    if (loaded) {
      let vendorTotal = Number(
        (+vendorBaseAmount || 0) +
          (+vendorYQAmount || 0) +
          (+vendorTaxAmount || 0) +
          (+vendorGSTAmount || 0)
      ).toFixed(0);
      setVendorTotal(vendorTotal);
    }
  };

  const updateVendorTDS = (grossCommission, vendorServiceCharges, vendorTDSPercent) => {
    if (vendorTDSPercentFocused) {
      let vendorTDS = Number(
        (((+grossCommission || 0) - (+vendorServiceCharges || 0)) *
          (+vendorTDSPercent || 0)) /
          100
      ).toFixed(0);
      setVendorTDS(vendorTDS);
    }
  };

  const updateVendorTDSPercent = (vendorTDS, grossCommission, vendorServiceCharges) => {
    if (!vendorTDSPercentFocused)
      setVendorTDSPercent(
        Number(
          (100 * vendorTDS) / ((+grossCommission || 0) - (+vendorServiceCharges || 0))
        ).toFixed(2)
      );
  };

  const updateVendorServiceCharges = (grossCommission, vendorServiceChargePercent) => {
    if (vendorGSTFocused) {
      let vendorServiceCharges = Number(
        ((+grossCommission || 0) * (+vendorServiceChargePercent || 0)) / 100
      ).toFixed(0);
      setVendorServiceCharges(vendorServiceCharges);
      // Update
      updateVendorTDS(grossCommission, vendorServiceCharges, vendorTDSPercent);
    }
  };

  const updateVendorServiceChargePercent = (vendorServiceCharges, grossCommission) => {
    if (!vendorGSTFocused)
      setVendorServiceChargePercent(
        Number((100 * (+vendorServiceCharges || 0)) / (+grossCommission || 0)).toFixed(2)
      );
  };

  // Vendor Commission Receivable Total
  useEffect(() => {
    updateVendorCommission();
  }, [grossCommission, vendorServiceCharges, vendorTDS]);

  const updateVendorCommission = () => {
    setCommissionReceivable(
      Math.round(
        (+grossCommission || 0) - (+vendorTDS || 0) - (+vendorServiceCharges || 0)
      )
    );
  };

  useEffect(() => {
    calculateGrossCommission();
  }, [
    commissionRuleID,
    IATACommissionPercent,
    plbCommissionPercent,
    vendorBaseAmount,
    vendorYQAmount,
    bookingType,
  ]);

  const calculateGrossCommission = () => {
    if (commissionRuleID || bookingType?.value === 'Miscellaneous') {
      const iata_comm =
        bookingType?.value === 'Miscellaneous'
          ? Number(
              ((+IATACommissionPercent || 0) * (+vendorBaseAmount || 0)) / 100
            ).toFixed(0)
          : Number(
              ((+IATACommissionPercent || 0) *
                ((+commissionRuleID.iata_basic || 0) * (+vendorBaseAmount || 0) +
                  (+commissionRuleID.iata_yq || 0) * (+vendorYQAmount || 0))) /
                100
            ).toFixed(0);
      const plb_comm =
        bookingType?.value === 'Miscellaneous'
          ? 0
          : Number(
              ((+plbCommissionPercent || 0) *
                ((+commissionRuleID.plb_basic || 0) * (+vendorBaseAmount || 0) +
                  (+commissionRuleID.plb_yq || 0) * (+vendorYQAmount || 0) -
                  iata_comm)) /
                100
            ).toFixed(0);
      let grossCommission = Number((+plb_comm || 0) + (+iata_comm || 0));
      setGrossCommission(grossCommission);
      // Calls after gross commission is updated
      if (grossFirstTime) {
        updateVendorTDS(grossCommission, vendorServiceCharges, vendorTDSPercent);
        updateVendorTDSPercent(vendorTDS, grossCommission, vendorServiceCharges);
        updateVendorServiceCharges(grossCommission, vendorServiceChargePercent);
        updateVendorServiceChargePercent(vendorServiceCharges, grossCommission);
      } else {
        updateVendorTDSPercent(vendorTDS, grossCommission, vendorServiceCharges);
        updateVendorServiceChargePercent(vendorServiceCharges, grossCommission);
        updateSetClientServiceChargePercent(
          clientServiceCharges,
          clientBaseAmount,
          clientReferralFee
        );
        setVendorGSTFocused(true);
        setVendorTDSPercentFocused(true);
        setGrossFirstTime(true);
      }
    }
  };

  // Client Calculations

  const updateClientTaxAmount = (vendorTaxAmount) => {
    if (vendorTaxAmount) {
      setClientTaxAmount(vendorTaxAmount);
      // Updating
      updateClientBase(clientQuotedAmount, vendorTaxAmount, clientGSTAmount);
    }
  };

  const updateSetClientServiceCharges = (
    clientBaseAmount,
    clientReferralFee,
    clientServiceChargePercent
  ) => {
    let clientServiceCharges = Number(
      (((+clientBaseAmount || 0) + (+clientReferralFee || 0)) *
        (+clientServiceChargePercent || 0)) /
        100
    ).toFixed(0);
    if (clientServiceCharges && clientServiceCharges !== 'NaN') {
      setClientServicesCharges(clientServiceCharges);
    }
  };

  const updateSetClientServiceChargePercent = (
    clientServiceCharges,
    clientBaseAmount,
    clientReferralFee
  ) => {
    setClientServiceChargePercent(
      Number(
        (100 * (+clientServiceCharges || 0)) /
          ((+clientBaseAmount || 0) + (+clientReferralFee || 0))
      ).toFixed(2)
    );
  };

  const updateClientGSTAmount = (
    clientGSTPercent,
    vendorGSTAmount,
    clientQuotedAmount,
    clientTaxAmount
  ) => {
    if (clientGSTPercent?.value !== null && clientGSTPercent?.value !== undefined) {
      let clientGSTAmount = '';
      if (clientGSTPercent?.label === 'None') clientGSTAmount = 0;
      else if (clientGSTPercent?.label === 'Vendor GST')
        clientGSTAmount = +vendorGSTAmount;
      else if (clientGSTPercent?.label === '5% of Base') {
        clientGSTAmount = Number(
          (((+clientQuotedAmount || 0) - (+clientTaxAmount || 0)) * (5 / 100)).toFixed(0)
        );
      } else if (clientGSTPercent?.label === '12% of Base') {
        clientGSTAmount = Number(
          (((+clientQuotedAmount || 0) - (+clientTaxAmount || 0)) * (12 / 100)).toFixed(0)
        );
      }
      setClientGSTAmount(clientGSTAmount);
      // Updating Base Amount
      updateClientBase(clientQuotedAmount, clientTaxAmount, clientGSTAmount);
    }
  };

  const updateClientQuotedAmount = (
    clientBaseAmount,
    clientTaxAmount,
    clientGSTAmount
  ) => {
    setClientQuotedAmount(
      (+clientBaseAmount || 0) + (+clientTaxAmount || 0) + (+clientGSTAmount || 0)
    );
  };

  // Client Total
  const updateClientBase = (clientQuotedAmount, clientTaxAmount, clientGSTAmount) => {
    if (+clientQuotedAmount > 0) {
      let clientBaseAmount =
        (+clientQuotedAmount || 0) - (+clientTaxAmount || 0) - (+clientGSTAmount || 0);
      setClientBaseAmount(clientBaseAmount);
      // Updating
      updateSetClientServiceCharges(
        clientBaseAmount,
        clientReferralFee,
        clientServiceChargePercent
      );
    }
  };

  useEffect(() => {
    updateClientTotal();
  }, [
    clientServiceCharges,
    clientTaxAmount,
    clientGSTAmount,
    clientReferralFee,
    clientBaseAmount,
  ]);

  const updateClientTotal = () => {
    setClientTotal(
      Number(
        (+clientBaseAmount || 0) +
          (+clientGSTAmount || 0) +
          (+clientTaxAmount || 0) +
          (+clientServiceCharges || 0) +
          (+clientReferralFee || 0)
      ).toFixed(0)
    );
  };

  return (
    <>
      <Seo pageTitle={`Update Partial Refund ${number}`} />
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
                  <h1 className='text-30 lh-14 fw-600'>
                    Update Partial Refund - {bookingData?.number}
                  </h1>
                  <div className='text-15 text-light-1'>
                    Update an existing partial refund.
                  </div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-10 x-gap-10'>
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
                      <label>
                        Refund To<span className='text-danger'>*</span>
                      </label>
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
                        isClearable
                        options={clients}
                        value={clientReferrerID}
                        placeholder='Search & Select Client Referrer'
                        onChange={(id) => setClientReferrerID(id)}
                      />
                    </div>
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => {
                            setClientReferralFee(e.target.value);
                            updateSetClientServiceCharges(
                              clientBaseAmount,
                              e.target.value,
                              clientServiceChargePercent
                            );
                          }}
                          value={clientReferralFee}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                          onFocus={() => setXplorzGSTFocused(true)}
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
                    {bookingType?.value !== 'Miscellaneous' && (
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
                    )}
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => {
                            setVendorTaxAmount(e.target.value);
                            updateClientTaxAmount(e.target.value);
                          }}
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
                          onChange={(e) => {
                            setVendorGSTAmount(e.target.value);
                            updateClientGSTAmount(
                              clientGSTPercent,
                              e.target.value,
                              clientQuotedAmount,
                              clientTaxAmount
                            );
                          }}
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
                    {bookingType?.value === 'Miscellaneous' && (
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
                            Vendor Commission Percent
                          </label>
                        </div>
                      </div>
                    )}
                    {bookingType?.value !== 'Miscellaneous' && (
                      <>
                        <div className='form-input-select col-lg-4'>
                          <label>Commission Rule</label>
                          <Select
                            options={commissionRules}
                            value={commissionRuleID}
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
                              onChange={(e) => {
                                setPLBCommissionPercent(e.target.value);
                              }}
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
                      </>
                    )}
                    <div className='col-lg-4 pr-0'>
                      <div className='row'>
                        <label className='col-12 fw-500 mb-4'>
                          Vendor GST on Commission
                        </label>
                        <div className='form-input col-4'>
                          <input
                            style={{
                              height: '50px',
                              minHeight: 'unset',
                              paddingTop: 'unset',
                              backgroundColor: '#ffe',
                            }}
                            onChange={(e) => {
                              setVendorServiceChargePercent(e.target.value);
                              updateVendorServiceCharges(grossCommission, e.target.value);
                            }}
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
                              onChange={(e) => {
                                setVendorServiceCharges(e.target.value);
                                updateVendorServiceChargePercent(
                                  e.target.value,
                                  grossCommission
                                );
                              }}
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
                            onChange={(e) => {
                              setVendorTDSPercent(e.target.value);
                              updateVendorTDS(
                                grossCommission,
                                vendorServiceCharges,
                                e.target.value
                              );
                            }}
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
                              onChange={(e) => {
                                setVendorTDS(e.target.value);
                                updateVendorTDSPercent(
                                  e.target.value,
                                  grossCommission,
                                  vendorServiceCharges
                                );
                              }}
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
                          onChange={(e) => {
                            setClientQuotedAmount(e.target.value);
                            updateClientBase(
                              e.target.value,
                              clientTaxAmount,
                              clientGSTAmount
                            );
                          }}
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
                          onChange={(e) => {
                            setClientBaseAmount(e.target.value);
                            updateSetClientServiceCharges(
                              e.target.value,
                              clientReferralFee,
                              clientServiceChargePercent
                            );
                            updateClientQuotedAmount(
                              e.target.value,
                              clientTaxAmount,
                              clientGSTAmount
                            );
                          }}
                          value={clientBaseAmount}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                          onFocus={() => {
                            setClientBaseAmountFocused(true);
                            setXplorzGSTFocused(true);
                          }}
                          onBlur={() => {
                            setClientBaseAmountFocused(false);
                            updateClientGSTAmount(
                              clientGSTPercent,
                              vendorGSTAmount,
                              clientQuotedAmount,
                              clientTaxAmount
                            );
                          }}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Base Amount
                        </label>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => {
                            setClientTaxAmount(e.target.value);
                            updateClientBase(
                              clientQuotedAmount,
                              e.target.value,
                              clientGSTAmount
                            );
                          }}
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
                            onChange={(id) => {
                              setClientGSTPercent(id);
                              updateClientGSTAmount(
                                id,
                                vendorGSTAmount,
                                clientQuotedAmount,
                                clientTaxAmount
                              );
                            }}
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
                            onChange={(e) => {
                              setClientGSTAmount(e.target.value);
                              updateClientBase(
                                clientQuotedAmount,
                                clientTaxAmount,
                                e.target.value
                              );
                            }}
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
                    {!isOffshore && (
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
                              onChange={(e) => {
                                setClientServiceChargePercent(e.target.value);
                                updateSetClientServiceCharges(
                                  clientBaseAmount,
                                  clientReferralFee,
                                  e.target.value
                                );
                              }}
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
                                onChange={(e) => {
                                  setClientServicesCharges(e.target.value);
                                  updateSetClientServiceChargePercent(
                                    e.target.value,
                                    clientBaseAmount,
                                    clientReferralFee
                                  );
                                }}
                                value={clientServiceCharges}
                                placeholder=' '
                                type='number'
                                onWheel={(e) => e.target.blur()}
                                onFocus={() => setXplorzGSTFocused(false)}
                                onBlur={() => setXplorzGSTFocused(true)}
                              />
                              <label className='lh-1 text-16 text-light-1'></label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
                    <div className='d-flex items-center gap-3'>
                      <ReactSwitch
                        onChange={() => setIsOffshore((prev) => !prev)}
                        checked={isOffshore}
                      />
                      <label>Is Offshore</label>
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
                      <label>Payment Refunded To</label>
                      <Select
                        isClearable
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
                        <label className='lh-1 text-16 text-light-1'>Comment</label>
                      </div>
                    </div>
                    <div className='row justify-between'>
                      <div className='col-lg-3'>
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
                      <div className='col-lg-3 text-right'>
                        <p>
                          <strong>Client Refund Amount:</strong> {clientRefundAmount || 0}
                        </p>
                      </div>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Update Partial Refund
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

import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getList } from '../../../../api/xplorzApi';
import ReactSwitch from 'react-switch';
import Select from 'react-select';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { BiPlusMedical } from 'react-icons/bi';
import { BsTrash3 } from 'react-icons/bs';
import AirportSearch from '../../../../components/flight-list/common/AirportSearch';

const AddNewBooking = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [pnr, setPNR] = useState('');
  const [vendorBaseAmount, setVendorBaseAmount] = useState(0);
  const [vendorYQAmount, setVendorYQAmount] = useState(0);
  const [vendorTaxAmount, setVendorTaxAmount] = useState(0);
  const [vendorGSTAmount, setVendorGSTAmount] = useState(0);
  const [vendorMiscCharges, setVendorMiscChargers] = useState(0);
  const [vendorTotal, setVendorTotal] = useState(0);
  const [IATACommissionPercent, setIATACommissionPercent] = useState('');
  const [plbCommissionPercent, setPLBCommissionPercent] = useState('');
  const [vendorServiceCharges, setVendorServiceCharges] = useState(0);
  const [vendorTDS, setVendorTDS] = useState(0);
  const [commissionReceivable, setCommissionReceivable] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [clientReferralFee, setClientReferralFee] = useState('');
  const [clientBaseAmount, setClientBaseAmount] = useState(0);
  const [clientTaxAmount, setClientTaxAmount] = useState(0);
  const [clientGSTAmount, setClientGSTAmount] = useState(0);
  const [clientServiceCharges, setClientServicesCharges] = useState(0);
  const [clientTotal, setClientTotal] = useState(0);
  const [reissuePenalty, setReissuePenalty] = useState('');
  const [sector, setSector] = useState('');
  const [bookingSectors, setBookingSectors] = useState([]);
  const [grossCommission, setGrossCommission] = useState(0);
  const [isOffshore, setIsOffshore] = useState(false);
  const [clientQuotedAmount, setClientQuotedAmount] = useState(0);

  // Percentages
  const [vendorServiceChargePercent, setVendorServiceChargePercent] = useState(18);
  const [vendorTDSPercent, setVendorTDSPercent] = useState(5);
  const [clientServiceChargePercent, setClientServiceChargePercent] = useState(0);
  const [clientGSTPercent, setClientGSTPercent] = useState(null);

  // Dates
  const [bookingDate, setBookingDate] = useState(new DateObject());
  // Dropdowns
  const [clientID, setClientID] = useState(null);
  const [bookingType, setBookingType] = useState(null);
  const [miscellaneousType, setMiscellaneousType] = useState(null);
  const [vendorID, setVendorID] = useState(null);
  const [commissionRuleID, setCommissionRuleID] = useState(null);
  const [airlineID, setAirlineID] = useState(null);
  const [paymentAccountID, setPaymentAccountID] = useState(null);
  const [clientReferrerID, setClientReferrerID] = useState(null);
  const [clientTravellerID, setClientTravellerID] = useState(null);

  // Dropdown Options
  const bookingOptions = [
    { value: 'Domestic Flight Ticket', label: 'Domestic Flight Ticket' },
    { value: 'International Flight Ticket', label: 'International Flight Ticket' },
    { value: 'Miscellaneous', label: 'Miscellaneous' },
  ];
  const miscellaneousOptions = [
    { value: 'Car Rental', label: 'Car Rental' },
    { value: 'Ex Gratia Reversal - GOI', label: 'Ex Gratia Reversal - GOI' },
    { value: 'Foreign Exchange', label: 'Foreign Exchange' },
    { value: 'Hotel Booking', label: 'Hotel Booking' },
    { value: 'Insurance', label: 'Insurance' },
    { value: 'Miscellaneous', label: 'Miscellaneous' },
    { value: 'Visa Application', label: 'Visa Application' },
  ];
  const clientGSTOptions = [
    { value: 'None', label: 'None' },
    { value: 'Vendor GST', label: 'Vendor GST' },
    { value: '5% of Base', label: '5% of Base' },
    { value: '12% of Base', label: '12% of Base' },
  ];
  const bookingClassOptions = [
    { value: 'Economy', label: 'Economy' },
    { value: 'Premium Economy', label: 'Premium Economy' },
    { value: 'Business', label: 'Business' },
    { value: 'First', label: 'First' },
  ];

  const [vendors, setVendors] = useState([]);
  const [commissionRules, setCommissionRules] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientTravellers, setClientTravellers] = useState([]);
  const [clientOrgs, setClientOrgs] = useState([]);
  const [airportOptions, setAirportOptions] = useState([]);

  const [xplorzGSTFocused, setXplorzGSTFocused] = useState(false);
  const [vendorGSTFocused, setVendorGSTFocused] = useState(true);
  const [vendorTDSPercentFocused, setVendorTDSPercentFocused] = useState(true);
  const [clientBaseAmountFocused, setClientBaseAmountFocused] = useState(false);

  const airports = useSelector((state) => state.apis.value.airports);
  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  const permissions = useSelector((state) => state.auth.value.permissions);

  useEffect(() => {
    if (router.isReady) getData();
  }, [router.isReady]);

  const getData = async () => {
    const bType = router.query?.type;
    if (bType) {
      if (bType === 'domestic') {
        setBookingType({
          value: 'Domestic Flight Ticket',
          label: 'Domestic Flight Ticket',
        });
      } else if (bType === 'international') {
        setBookingType({
          value: 'International Flight Ticket',
          label: 'International Flight Ticket',
        });
      } else if (bType === 'misc') {
        setBookingType({ value: 'Miscellaneous', label: 'Miscellaneous' });
      } else {
        router.back();
      }
    } else {
      router.back();
    }
    if (airports && airports?.length > 0) setAirportOptions(airports.map((e) => e));
    const vendors = await getList('organizations', { is_vendor: 1 });
    const clientOrgs = await getList('organizations', { is_client: 1 });
    const commissionRules = await getList('commission-rules');
    const airlines = await getList('organizations', { is_airline: 1 });
    const paymentAccounts = await getList('accounts', { category: 'Credit Cards' });
    const clients = await getList('accounts', { category: 'Referrers' });
    if (
      vendors?.success &&
      commissionRules?.success &&
      airlines?.success &&
      paymentAccounts?.success &&
      clients?.success &&
      clientOrgs?.success
    ) {
      setClientOrgs(
        clientOrgs.data.map((element) => ({
          value: element.id,
          label: element.name,
        }))
      );
      setVendors(
        vendors.data.map((element) => ({
          vendor_service_charge_percentage: element?.vendor_service_charge_percentage,
          vendor_tds_percentage: element?.vendor_tds_percentage,
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
      setAirlines(
        airlines.data.map((element) => ({
          value: element.id,
          label: element.name,
        }))
      );
      setPaymentAccounts(
        paymentAccounts.data.map((element) => ({
          value: element.id,
          label: element.name,
        }))
      );
      setClients(
        clients.data.map((element) => ({
          value: element.id,
          label: element.name,
        }))
      );
    } else {
      sendToast('error', 'Unable to fetch required data', 4000);
      router.push('/dashboard/bookings');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Checking if required values arent null
    if (!bookingType?.value) {
      sendToast('error', 'Please Select Booking Type', 4000);
      return;
    }
    if (!vendorID?.value) {
      sendToast('error', 'Please Select a Vendor', 4000);
      return;
    }
    if (!clientID?.value) {
      sendToast('error', 'Please Select a Client', 4000);
      return;
    }
    if (!clientTravellerID?.value) {
      sendToast('error', 'Please Select a Client Traveller', 4000);
      return;
    }
    // Checking if all data in booking sectors is filled
    for (let bookingSec of bookingSectors) {
      if (
        !bookingSec?.from_airport?.value ||
        !bookingSec?.to_airport?.value ||
        !bookingSec?.travel_date
      ) {
        sendToast('error', 'Please fill all required details in Booking Sectors', 4000);
        return;
      }
    }
    // Adding response
    const response = await createItem('bookings', {
      booking_type: bookingType.value,
      client_id: clientID?.value,
      booking_date: bookingDate.format('YYYY-MM-DD'),
      ticket_number: ticketNumber.replace(/\W/g, ''),
      pnr,
      vendor_id: vendorID.value,
      vendor_base_amount: vendorBaseAmount || 0,
      vendor_yq_amount: vendorYQAmount || 0,
      vendor_tax_amount: vendorTaxAmount || 0,
      vendor_gst_amount: vendorGSTAmount || 0,
      vendor_misc_charges: vendorMiscCharges || 0,
      vendor_total: vendorTotal || 0,
      commission_rule_id: commissionRuleID?.value,
      iata_commission_percent: IATACommissionPercent || 0,
      plb_commission_percent: plbCommissionPercent || 0,
      vendor_service_charges: vendorServiceCharges || 0,
      vendor_tds: vendorTDS || 0,
      commission_receivable: commissionReceivable,
      airline_id: airlineID?.value,
      miscellaneous_type: miscellaneousType?.value,
      payment_account_id: paymentAccountID?.value,
      payment_amount: +paymentAmount || 0,
      client_referrer_id: clientReferrerID?.value,
      client_referral_fee: +clientReferralFee
        ? clientReferralFee || undefined
        : undefined,
      client_base_amount: clientBaseAmount || 0,
      client_tax_amount: clientTaxAmount || 0,
      client_gst_amount: clientGSTAmount || 0,
      client_service_charges: isOffshore ? 0 : clientServiceCharges || 0,
      client_total: clientTotal || 0,
      client_traveller_id: clientTravellerID?.value,
      booking_sectors:
        bookingType.value === 'Miscellaneous'
          ? undefined
          : bookingSectors.map((element) => ({
              from_airport: element['from_airport']?.value,
              to_airport: element['to_airport']?.value,
              travel_date: element['travel_date']?.format('YYYY-MM-DD'),
              travel_time: element['travel_time']
              ? element['travel_time'] + ':00'
              : undefined,
              details:
                element['details'].trim().length > 0 ? element['details'] : undefined,
              booking_class: element['booking_class']?.value,
            })),
      is_offshore: isOffshore,
      sector: bookingType.value === 'Miscellaneous' ? sector : undefined,
    });
    if (response?.success) {
      sendToast('success', 'Created Invoice Successfully.', 4000);
      router.push('/dashboard/bookings');
    } else {
      if (response.data?.errors) {
        sendToast(
          'error',
          <ul className='list-disc'>
            {Object.values(response.data.errors).map((er) => (
              <li>{er}</li>
            ))}
          </ul>,
          8000
        );
      } else {
        sendToast(
          'error',
          response.data?.message || response.data?.error || 'Failed to Create Invoice.',
          4000
        );
      }
    }
  };

  // Client Traveller List
  useEffect(() => {
    if (clientID?.value) {
      getClientTravellers();
    }
  }, [clientID]);

  const getClientTravellers = async () => {
    const clientTravellers = await getList('client-travellers', {
      client_id: clientID?.value,
    });
    if (clientTravellers?.success) {
      setClientTravellers(
        clientTravellers.data.map((element) => ({
          value: element.id,
          label: element.traveller_name,
        }))
      );
      setClientTravellerID(null);
    } else {
      sendToast('error', 'Error getting client travellers', 4000);
    }
  };

  // Offshore
  useEffect(() => {
    if (isOffshore) {
      setClientServiceChargePercent(0);
      setClientServicesCharges(0);
    }
  }, [isOffshore]);

  // // If vendor is an airline, setting airline automatically
  // useEffect(() => {
  //   if (vendorID?.value)
  //     for (let airline of airlines)
  //       if (vendorID.value === airline.value) setAirlineID(vendorID);
  // }, [vendorID]);

  useEffect(() => {
    if (vendorID?.value) {
      setVendorServiceChargePercent(vendorID?.vendor_service_charge_percentage);
      setVendorTDSPercent(vendorID?.vendor_tds_percentage);
    }
  }, [vendorID]);

  // Booking Type Changes
  useEffect(() => {
    // Client Service Charge Percent
    // Client Service Charge Percent
    if (bookingType?.value)
      if (bookingType?.value === 'Domestic Flight Ticket') {
        setClientServiceChargePercent(0.9);
      } else if (bookingType.value === 'International Flight Ticket') {
        setClientServiceChargePercent(1.8);
      }
    // If misc remove booking sectors
    // If not remove misc type
    if (bookingType?.value === 'Miscellaneous') setBookingSectors([]);
    else setMiscellaneousType(null);
  }, [bookingType]);

  // Vendor Calculations

  // Vendor Total
  useEffect(
    () => updateVendorTotal(),
    [
      vendorBaseAmount,
      vendorYQAmount,
      vendorTaxAmount,
      vendorGSTAmount,
      vendorMiscCharges,
    ]
  );

  const updateVendorTotal = () => {
    let vendorTotal = Number(
      (+vendorBaseAmount || 0) +
        (+vendorYQAmount || 0) +
        (+vendorTaxAmount || 0) +
        (+vendorGSTAmount || 0) +
        (+vendorMiscCharges || 0)
    ).toFixed(2).replace(/[.,]00$/, '');
    setVendorTotal(vendorTotal);
    // Updating
    updatePaymentAmount(paymentAccountID, vendorTotal, vendorMiscCharges);
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
        )//.toFixed(2)
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
        Number((100 * (+vendorServiceCharges || 0)) / (+grossCommission || 0))//.toFixed(2)
      );
  };

  const updatePaymentAmount = (paymentAccountID, vendorTotal, vendorMiscCharges) => {
    if (paymentAccountID?.value)
      setPaymentAmount(Number((+vendorTotal || 0) - (+vendorMiscCharges || 0)));
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
      updateVendorTDS(grossCommission, vendorServiceCharges, vendorTDSPercent);
      updateVendorTDSPercent(vendorTDS, grossCommission, vendorServiceCharges);
      updateVendorServiceCharges(grossCommission, vendorServiceChargePercent);
      updateVendorServiceChargePercent(vendorServiceCharges, grossCommission);
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
      )//.toFixed(2)
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
      <Seo pageTitle='Add New Invoice' />
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
                    Add New{bookingType?.value ? ' ' + bookingType?.value + ' ' : ' '}
                    Invoice
                  </h1>
                  <div className='text-15 text-light-1'>Create a new invoice.</div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 lg:px-10 rounded-4 bg-white shadow-3'>
                <div>
                  <form
                    onSubmit={onSubmit}
                    className='row col-12 y-gap-10 x-gap-10 lg:pr-0 lg:ml-0'
                  >
                    <h3>Basic Details</h3>
                    {/* <div className='form-input-select col-lg-12'>
                      <label>
                        Booking Type<span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={bookingOptions}
                        value={bookingType}
                        onChange={(id) => setBookingType(id)}
                      />
                    </div> */}
                    <div className='d-block ml-3 form-datepicker col-lg-4'>
                      <label>
                        Booking Date<span className='text-danger'>*</span>
                      </label>
                      <DatePicker
                        style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                        inputClass='custom_input-picker'
                        containerClassName='custom_container-picker'
                        value={bookingDate}
                        onChange={setBookingDate}
                        numberOfMonths={1}
                        offsetY={10}
                        format='DD MMMM YYYY'
                      />
                    </div>
                    <div className='form-input-select col-lg-4'>
                      <label>
                        Client<span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={clientOrgs}
                        value={clientID}
                        onChange={(id) => setClientID(id)}
                      />
                    </div>
                    <div className='form-input-select col-lg-4'>
                      <label>
                        Traveller Name<span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={clientTravellers}
                        value={clientTravellerID}
                        onChange={(id) => setClientTravellerID(id)}
                      />
                    </div>
                    {bookingType?.value === 'Miscellaneous' && (
                      <div className='form-input-select col-lg-4'>
                        <label>Type<span className='text-danger'>*</span></label>
                        <Select
                          options={miscellaneousOptions}
                          value={miscellaneousType}
                          onChange={(id) => setMiscellaneousType(id)}
                        />
                      </div>
                    )}
                    {bookingType?.value !== 'Miscellaneous' && (
                      <div className='form-input-select col-lg-4'>
                        <label>Airline<span className='text-danger'>*</span></label>
                        <Select
                          options={airlines}
                          value={airlineID}
                          onChange={(id) => setAirlineID(id)}
                        />
                      </div>
                    )}
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setTicketNumber(e.target.value)}
                          value={ticketNumber}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          {bookingType?.value !== 'Miscellaneous'
                            ? 'Ticket Number'
                            : 'Narration Line 1'}
                        </label>
                      </div>
                    </div>
                    {bookingType?.value === 'Miscellaneous' && (
                      <div className='col-lg-4'>
                        <div className='form-input'>
                          <input
                            onChange={(e) => setSector(e.target.value)}
                            value={sector}
                            placeholder=' '
                            type='text'
                          />
                          <label className='lh-1 text-16 text-light-1'>
                            {bookingType?.value !== 'Miscellaneous'
                              ? 'Sector'
                              : 'Narration Line 2'}
                          </label>
                        </div>
                      </div>
                    )}
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setPNR(e.target.value)}
                          value={pnr}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          {bookingType?.value !== 'Miscellaneous'
                            ? 'PNR'
                            : 'Narration Line 3'}
                        </label>
                      </div>
                    </div>
                    {/* Booking Sectors */}
                    {bookingType?.value !== 'Miscellaneous' && (
                      <div>
                        <div className='bg-light pl-10 pr-30 py-10 lg:px-10 rounded-4'>
                          <h4 className='d-block'>Booking Sectors</h4>
                          <div>
                            {bookingSectors.map((element, index) => {
                              return (
                                <div
                                  className='booking-sectors mx-1 pr-10 bg-light items-center mt-2 lg:pr-0'
                                  key={index}
                                >
                                  <div style={{ minWidth: 15, maxWidth: 15 }}>
                                    {index + 1}.
                                  </div>
                                  <div className='d-flex row y-gap-10 col-12 x-gap-5 lg:pr-0 md:flex-column items-center justify-between'>
                                    <div className='form-input-select col-md-2'>
                                      <label>
                                        From<span className='text-danger'>*</span>
                                      </label>
                                      <AirportSearch
                                        value={element['from_airport']}
                                        airports={[airportOptions, setAirportOptions]}
                                        setValue={(id) =>
                                          setBookingSectors((prev) => {
                                            prev[index]['from_airport'] = id;
                                            return [...prev];
                                          })
                                        }
                                        options={airports}
                                        domestic={
                                          bookingType?.value === 'Domestic Flight Ticket'
                                        }
                                      />
                                    </div>
                                    <div className='form-input-select col-md-2'>
                                      <label>
                                        To<span className='text-danger'>*</span>
                                      </label>
                                      <AirportSearch
                                        value={element['to_airport']}
                                        airports={[airportOptions, setAirportOptions]}
                                        setValue={(id) =>
                                          setBookingSectors((prev) => {
                                            prev[index]['to_airport'] = id;
                                            return [...prev];
                                          })
                                        }
                                        options={airports}
                                        domestic={
                                          bookingType?.value === 'Domestic Flight Ticket'
                                        }
                                      />
                                    </div>
                                    <div className='col-md-2 form-datepicker'>
                                      <label>
                                        Date<span className='text-danger'>*</span>
                                      </label>
                                      <DatePicker
                                        minDate={
                                          index > 0
                                            ? bookingSectors[index - 1].travel_date
                                            : undefined
                                        }
                                        style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                                        inputClass='custom_input-picker'
                                        containerClassName='custom_container-picker bg-white'
                                        value={element['travel_date']}
                                        onChange={(date) => {
                                          setBookingSectors((prev) => {
                                            prev[index]['travel_date'] = date;
                                            return [...prev];
                                          });
                                        }}
                                        numberOfMonths={1}
                                        offsetY={10}
                                        format='DD MMM YYYY'
                                      />
                                    </div>
                                    <div className='col-md-2'>
                                      <div className='form-input bg-white'>
                                        <input
                                          onChange={(e) =>
                                            setBookingSectors((prev) => {
                                              prev[index]['travel_time'] = e.target.value;
                                              return [...prev];
                                            })
                                          }
                                          value={element['travel_time']}
                                          placeholder='--:--'
                                          pattern='^[0-2][0-9]:[0-5][0-9]$'
                                        />
                                        <label className='lh-1 text-16 text-light-1'>
                                          Travel Time
                                        </label>
                                      </div>
                                    </div>
                                    <div className='col-md-2'>
                                      <div className='form-input bg-white'>
                                        <input
                                          onChange={(e) =>
                                            setBookingSectors((prev) => {
                                              prev[index]['details'] = e.target.value;
                                              return [...prev];
                                            })
                                          }
                                          value={element['details']}
                                          placeholder=' '
                                          type='text'
                                        />
                                        <label className='lh-1 text-16 text-light-1'>
                                          Details
                                        </label>
                                      </div>
                                    </div>
                                    <div className='col-md-2 form-input-select'>
                                      <label>Booking Class</label>
                                      <Select
                                        options={bookingClassOptions}
                                        value={element['booking_class']}
                                        onChange={(id) =>
                                          setBookingSectors((prev) => {
                                            prev[index]['booking_class'] = id;
                                            return [...prev];
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <span
                                      className='pb-10'
                                      onClick={() =>
                                        setBookingSectors((prev) => {
                                          prev.splice(index, 1);
                                          return [...prev];
                                        })
                                      }
                                    >
                                      <BsTrash3
                                        className='text-danger'
                                        style={{ cursor: 'pointer' }}
                                      />
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <button
                            className='btn btn-success my-2 d-flex items-center gap-2'
                            onClick={(e) => {
                              e.preventDefault();
                              setBookingSectors((prev) => {
                                let fromAirport = null;
                                let dateObj = new DateObject();
                                if (prev.length > 0) {
                                  if (prev.at(-1)?.to_airport)
                                    fromAirport = prev.at(-1)?.to_airport;
                                  if (prev.at(-1)?.travel_date)
                                    dateObj = prev.at(-1).travel_date;
                                }
                                return [
                                  ...prev,
                                  {
                                    from_airport: fromAirport,
                                    to_airport: null,
                                    travel_date: dateObj,
                                    travel_time: '',
                                    details: '',
                                    booking_class: null,
                                  },
                                ];
                              });
                            }}
                          >
                            <BiPlusMedical /> Add Booking Sector
                          </button>
                        </div>
                      </div>
                    )}
                    {permissions.includes('view-client-referrer') && (
                      <>
                        <div className='form-input-select col-lg-4'>
                          <label>Client Referrer</label>
                          <Select
                            isClearable
                            options={clients}
                            value={clientReferrerID}
                            onChange={(id) => {
                              setClientReferrerID(id);
                            }}
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
                      </>
                    )}
                    <h3>Supplier Details</h3>
                    <div className='form-input-select col-lg-4'>
                      <label>
                        Vendor<span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={vendors}
                        value={vendorID}
                        onChange={(id) => setVendorID(id)}
                      />
                    </div>
                    <div className=' col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => {
                            setVendorBaseAmount(e.target.value);
                          }}
                          value={vendorBaseAmount}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor Base Amount<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    {bookingType?.value !== 'Miscellaneous' && (
                      <div className='col-lg-4'>
                        <div className='form-input'>
                          <input
                            onChange={(e) => {
                              setVendorYQAmount(e.target.value);
                            }}
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
                          required={bookingType?.value !== 'Miscellaneous'}
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
                          required={bookingType?.value !== 'Miscellaneous'}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor GST
                        </label>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => {
                            setVendorMiscChargers(e.target.value);
                            updatePaymentAmount(
                              paymentAccountID,
                              vendorTotal,
                              e.target.value
                            );
                          }}
                          value={vendorMiscCharges}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor Misc Charges
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
                    {bookingType?.value !== 'Miscellaneous' && <div className='col-8' />}
                    <div className='form-input-select col-lg-4'>
                      <label>Payment Account</label>
                      <Select
                        isClearable
                        options={paymentAccounts}
                        value={paymentAccountID}
                        onChange={(id) => {
                          setPaymentAccountID(id);
                          updatePaymentAmount(id, vendorTotal, vendorMiscCharges);
                        }}
                      />
                    </div>
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          value={paymentAmount}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Payment Amount
                        </label>
                      </div>
                    </div>
                    {bookingType?.value === 'Miscellaneous' ? (
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
                    ) : (
                      <div className='col-4' />
                    )}
                    {bookingType?.value !== 'Miscellaneous' && (
                      <>
                        <div className='form-input-select col-lg-4'>
                          <label>Commission Rule</label>
                          <Select
                            isClearable
                            options={commissionRules}
                            value={commissionRuleID}
                            onChange={(id) => {
                              setCommissionRuleID(id);
                            }}
                          />
                        </div>
                        <div className='col-lg-4'>
                          <div className='form-input'>
                            <input
                              onChange={(e) => {
                                setIATACommissionPercent(e.target.value);
                              }}
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
                            type='number'
                            onWheel={(e) => e.target.blur()}
                            placeholder=' '
                            onFocus={() => setVendorGSTFocused(true)}
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
                        <div className='d-flex gap-2 items-center col-8 pr-30 lg:pr-0'>
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
                          required
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
                          Client Base Amount<span className='text-danger'>*</span>
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
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Tax Amount<span className='text-danger'>*</span>
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
                          <label className='col-12 fw-500 mb-4'>{bookingType?.value !== 'Miscellaneous' ? 'Xplorz GST Amount' : 'Client Service Charges'}</label>
                          <div className='form-input col-4'>
                            <input
                              onChange={(e) => {
                                setClientServiceChargePercent(e.target.value);
                                updateSetClientServiceCharges(
                                  clientBaseAmount,
                                  clientReferralFee,
                                  e.target.value
                                );
                              }}
                              style={{
                                height: '50px',
                                minHeight: 'unset',
                                paddingTop: 'unset',
                                backgroundColor: '#ffe',
                              }}
                              value={clientServiceChargePercent}
                              placeholder=' '
                              onFocus={() => setXplorzGSTFocused(true)}
                              type='number'
                              onWheel={(e) => e.target.blur()}
                              required
                            />
                            <label className='lh-1 text-16 text-light-1'></label>
                            <span className='d-flex items-center ml-10'>%</span>
                          </div>
                          <div className='d-flex gap-2 items-center col-8 pr-30 lg:pr-0'>
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
                                required
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
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Invoice
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

export default AddNewBooking;

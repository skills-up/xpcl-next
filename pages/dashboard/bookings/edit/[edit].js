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
import { BiPlusMedical } from 'react-icons/bi';
import { store } from '../../../../app/store';
import { BsTrash3 } from 'react-icons/bs';
import WindowedSelect from 'react-windowed-select';

const UpdateBooking = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [pnr, setPNR] = useState('');
  const [vendorBaseAmount, setVendorBaseAmount] = useState('');
  const [vendorYQAmount, setVendorYQAmount] = useState('');
  const [vendorTaxAmount, setVendorTaxAmount] = useState('');
  const [vendorGSTAmount, setVendorGSTAmount] = useState('');
  const [vendorMiscCharges, setVendorMiscChargers] = useState('');
  const [vendorTotal, setVendorTotal] = useState('');
  const [IATACommissionPercent, setIATACommissionPercent] = useState('');
  const [plbCommissionPercent, setPLBCommissionPercent] = useState('');
  const [vendorServiceCharges, setVendorServiceCharges] = useState('');
  const [vendorTDS, setVendorTDS] = useState('');
  const [commissionReceivable, setCommissionReceivable] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [clientReferralFee, setClientReferralFee] = useState(0);
  const [clientBaseAmount, setClientBaseAmount] = useState('');
  const [clientTaxAmount, setClientTaxAmount] = useState('');
  const [clientGSTAmount, setClientGSTAmount] = useState('');
  const [clientServiceCharges, setClientServicesCharges] = useState('');
  const [clientTotal, setClientTotal] = useState('');
  const [reissuePenalty, setReissuePenalty] = useState('');
  const [sector, setSector] = useState('');
  const [bookingSectors, setBookingSectors] = useState([]);
  const [grossCommission, setGrossCommission] = useState(0);
  const [originalBookingID, setOriginalBookingID] = useState(null);
  const [isOffshore, setIsOffshore] = useState(false);
  const [clientQuotedAmount, setClientQuotedAmount] = useState('');
  const [number, setNumber] = useState('');

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

  const [xplorzGSTFocused, setXplorzGSTFocused] = useState(false);
  const [vendorGSTFocused, setVendorGSTFocused] = useState(false);
  const [vendorTDSPercentFocused, setVendorTDSPercentFocused] = useState(false);
  const [clientBaseAmountFocused, setClientBaseAmountFocused] = useState(false);
  const [clientTravellerFirstCheck, setClientTravellerFirstCheck] = useState(false);

  const airports = useSelector((state) => state.apis.value.airports);
  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    getData();
  }, [router.isReady]);

  const getData = async () => {
    if (router.query.edit) {
      const response = await getItem('bookings', router.query.edit);
      if (response?.success) {
        setTicketNumber(response.data.ticket_number);
        setPNR(response.data.pnr);
        setVendorBaseAmount(response.data.vendor_base_amount);
        setVendorTaxAmount(response.data.vendor_tax_amount);
        setVendorGSTAmount(response.data.vendor_gst_amount);
        setVendorMiscChargers(response.data.vendor_misc_charges);
        setVendorYQAmount(response.data.vendor_yq_amount);
        setVendorTotal(response.data.vendor_total);
        setIATACommissionPercent(response.data.iata_commission_percent);
        setPLBCommissionPercent(response.data.plb_commission_percent);
        setVendorServiceCharges(response.data.vendor_service_charges);
        setVendorTDS(response.data.vendor_tds);
        setCommissionReceivable(response.data.commission_receivable);
        setClientReferralFee(response.data.client_referral_fee);
        setClientBaseAmount(response.data.client_base_amount);
        setClientTaxAmount(response.data.client_tax_amount);
        setClientGSTAmount(response.data.client_gst_amount);
        setClientServicesCharges(response.data.client_service_charges);
        setClientTotal(response.data.client_total);
        setSector(response.data.sector);
        setOriginalBookingID(response.data?.original_booking_id);
        setReissuePenalty(response.data?.reissue_penalty);
        setBookingDate(
          new DateObject({ date: response.data.booking_date, format: 'YYYY-MM-DD' })
        );
        setIsOffshore(response.data?.is_offshore);
        setClientQuotedAmount(
          +response.data.client_base_amount +
            +response.data.client_tax_amount +
            +response.data.client_gst_amount
        );
        setNumber(response.data.number);

        // Client GST Percent
        if (
          Number(
            (
              (+response.data.client_gst_amount * 100) /
              +response.data.client_base_amount
            ).toFixed(0)
          ) === 5
        )
          setClientGSTPercent({ value: '5% of Base', label: '5% of Base' });
        else if (
          Number(
            (
              (+response.data.client_gst_amount * 100) /
              +response.data.client_base_amount
            ).toFixed(0)
          ) === 12
        )
          setClientGSTPercent({ value: '12% of Base', label: '12% of Base' });
        else if (response.data.client_gst_amount === 0)
          setClientGSTPercent({ value: 'None', label: 'None' });
        else if (response.data.client_gst_amount === response.data.vendor_gst_amount)
          setClientGSTAmount({ value: 'Vendor GST', label: 'Vendor GST' });

        const vendors = await getList('organizations', { is_vendor: 1 });
        const commissionRules = await getList('commission-rules');
        const airlines = await getList('organizations', { is_airline: 1 });
        const paymentAccounts = await getList('accounts', { category: 'Credit Cards' });
        const clients = await getList('accounts', { category: 'Referrers' });
        const clientOrgs = await getList('organizations', { is_client: 1 });
        const clientTravellers = await getList('client-travellers', {
          client_id: response.data?.client_id,
        });
        if (
          vendors?.success &&
          commissionRules?.success &&
          airlines?.success &&
          paymentAccounts?.success &&
          clients?.success &&
          clientOrgs?.success &&
          clientTravellers?.success
        ) {
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
          setClientOrgs(
            clientOrgs.data.map((element) => ({
              value: element.id,
              label: element.name,
            }))
          );
          setClientTravellers(
            clientTravellers.data.map((element) => ({
              value: element.id,
              label: element.traveller_name,
            }))
          );
          // Setting Booking Type
          for (let option of bookingOptions)
            if (option.value === response.data.booking_type) setBookingType(option);
          // Setting Vendor ID
          for (let vendor of vendors.data)
            if (vendor.id === response.data.vendor_id)
              setVendorID({ value: vendor.id, label: vendor.name });
          // Setting Commission ID
          for (let comm of commissionRules.data)
            if (comm.id === response.data.commission_rule_id)
              setCommissionRuleID({
                value: comm.id,
                label: comm.name,
                iata_basic: comm.iata_basic,
                iata_yq: comm.iata_yq,
                plb_basic: comm.plb_basic,
                plb_yq: comm.plb_yq,
              });
          // Set Airline ID
          for (let airline of airlines.data)
            if (airline.id === response.data.airline_id)
              setAirlineID({ value: airline.id, label: airline.name });
          // Misc Type
          for (let misc of miscellaneousOptions)
            if (misc.value === response.data.miscellaneous_type)
              setMiscellaneousType(misc);
          // Payment Account ID
          for (let acc of paymentAccounts.data)
            if (acc.id === response.data.payment_account_id)
              setPaymentAccountID({ value: acc.id, label: acc.name });
          // Client Referrer ID
          for (let client of clients.data)
            if (client.id === response.data.client_referrer_id)
              setClientReferrerID({ value: client.id, label: client.name });
          // Client Org IDS
          for (let client of clientOrgs.data) {
            if (client.id === response.data.client_id)
              setClientID({
                value: client.id,
                label: client.name,
              });
          }
          // Client Traveller IDS
          for (let client of clientTravellers.data) {
            if (client.id === response.data.client_traveller_id)
              setClientTravellerID({
                value: client.id,
                label: client.traveller_name,
              });
          }
          // Client Booking Sectors
          const tempBookingSectors = [];
          for (let bookSec of response.data.sectors) {
            let tempFromAirportID, tempToAirportID, tempBookingClass;
            for (let airport of airports) {
              if (airport.id === bookSec.from_airport_id) {
                tempFromAirportID = {
                  value: airport.id,
                  label: `${airport.iata_code}|${airport.city}|${airport.name}|${airport.country_name}`,
                };
              }
              if (airport.id === bookSec.to_airport_id) {
                tempToAirportID = {
                  value: airport.id,
                  label: `${airport.iata_code}|${airport.city}|${airport.name}|${airport.country_name}`,
                };
              }
            }
            for (let opt of bookingClassOptions)
              if (opt.value === bookSec?.booking_class) tempBookingClass = opt;
            tempBookingSectors.push({
              from_airport_id: tempFromAirportID,
              to_airport_id: tempToAirportID,
              travel_date: new DateObject({
                date: bookSec.travel_date,
                format: 'YYYY-MM-DD',
              }),
              travel_time: bookSec?.travel_time,
              details: bookSec?.details,
              booking_class: tempBookingClass,
            });
          }
          setBookingSectors(tempBookingSectors);
          // Set Payment Amount + First Client Traveller Check
          setTimeout(() => {
            setPaymentAmount(response.data.payment_amount);
            setClientTravellerFirstCheck(true);
          }, 1000);
        } else {
          sendToast('error', 'Unable to fetch required data', 4000);
          router.push('/dashboard/bookings');
        }
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Unable to fetch required data',
          4000
        );
        router.push('/dashboard/bookings');
      }
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
        !bookingSec?.from_airport_id?.value ||
        !bookingSec?.to_airport_id?.value ||
        !bookingSec?.travel_date
      ) {
        sendToast('error', 'Please fill all required details in Booking Sectors', 4000);
        return;
      }
    }
    // Adding response
    const editData = {
      booking_type: bookingType.value,
      client_id: clientID.value,
      booking_date: bookingDate.format('YYYY-MM-DD'),
      ticket_number: ticketNumber,
      pnr,
      vendor_id: vendorID.value,
      vendor_base_amount: vendorBaseAmount,
      vendor_yq_amount: vendorYQAmount,
      vendor_tax_amount: vendorTaxAmount,
      vendor_gst_amount: vendorGSTAmount,
      vendor_misc_charges: vendorMiscCharges,
      vendor_total: vendorTotal,
      commission_rule_id: commissionRuleID?.value,
      iata_commission_percent: IATACommissionPercent,
      plb_commission_percent: plbCommissionPercent,
      vendor_service_charges: vendorServiceCharges,
      vendor_tds: vendorTDS,
      commission_receivable: commissionReceivable,
      airline_id: airlineID?.value,
      miscellaneous_type: miscellaneousType?.value,
      payment_account_id: paymentAccountID?.value,
      payment_amount: +paymentAmount ? paymentAmount : undefined,
      client_referrer_id: clientReferrerID?.value,
      client_referral_fee: +clientReferralFee ? clientReferralFee : undefined,
      client_base_amount: clientBaseAmount,
      client_tax_amount: clientTaxAmount,
      client_gst_amount: clientGSTAmount,
      client_service_charges: isOffshore ? 0 : clientServiceCharges,
      client_total: clientTotal,
      client_traveller_id: clientTravellerID?.value,
      booking_sectors:
        bookingType.value === 'Miscellaneous'
          ? undefined
          : bookingSectors.map((element) => ({
              from_airport_id: element['from_airport_id']?.value,
              to_airport_id: element['to_airport_id']?.value,
              travel_date: element['travel_date']?.format('YYYY-MM-DD'),
              travel_time: element['travel_time'],
              details:
                element['details'].trim().length > 0 ? element['details'] : undefined,
              booking_class: element['booking_class']?.value,
            })),
      is_offshore: isOffshore,
      sector: bookingType.value === 'Miscellaneous' ? sector : undefined,
    };
    if (originalBookingID) {
      editData['original_booking_id'] = originalBookingID;
      editData['reissue_penalty'] = reissuePenalty;
    }
    const response = await updateItem('bookings', router.query.edit, editData);
    if (response?.success) {
      sendToast('success', 'Updated Booking Successfully.', 4000);
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
          response.data?.message || response.data?.error || 'Failed to Create Booking.',
          4000
        );
      }
    }
  };

  // Client Traveller List
  useEffect(() => {
    if (clientID?.value && clientTravellerFirstCheck) {
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

  // // If vendor is an airline, setting airline automatically
  // useEffect(() => {
  //   if (vendorID?.value)
  //     for (let airline of airlines)
  //       if (vendorID.value === airline.value) setAirlineID(vendorID);
  // }, [vendorID]);

  // Booking Type Changes
  useEffect(() => {
    // Client Service Charge Percent
    if (clientServiceCharges.trim().length === 0 || +clientServiceCharges === 0) {
      if (bookingType?.value === 'Domestic Flight Ticket')
        setClientServiceChargePercent(0.9);
      else setClientServiceChargePercent(1.8);
    }
    // If misc remove booking sectors
    // If not remove misc type
    if (bookingType?.value === 'Miscellaneous') setBookingSectors([]);
    else setMiscellaneousType(null);
  }, [bookingType]);

  // Vendor Calculations
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

  // Vendor Total
  const updateVendorTotal = () => {
    setVendorTotal(
      Number(
        +vendorBaseAmount +
          +vendorYQAmount +
          +vendorTaxAmount +
          +vendorGSTAmount +
          +vendorMiscCharges
      )
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

  useEffect(() => {
    setPaymentAmount(Number(+vendorTotal - +vendorMiscCharges));
  }, [paymentAccountID, vendorTotal, vendorMiscCharges]);

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

  useEffect(() => {
    if (clientGSTPercent?.value !== null && clientGSTPercent?.value !== undefined) {
      if (clientGSTPercent.label === 'None') setClientGSTAmount(0);
      else if (clientGSTPercent.label === 'Vendor GST')
        setClientGSTAmount(+vendorGSTAmount);
      else if (clientGSTPercent.label === '5% of Base') {
        setClientGSTAmount(
          Number(((+clientQuotedAmount - +clientTaxAmount) * (5 / 100)).toFixed(4))
        );
      } else if (clientGSTPercent.label === '12% of Base') {
        setClientGSTAmount(
          Number(((+clientQuotedAmount - +clientTaxAmount) * (12 / 100)).toFixed(4))
        );
      }
    }
  }, [clientGSTPercent]);

  useEffect(() => {
    if (clientBaseAmountFocused)
      setClientQuotedAmount(+clientBaseAmount + +clientTaxAmount + +clientGSTAmount);
  }, [clientBaseAmount]);

  useEffect(() => {
    if (!clientBaseAmountFocused) updateClientBase();
  }, [clientTaxAmount, clientGSTAmount, clientQuotedAmount]);

  // Client Total
  const updateClientBase = () => {
    if (+clientQuotedAmount > 0)
      setClientBaseAmount(+clientQuotedAmount - +clientTaxAmount - +clientGSTAmount);
  };

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
      <Seo pageTitle='Add New Booking' />
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
                  <h1 className='text-30 lh-14 fw-600'>Update Booking - {number}</h1>
                  <div className='text-15 text-light-1'>Update an existing booking.</div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 lg:px-10 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='col-12 y-gap-20'>
                    <div className='form-input-select'>
                      <label>
                        Booking Type<span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={bookingOptions}
                        value={bookingType}
                        placeholder='Search & Select Booking Type (required)'
                        onChange={(id) => setBookingType(id)}
                      />
                    </div>
                    <div className='form-input-select'>
                      <label>
                        Client<span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={clientOrgs}
                        value={clientID}
                        placeholder='Search & Select Client'
                        onChange={(id) => setClientID(id)}
                      />
                    </div>
                    {clientTravellers && clientTravellers.length > 0 && (
                      <div className='form-input-select'>
                        <label>
                          Client Traveller<span className='text-danger'>*</span>
                        </label>
                        <Select
                          options={clientTravellers}
                          value={clientTravellerID}
                          placeholder='Search & Select Client Traveller'
                          onChange={(id) => setClientTravellerID(id)}
                        />
                      </div>
                    )}
                    <div className='d-block ml-3 form-datepicker'>
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
                    <div className='col-12'>
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
                      <div className='col-12'>
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
                    <div className='col-12'>
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
                    <div className='form-input-select'>
                      <label>Airline</label>
                      <Select
                        options={airlines}
                        value={airlineID}
                        placeholder='Search & Select Airline'
                        onChange={(id) => setAirlineID(id)}
                      />
                    </div>
                    {/* Booking Sectors */}
                    {bookingType?.value !== 'Miscellaneous' && (
                      <div>
                        <label className='d-block'>Add Booking Sectors</label>
                        <div>
                          {bookingSectors.map((element, index) => {
                            return (
                              <div
                                className='d-flex flex-column mx-1 bg-light my-4 py-20 pb-40 px-30 md:px-10 md:py-10'
                                key={index}
                              >
                                <div className='d-flex justify-between'>
                                  <div>{index + 1}.</div>
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
                                      style={{ fontSize: '1.5rem', cursor: 'pointer' }}
                                    />
                                  </span>
                                </div>
                                <div className='d-flex row y-gap-20 md:flex-column items-center justify-between'>
                                  <div className='form-input-select col-md-6'>
                                    <label>
                                      From<span className='text-danger'>*</span>
                                    </label>
                                    <WindowedSelect
                                      options={airports
                                        .filter((airport) => {
                                          if (
                                            bookingType?.value ===
                                            'Domestic Flight Ticket'
                                          ) {
                                            return airport.country_name === 'India';
                                          } else {
                                            return true;
                                          }
                                        })
                                        .map((airport) => ({
                                          value: airport.id,
                                          label: `|${airport.iata_code}|${airport.city}|${airport.name}|${airport.country_name}`,
                                        }))}
                                      formatOptionLabel={(opt) => {
                                        const [_, iata_code, city, name, country_name] =
                                          opt.label.split('|');
                                        return (
                                          <div key={iata_code}>
                                            <div
                                              className='d-flex justify-between align-items-center'
                                              style={{ fontSize: '1rem' }}
                                            >
                                              <span>
                                                {city} (<strong>{iata_code}</strong>)
                                              </span>
                                              <div
                                                style={{
                                                  fontSize: 'small',
                                                  fontStyle: 'italic',
                                                }}
                                              >
                                                {country_name}
                                              </div>
                                            </div>
                                            <small>{name}</small>
                                          </div>
                                        );
                                      }}
                                      value={element['from_airport_id']}
                                      onChange={(id) =>
                                        setBookingSectors((prev) => {
                                          prev[index]['from_airport_id'] = id;
                                          return [...prev];
                                        })
                                      }
                                    />
                                  </div>
                                  <div className='form-input-select col-md-6'>
                                    <label>
                                      To<span className='text-danger'>*</span>
                                    </label>
                                    <WindowedSelect
                                      options={airports
                                        .filter((airport) => {
                                          if (
                                            bookingType?.value ===
                                            'Domestic Flight Ticket'
                                          ) {
                                            return airport.country_name === 'India';
                                          } else {
                                            return true;
                                          }
                                        })
                                        .map((airport) => ({
                                          value: airport.id,
                                          label: `|${airport.iata_code}|${airport.city}|${airport.name}|${airport.country_name}`,
                                        }))}
                                      formatOptionLabel={(opt) => {
                                        const [_, iata_code, city, name, country_name] =
                                          opt.label.split('|');
                                        return (
                                          <div key={iata_code}>
                                            <div
                                              className='d-flex justify-between align-items-center'
                                              style={{ fontSize: '1rem' }}
                                            >
                                              <span>
                                                {city} (<strong>{iata_code}</strong>)
                                              </span>
                                              <div
                                                style={{
                                                  fontSize: 'small',
                                                  fontStyle: 'italic',
                                                }}
                                              >
                                                {country_name}
                                              </div>
                                            </div>
                                            <small>{name}</small>
                                          </div>
                                        );
                                      }}
                                      value={element['to_airport_id']}
                                      onChange={(id) =>
                                        setBookingSectors((prev) => {
                                          prev[index]['to_airport_id'] = id;
                                          return [...prev];
                                        })
                                      }
                                    />
                                  </div>
                                  <div className='col-md-6 col-lg-3 form-datepicker'>
                                    <label>
                                      Date<span className='text-danger'>*</span>
                                    </label>
                                    <DatePicker
                                      style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                                      inputClass='custom_input-picker'
                                      containerClassName='custom_container-picker'
                                      value={element['travel_date']}
                                      onChange={(date) => {
                                        setBookingSectors((prev) => {
                                          prev[index]['travel_date'] = date;
                                          return [...prev];
                                        });
                                      }}
                                      numberOfMonths={1}
                                      offsetY={10}
                                      format='DD MMMM YYYY'
                                    />
                                  </div>
                                  <div className='col-md-6 col-lg-3'>
                                    <div className='form-input bg-white'>
                                      <input
                                        onChange={(e) =>
                                          setBookingSectors((prev) => {
                                            prev[index]['travel_time'] = e.target.value;
                                            return [...prev];
                                          })
                                        }
                                        value={element['travel_time']}
                                        placeholder=' '
                                        type='time'
                                        step={30}
                                      />
                                      <label className='lh-1 text-16 text-light-1'>
                                        Travel Time
                                      </label>
                                    </div>
                                  </div>
                                  <div className='col-md-6 col-lg-3'>
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
                                  <div className='col-md-6 col-lg-3 pb-3 form-input-select'>
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
                              </div>
                            );
                          })}
                        </div>
                        <button
                          className='btn btn-success my-2 d-flex items-center gap-2'
                          onClick={(e) => {
                            e.preventDefault();
                            setBookingSectors((prev) => {
                              let fromAirportID = null;
                              if (prev.length > 0) {
                                if (prev.at(-1)?.to_airport_id)
                                  fromAirportID = prev.at(-1)?.to_airport_id;
                              }
                              return [
                                ...prev,
                                {
                                  from_airport_id: fromAirportID,
                                  to_airport_id: null,
                                  travel_date: new DateObject(),
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
                    )}
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
                          onWheel={(e) => e.target.blur()}
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor Base Amount<span className='text-danger'>*</span>
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
                          onWheel={(e) => e.target.blur()}
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
                          onWheel={(e) => e.target.blur()}
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor Tax Amount<span className='text-danger'>*</span>
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
                          onWheel={(e) => e.target.blur()}
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor GST Amount<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setVendorMiscChargers(e.target.value)}
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
                    {originalBookingID && (
                      <div className='col-12'>
                        <div className='form-input'>
                          <input
                            onChange={(e) => setReissuePenalty(e.target.value)}
                            value={reissuePenalty}
                            placeholder=' '
                            type='number'
                            onWheel={(e) => e.target.blur()}
                          />
                          <label className='lh-1 text-16 text-light-1'>
                            Reissue Penalty
                          </label>
                        </div>
                      </div>
                    )}
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
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
                    <div className='form-input-select'>
                      <label>Payment Account</label>
                      <Select
                        options={paymentAccounts}
                        value={paymentAccountID}
                        placeholder='Search & Select Payment Account'
                        onChange={(id) => setPaymentAccountID(id)}
                      />
                    </div>
                    <div className='col-12'>
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
                          onWheel={(e) => e.target.blur()}
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
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          PLB Commission Percent
                        </label>
                      </div>
                    </div>
                    <div className='col-12 row y-gap-20 pr-0'>
                      <div className='form-input col-lg-4'>
                        <input
                          onChange={(e) => setVendorServiceChargePercent(e.target.value)}
                          value={vendorServiceChargePercent}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                          onFocus={() => setVendorGSTFocused(true)}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor Service Charge Percent
                        </label>
                        <div className='d-flex items-center ml-30'>%</div>
                      </div>
                      <div className='form-input col-lg-8 pr-0'>
                        <input
                          onChange={(e) => setVendorServiceCharges(e.target.value)}
                          value={vendorServiceCharges}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                          onFocus={() => setVendorGSTFocused(false)}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor Service Charges
                        </label>
                      </div>
                    </div>
                    <div className='col-12 row y-gap-20 pr-0'>
                      <div className='form-input col-lg-4'>
                        <input
                          onChange={(e) => setVendorTDSPercent(e.target.value)}
                          value={vendorTDSPercent}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                          onFocus={() => setVendorTDSPercentFocused(true)}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor TDS Percent
                        </label>
                        <div className='d-flex items-center ml-30'>%</div>
                      </div>
                      <div className='form-input col-lg-8 pr-0'>
                        <input
                          onChange={(e) => setVendorTDS(e.target.value)}
                          value={vendorTDS}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
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
                          onWheel={(e) => e.target.blur()}
                          disabled
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Commission Receivable
                        </label>
                      </div>
                    </div>
                    {bookingType?.value === 'Miscellaneous' && (
                      <div className='form-input-select'>
                        <label>Miscellaneous Type</label>
                        <Select
                          options={miscellaneousOptions}
                          value={miscellaneousType}
                          placeholder='Search & Select Miscellaneous Type'
                          onChange={(id) => setMiscellaneousType(id)}
                        />
                      </div>
                    )}
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
                          onWheel={(e) => e.target.blur()}
                          onFocus={() => setXplorzGSTFocused(true)}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Referral Fee
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setClientQuotedAmount(e.target.value)}
                          value={clientQuotedAmount}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Quoted Amount
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
                          onWheel={(e) => e.target.blur()}
                          required
                          onFocus={() => {
                            setClientBaseAmountFocused(true);
                            setXplorzGSTFocused(true);
                          }}
                          onBlur={() => setClientBaseAmountFocused(false)}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Base Amount<span className='text-danger'>*</span>
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
                          onWheel={(e) => e.target.blur()}
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Tax Amount<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12 row pr-0 y-gap-20 items-center'>
                      <div className='form-input-select col-lg-4 pr-0'>
                        <label>Client GST Percent</label>
                        <Select
                          defaultValue={{ value: 0, label: 'None' }}
                          options={clientGSTOptions}
                          value={clientGSTPercent}
                          placeholder='Select Client GST Percent'
                          onChange={(id) => setClientGSTPercent(id)}
                        />
                      </div>
                      <div className='form-input col-lg-8 pr-0'>
                        <input
                          onChange={(e) => setClientGSTAmount(e.target.value)}
                          value={clientGSTAmount}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                          required
                          disabled
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client GST Amount<span className='text-danger'>*</span>
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
                    {!isOffshore && (
                      <div className='col-12 row pr-0 y-gap-20 items-center'>
                        <div className='form-input col-lg-4'>
                          <input
                            onChange={(e) =>
                              setClientServiceChargePercent(e.target.value)
                            }
                            value={clientServiceChargePercent}
                            placeholder=' '
                            onFocus={() => setXplorzGSTFocused(true)}
                            type='number'
                            onWheel={(e) => e.target.blur()}
                            required
                          />
                          <label className='lh-1 text-16 text-light-1'>
                            Xplorz GST Percent<span className='text-danger'>*</span>
                          </label>
                          <span className='d-flex items-center ml-30'>%</span>
                        </div>
                        <div className='form-input col-lg-8 pr-0'>
                          <input
                            onChange={(e) => setClientServicesCharges(e.target.value)}
                            value={clientServiceCharges}
                            placeholder=' '
                            type='number'
                            onWheel={(e) => e.target.blur()}
                            required
                            onFocus={() => setXplorzGSTFocused(false)}
                            onBlur={() => setXplorzGSTFocused(true)}
                          />
                          <label className='lh-1 text-16 text-light-1'>
                            Client Services Charges<span className='text-danger'>*</span>
                          </label>
                        </div>
                      </div>
                    )}
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setClientTotal(e.target.value)}
                          value={clientTotal}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                          required
                          disabled
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Total<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Update Booking
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

export default UpdateBooking;

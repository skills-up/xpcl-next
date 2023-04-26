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

const AddNewBooking = () => {
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

  // Dates
  const [bookingDate, setBookingDate] = useState(new DateObject());
  // Dropdowns
  const [bookingType, setBookingType] = useState(null);
  const [miscellaneousType, setMiscellaneousType] = useState(null);
  const [vendorID, setVendorID] = useState(null);
  const [commissionRuleID, setCommissionRuleID] = useState(null);
  const [airlineID, setAirlineID] = useState(null);
  const [paymentAccountID, setPaymentAccountID] = useState(null);
  const [clientReferrerID, setClientReferrerID] = useState(null);
  const [originalBookingID, setOriginalBookingID] = useState(null);
  const [clientTravellerIDS, setClientTravellerIDS] = useState([]);

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
  const [vendors, setVendors] = useState([]);
  const [commissionRules, setCommissionRules] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientTravellers, setClientTravellers] = useState([]);
  const [airports, setAirports] = useState([]);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const airports = await getList('airports');
    const vendors = await getList('organizations', { is_vendor: 1 });
    const commissionRules = await getList('commission-rules');
    const airlines = await getList('organizations', { is_airline: 1 });
    const paymentAccounts = await getList('accounts', { category: 'Credit Cards' });
    const clients = await getList('accounts', { category: 'Client Referrers' });
    const clientTravellers = await getList('organizations', { is_client: 1 });
    if (
      vendors?.success &&
      commissionRules?.success &&
      airlines?.success &&
      paymentAccounts?.success &&
      clients?.success &&
      clientTravellers?.success &&
      airports?.success
    ) {
      setAirports(airports.data);
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
      setClientTravellers(
        clientTravellers.data.map((element) => ({
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
    // Manipulating booking sectors
    let newBookingSectors = bookingSectors;
    for (let i = 0; i < newBookingSectors.length; i++) {
      if (
        newBookingSectors[i]['from_airport_id']?.value &&
        newBookingSectors[i]['to_airport_id']?.value
      ) {
        newBookingSectors[i]['from_airport_id'] =
          newBookingSectors[i]['from_airport_id']?.value;
        newBookingSectors[i]['to_airport_id'] =
          newBookingSectors[i]['to_airport_id']?.value;
      }
      if (typeof newBookingSectors[i]['travel_date'] !== 'string')
        newBookingSectors[i]['travel_date'] =
          newBookingSectors[i]['travel_date']?.format('YYYY-MM-DD');
    }
    // Adding response
    const response = await createItem('bookings', {
      booking_type: bookingType.value,
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
      payment_amount: paymentAmount,
      client_referrer_id: clientReferrerID?.value,
      client_referral_fee: clientReferralFee,
      client_base_amount: clientBaseAmount,
      client_tax_amount: clientTaxAmount,
      client_gst_amount: clientGSTAmount,
      client_service_charges: clientServiceCharges,
      client_total: clientTotal,
      client_traveller_ids:
        clientTravellerIDS?.length > 0
          ? clientTravellerIDS.map((element) => element.value)
          : clientTravellerIDS,
      booking_sectors: newBookingSectors,
      sector,
    });
    if (response?.success) {
      sendToast('success', 'Created Booking Successfully.', 4000);
      router.push('/dashboard/bookings');
    } else {
      sendToast(
        'error',
        response.data?.message || response.data?.error || 'Failed to Create Booking.',
        4000
      );
    }
  };

  // If vendor is an airline, setting airline automatically
  useEffect(() => {
    if (vendorID?.value)
      for (let airline of airlines)
        if (vendorID.value === airline.value) setAirlineID(vendorID);
  }, [vendorID]);

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
                  <h1 className='text-30 lh-14 fw-600'>Add New Booking</h1>
                  <div className='text-15 text-light-1'>Create a new booking.</div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <div>
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
                    <div className='d-block ml-4'>
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
                        <label className='lh-1 text-16 text-light-1'>Ticket Number</label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setPNR(e.target.value)}
                          value={pnr}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>PNR</label>
                      </div>
                    </div>
                    <div>
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
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor Misc Charges
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
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor Total<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div>
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
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setVendorServiceCharges(e.target.value)}
                          value={vendorServiceCharges}
                          placeholder=' '
                          type='number'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Vendor Service Charges
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setVendorTDS(e.target.value)}
                          value={vendorTDS}
                          placeholder=' '
                          type='number'
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
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Commission Receivable
                        </label>
                      </div>
                    </div>
                    <div>
                      <label>Airline</label>
                      <Select
                        options={airlines}
                        value={airlineID}
                        placeholder='Search & Select Airline'
                        onChange={(id) => setAirlineID(id)}
                      />
                    </div>
                    <div>
                      <label>Miscellaneous Type</label>
                      <Select
                        options={miscellaneousOptions}
                        value={miscellaneousType}
                        placeholder='Search & Select Miscellaneous Type'
                        onChange={(id) => setMiscellaneousType(id)}
                      />
                    </div>
                    <div>
                      <label>Payment Account</label>
                      <Select
                        options={paymentAccounts}
                        value={paymentAccountID}
                        placeholder='Search & Select Miscellaneous Type'
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
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Payment Amount
                        </label>
                      </div>
                    </div>
                    <div>
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
                          required
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
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Tax Amount<span className='text-danger'>*</span>
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
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client GST Amount<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setClientServicesCharges(e.target.value)}
                          value={clientServiceCharges}
                          placeholder=' '
                          type='number'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Services Charges<span className='text-danger'>*</span>
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
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Client Total<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label>
                        Client Travellers<span className='text-danger'>*</span>
                      </label>
                      <Select
                        isMulti
                        options={clientTravellers}
                        value={clientTravellerIDS}
                        placeholder='Search & Select Client Referrer'
                        onChange={(id) => setClientTravellerIDS(id)}
                      />
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setSector(e.target.value)}
                          value={sector}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Sector</label>
                      </div>
                    </div>
                    {/* Booking Sectors */}
                    <div>
                      <label className='d-block'>Add Booking Sectors</label>
                      <button
                        className='btn btn-success my-2 d-flex items-center gap-2'
                        onClick={(e) => {
                          e.preventDefault();
                          setBookingSectors((prev) => [
                            ...prev,
                            {
                              from_airport_id: null,
                              to_airport_id: null,
                              travel_date: new DateObject(),
                              travel_time: '',
                              details: '',
                            },
                          ]);
                        }}
                      >
                        <BiPlusMedical /> Add Booking Sector
                      </button>
                      <div>
                        {bookingSectors.map((element, index) => {
                          return (
                            <div className='row items-center my-2'>
                              <div className='col-3'>
                                <label>
                                  From<span className='text-danger'>*</span>
                                </label>
                                <Select
                                  options={airports.map((airport) => ({
                                    value: airport.id,
                                    label: `${airport.name} - ${airport.iata_code}`,
                                  }))}
                                  value={element['from_airport_id']}
                                  onChange={(id) =>
                                    setBookingSectors((prev) => {
                                      prev[index]['from_airport_id'] = id;
                                      return [...prev];
                                    })
                                  }
                                />
                              </div>
                              <div className='col-3'>
                                <label>
                                  To<span className='text-danger'>*</span>
                                </label>
                                <Select
                                  options={airports.map((airport) => ({
                                    value: airport.id,
                                    label: `${airport.name} - ${airport.iata_code}`,
                                  }))}
                                  value={element['to_airport_id']}
                                  onChange={(id) =>
                                    setBookingSectors((prev) => {
                                      prev[index]['to_airport_id'] = id;
                                      return [...prev];
                                    })
                                  }
                                />
                              </div>
                              <div className='col-2'>
                                <label>
                                  Date<span className='text-danger'>*</span>
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
                              <div className='col-2'>
                                <div className='form-input'>
                                  <input
                                    onChange={(e) =>
                                      setBookingSectors((prev) => {
                                        prev[index]['travel_time'] = e.target.value;
                                        return [...prev];
                                      })
                                    }
                                    value={element['travel_time']}
                                    placeholder=' '
                                    type='text'
                                    required
                                  />
                                  <label className='lh-1 text-16 text-light-1'>
                                    Travel Time
                                  </label>
                                </div>
                              </div>
                              <div className='col-2'>
                                <div className='form-input'>
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
                                    required
                                  />
                                  <label className='lh-1 text-16 text-light-1'>
                                    Details
                                  </label>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Booking
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

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BiPlusMedical } from 'react-icons/bi';
import { BsTrash3 } from 'react-icons/bs';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import ReactSwitch from 'react-switch';
import { getItem, getList, updateItem } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import AirportSearch from '../../../../components/flight-list/common/AirportSearch';
import { sendToast } from '../../../../utils/toastify';

const EditAgentBooking = () => {
  // Read-only fields (displayed but not editable)
  const [provider, setProvider] = useState('');
  const [bookingReference, setBookingReference] = useState('');
  const [pnr, setPnr] = useState('');
  const [bookingType, setBookingType] = useState('');
  const [miscSubType, setMiscSubType] = useState('');
  const [status, setStatus] = useState('');
  const [bookingId, setBookingId] = useState(null);
  const [isTicketed, setIsTicketed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLcc, setIsLcc] = useState(false);

  // Editable fields
  const [ticketNumber, setTicketNumber] = useState('');
  const [clientCode, setClientCode] = useState('');
  const [airlineCode, setAirlineCode] = useState('');
  const [vendorCode, setVendorCode] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [hotelId, setHotelId] = useState('');
  const [commissionRuleID, setCommissionRuleID] = useState(null);
  const [iataCommissionPct, setIataCommissionPct] = useState('0.00');
  const [plbCommissionPct, setPlbCommissionPct] = useState('0.00');
  const [quotedAmount, setQuotedAmount] = useState('');
  const [actualAmount, setActualAmount] = useState('');
  const [vendorYqAmount, setVendorYqAmount] = useState('');
  const [vendorGstAmount, setVendorGstAmount] = useState('');
  const [vendorMiscCharges, setVendorMiscCharges] = useState('');
  const [baseFare, setBaseFare] = useState('');
  const [taxes, setTaxes] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [travelDate, setTravelDate] = useState(null);
  const [checkoutDate, setCheckoutDate] = useState(null);
  const [bookingDate, setBookingDate] = useState(new DateObject());
  const [baggageAllowance, setBaggageAllowance] = useState('');
  const [seatNumbers, setSeatNumbers] = useState('');
  const [sectors, setSectors] = useState([]);
  const [showClientGst, setShowClientGst] = useState(false);
  const [isPersonal, setIsPersonal] = useState(false);
  const [showFare, setShowFare] = useState(false);
  const [sendOnlyToSupport, setSendOnlyToSupport] = useState(false);
  const [emailTravellers, setEmailTravellers] = useState(false);
  const [tripcentralBilling, setTripcentralBilling] = useState(false);
  const [tripcentralCostAmount, setTripcentralCostAmount] = useState('');

  // Client traveller (editable via Select)
  const [clientTravellerID, setClientTravellerID] = useState(null);
  const [clientTravellers, setClientTravellers] = useState([]);

  // Dropdown options
  const [commissionRules, setCommissionRules] = useState([]);
  const [airportOptions, setAirportOptions] = useState([]);

  const airports = useSelector((state) => state.apis.value.airports);
  const router = useRouter();

  const isFlightType =
    bookingType === 'Domestic Flight Ticket' ||
    bookingType === 'International Flight Ticket';
  const isHotelBooking = bookingType === 'Miscellaneous' && miscSubType === 'Hotel Booking';

  useEffect(() => {
    getData();
  }, [router.isReady]);

  const getData = async () => {
    if (airports && airports?.length > 0) setAirportOptions(airports.map((e) => e));
    if (router.query.edit) {
      const response = await getItem('agent-bookings', router.query.edit);
      if (response?.success) {
        const d = response.data;

        // Read-only
        setProvider(d.provider || '');
        setBookingReference(d.booking_reference || '');
        setPnr(d.pnr || '');
        setBookingType(d.booking_type || '');
        setMiscSubType(d.misc_sub_type || '');
        setStatus(d.status || '');
        setBookingId(d.booking_id);
        setIsTicketed(d.is_ticketed);
        setErrorMessage(d.error_message || '');
        setIsLcc(d.is_lcc);

        // Editable
        setTicketNumber(d.ticket_number || '');
        setClientCode(d.client_code || '');
        setAirlineCode(d.airline_code || '');
        setVendorCode(d.vendor_code || '');
        setHotelName(d.hotel_name || '');
        setHotelId(d.hotel_id || '');
        setIataCommissionPct(d.iata_commission_pct ?? '0.00');
        setPlbCommissionPct(d.plb_commission_pct ?? '0.00');
        setQuotedAmount(d.quoted_amount ?? '');
        setActualAmount(d.actual_amount ?? '');
        setVendorYqAmount(d.vendor_yq_amount ?? '');
        setVendorGstAmount(d.vendor_gst_amount ?? '');
        setVendorMiscCharges(d.vendor_misc_charges ?? '');
        setBaseFare(d.base_fare ?? '');
        setTaxes(d.taxes ?? '');
        setCurrency(d.currency || 'INR');
        if (d.travel_date)
          setTravelDate(new DateObject({ date: d.travel_date, format: 'YYYY-MM-DD' }));
        if (d.checkout_date)
          setCheckoutDate(new DateObject({ date: d.checkout_date, format: 'YYYY-MM-DD' }));
        if (d.booking_date)
          setBookingDate(
            new DateObject({ date: d.booking_date, format: 'YYYY-MM-DD HH:mm:ss' })
          );
        setBaggageAllowance(d.baggage_allowance || '');
        setSeatNumbers(d.seat_numbers || '');
        setShowClientGst(!!d.show_client_gst);
        setIsPersonal(!!d.is_personal);
        setShowFare(!!d.show_fare);
        setSendOnlyToSupport(!!d.send_only_to_support);
        setEmailTravellers(!!d.email_travellers);
        setTripcentralBilling(!!d.tripcentral_billing);
        setTripcentralCostAmount(d.tripcentral_cost_amount ?? '');

        // Sectors (JSON)
        if (d.sectors && Array.isArray(d.sectors)) {
          setSectors(
            d.sectors.map((sec) => {
              let fromAirport = null;
              let toAirport = null;
              if (sec.from && airports) {
                for (let airport of airports) {
                  if (airport.iata_code === sec.from) {
                    fromAirport = {
                      value: airport.iata_code,
                      label: `${airport.iata_code}|${airport.city}|${airport.name}|${airport.country_name}`,
                    };
                  }
                }
                if (!fromAirport) fromAirport = { value: sec.from, label: sec.from };
              }
              if (sec.to && airports) {
                for (let airport of airports) {
                  if (airport.iata_code === sec.to) {
                    toAirport = {
                      value: airport.iata_code,
                      label: `${airport.iata_code}|${airport.city}|${airport.name}|${airport.country_name}`,
                    };
                  }
                }
                if (!toAirport) toAirport = { value: sec.to, label: sec.to };
              }
              return {
                from_airport: fromAirport,
                to_airport: toAirport,
                travel_date: sec.date
                  ? new DateObject({ date: sec.date, format: 'YYYY-MM-DD' })
                  : new DateObject(),
                travel_time: sec.time || '',
                details: sec.details || sec.flight_number || '',
              };
            })
          );
        }

        // Fetch dropdown data
        const commissionRulesRes = await getList('commission-rules');
        if (commissionRulesRes?.success) {
          setCommissionRules(
            commissionRulesRes.data.map((element) => ({
              value: element.id,
              label: element.name,
            }))
          );
          // Set current commission rule
          if (d.commission_rule_id) {
            for (let cr of commissionRulesRes.data) {
              if (cr.id === d.commission_rule_id) {
                setCommissionRuleID({ value: cr.id, label: cr.name });
              }
            }
          }
        }

        // Fetch client travellers
        if (d.client_code) {
          const ctRes = await getList('client-travellers', {
            client_code: d.client_code,
          });
          if (ctRes?.success) {
            setClientTravellers(
              ctRes.data.map((el) => ({
                value: el.id,
                label: el.traveller_name,
              }))
            );
            // Set current traveller
            if (d.client_traveller_id) {
              for (let ct of ctRes.data) {
                if (ct.id === d.client_traveller_id) {
                  setClientTravellerID({ value: ct.id, label: ct.traveller_name });
                }
              }
            }
          }
        }
      } else {
        sendToast(
          'error',
          response.data?.message ||
          response.data?.error ||
          'Unable to fetch booking data',
          4000
        );
        router.push('/dashboard/agent-bookings');
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!clientTravellerID?.value) {
      sendToast('error', 'Please select a client traveller', 4000);
      return;
    }

    const editData = {
      ticket_number: ticketNumber,
      client_code: clientCode,
      client_traveller_id: clientTravellerID.value,
      airline_code: airlineCode || null,
      vendor_code: vendorCode || null,
      hotel_name: hotelName || null,
      hotel_id: hotelId || null,
      commission_rule_id: commissionRuleID?.value || null,
      iata_commission_pct: iataCommissionPct || 0,
      plb_commission_pct: plbCommissionPct || 0,
      quoted_amount: quotedAmount || null,
      actual_amount: actualAmount || null,
      vendor_yq_amount: vendorYqAmount || null,
      vendor_gst_amount: vendorGstAmount || null,
      vendor_misc_charges: vendorMiscCharges || null,
      base_fare: baseFare || null,
      taxes: taxes || null,
      currency: currency,
      travel_date: travelDate?.format('YYYY-MM-DD') || null,
      checkout_date: checkoutDate?.format('YYYY-MM-DD') || null,
      booking_date: bookingDate?.format('YYYY-MM-DD HH:mm:ss'),
      baggage_allowance: baggageAllowance || null,
      seat_numbers: seatNumbers || null,
      show_client_gst: showClientGst ? 1 : 0,
      is_personal: isPersonal ? 1 : 0,
      show_fare: showFare ? 1 : 0,
      send_only_to_support: sendOnlyToSupport ? 1 : 0,
      email_travellers: emailTravellers ? 1 : 0,
      tripcentral_billing: tripcentralBilling ? 1 : 0,
      tripcentral_cost_amount: tripcentralBilling ? tripcentralCostAmount || null : null,
      sectors: isFlightType
        ? sectors.map((sec) => ({
          from: sec.from_airport?.value || null,
          to: sec.to_airport?.value || null,
          date: sec.travel_date?.format('YYYY-MM-DD') || null,
          time: sec.travel_time || null,
          details: sec.details || null,
        }))
        : null,
    };

    const response = await updateItem('agent-bookings', router.query.edit, editData);
    if (response?.success) {
      sendToast('success', 'Updated Agent Booking Successfully.', 4000);
      router.push('/dashboard/agent-bookings');
    } else {
      if (response.data?.errors) {
        sendToast(
          'error',
          <ul className='list-disc'>
            {Object.values(response.data.errors).map((er, i) => (
              <li key={i}>{er}</li>
            ))}
          </ul>,
          8000
        );
      } else {
        sendToast(
          'error',
          response.data?.message ||
          response.data?.error ||
          'Failed to update agent booking.',
          4000
        );
      }
    }
  };

  return (
    <>
      <Seo pageTitle={`Edit Agent Booking`} />

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
        <div className='col-12'>
          <h1 className='text-30 lh-14 fw-600'>
            Edit Agent Booking - {bookingReference || router.query.edit}
          </h1>
          <div className='text-15 text-light-1'>Update booking details.</div>
        </div>
      </div>

      <div className='py-30 px-30 lg:px-10 rounded-4 bg-white shadow-3'>
        <div>
          {/* Read-Only Summary */}
          <div className='row col-12 y-gap-10 x-gap-10 mb-20'>
            <h3>Booking Summary (Read Only)</h3>
            <div className='col-lg-3'>
              <div className='form-input'>
                <input value={provider} placeholder=' ' type='text' disabled className='bg-light' />
                <label className='lh-1 text-16 text-light-1'>Provider</label>
              </div>
            </div>
            <div className='col-lg-3'>
              <div className='form-input'>
                <input
                  value={bookingReference}
                  placeholder=' '
                  type='text'
                  disabled
                  className='bg-light'
                />
                <label className='lh-1 text-16 text-light-1'>Booking Reference</label>
              </div>
            </div>
            <div className='col-lg-3'>
              <div className='form-input'>
                <input value={pnr} placeholder=' ' type='text' disabled className='bg-light' />
                <label className='lh-1 text-16 text-light-1'>PNR</label>
              </div>
            </div>
            <div className='col-lg-3'>
              <div className='form-input'>
                <input
                  value={bookingType}
                  placeholder=' '
                  type='text'
                  disabled
                  className='bg-light'
                />
                <label className='lh-1 text-16 text-light-1'>Booking Type</label>
              </div>
            </div>
            {miscSubType && (
              <div className='col-lg-3'>
                <div className='form-input'>
                  <input
                    value={miscSubType}
                    placeholder=' '
                    type='text'
                    disabled
                    className='bg-light'
                  />
                  <label className='lh-1 text-16 text-light-1'>Misc Sub Type</label>
                </div>
              </div>
            )}
            <div className='col-lg-3'>
              <div className='form-input'>
                <input
                  value={status}
                  placeholder=' '
                  type='text'
                  disabled
                  className='bg-light'
                />
                <label className='lh-1 text-16 text-light-1'>Status</label>
              </div>
            </div>
            <div className='col-lg-3'>
              <div className='d-flex items-center gap-3 pt-20'>
                <ReactSwitch onChange={() => { }} checked={isLcc} disabled />
                <label>Is LCC</label>
              </div>
            </div>
            <div className='col-lg-3'>
              <div className='d-flex items-center gap-3 pt-20'>
                <ReactSwitch onChange={() => { }} checked={isTicketed} disabled />
                <label>Is Ticketed</label>
              </div>
            </div>
            {errorMessage && (
              <div className='col-12'>
                <div className='bg-danger text-white px-20 py-10 rounded-4'>
                  <strong>Error:</strong> {errorMessage}
                </div>
              </div>
            )}
          </div>

          <hr className='mb-20' />

          {/* Editable Form */}
          <form
            onSubmit={onSubmit}
            className='row col-12 y-gap-10 x-gap-10 lg:pr-0 lg:ml-0'
          >
            <h3>Basic Details</h3>
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
            <div className='col-lg-4'>
              <div className='form-input'>
                <input
                  onChange={(e) => setClientCode(e.target.value)}
                  value={clientCode}
                  placeholder=' '
                  type='text'
                  maxLength={4}
                  required
                />
                <label className='lh-1 text-16 text-light-1'>
                  Client Code<span className='text-danger'>*</span>
                </label>
              </div>
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
            {isFlightType && (
              <div className='col-lg-4'>
                <div className='form-input'>
                  <input
                    onChange={(e) => setAirlineCode(e.target.value)}
                    value={airlineCode}
                    placeholder=' '
                    type='text'
                    maxLength={4}
                  />
                  <label className='lh-1 text-16 text-light-1'>Airline Code</label>
                </div>
              </div>
            )}
            <div className='col-lg-4'>
              <div className='form-input'>
                <input
                  onChange={(e) => setVendorCode(e.target.value)}
                  value={vendorCode}
                  placeholder=' '
                  type='text'
                  maxLength={4}
                />
                <label className='lh-1 text-16 text-light-1'>Vendor Code</label>
              </div>
            </div>
            <div className='col-lg-4'>
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
            {isHotelBooking && (
              <>
                <div className='col-lg-4'>
                  <div className='form-input'>
                    <input
                      onChange={(e) => setHotelName(e.target.value)}
                      value={hotelName}
                      placeholder=' '
                      type='text'
                    />
                    <label className='lh-1 text-16 text-light-1'>Hotel Name</label>
                  </div>
                </div>
                <div className='col-lg-4'>
                  <div className='form-input'>
                    <input
                      onChange={(e) => setHotelId(e.target.value)}
                      value={hotelId}
                      placeholder=' '
                      type='text'
                    />
                    <label className='lh-1 text-16 text-light-1'>Hotel ID</label>
                  </div>
                </div>
              </>
            )}

            {/* Sectors (Flight Types Only) */}
            {isFlightType && (
              <div>
                <div className='bg-light pl-10 pr-30 py-10 lg:px-10 rounded-4'>
                  <h4 className='d-block'>Sectors</h4>
                  <div>
                    {sectors.map((element, index) => {
                      return (
                        <div
                          className='booking-sectors mx-1 pr-10 bg-light items-center mt-2 lg:pr-0'
                          key={index}
                        >
                          <div style={{ minWidth: 15, maxWidth: 15 }}>{index + 1}.</div>
                          <div className='d-flex row y-gap-10 col-12 x-gap-5 lg:pr-0 md:flex-column items-center justify-between'>
                            <div className='form-input-select col-md-3'>
                              <label>
                                From<span className='text-danger'>*</span>
                              </label>
                              <AirportSearch
                                value={element['from_airport']}
                                airports={[airportOptions, setAirportOptions]}
                                setValue={(id) =>
                                  setSectors((prev) => {
                                    prev[index]['from_airport'] = id;
                                    return [...prev];
                                  })
                                }
                                options={airports}
                                domestic={bookingType === 'Domestic Flight Ticket'}
                              />
                            </div>
                            <div className='form-input-select col-md-3'>
                              <label>
                                To<span className='text-danger'>*</span>
                              </label>
                              <AirportSearch
                                value={element['to_airport']}
                                airports={[airportOptions, setAirportOptions]}
                                setValue={(id) =>
                                  setSectors((prev) => {
                                    prev[index]['to_airport'] = id;
                                    return [...prev];
                                  })
                                }
                                options={airports}
                                domestic={bookingType === 'Domestic Flight Ticket'}
                              />
                            </div>
                            <div className='col-md-2 form-datepicker'>
                              <label>
                                Date<span className='text-danger'>*</span>
                              </label>
                              <DatePicker
                                minDate={
                                  index > 0
                                    ? sectors[index - 1].travel_date
                                    : undefined
                                }
                                style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                                inputClass='custom_input-picker'
                                containerClassName='custom_container-picker bg-white'
                                value={element['travel_date']}
                                onChange={(date) => {
                                  setSectors((prev) => {
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
                                    setSectors((prev) => {
                                      prev[index]['travel_time'] = e.target.value;
                                      return [...prev];
                                    })
                                  }
                                  value={element['travel_time']}
                                  placeholder='--:--'
                                  pattern='^[0-2][0-9]:[0-5][0-9]$'
                                />
                                <label className='lh-1 text-16 text-light-1'>Time</label>
                              </div>
                            </div>
                            <div className='col-md-2'>
                              <div className='form-input bg-white'>
                                <input
                                  onChange={(e) =>
                                    setSectors((prev) => {
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
                          </div>
                          <div>
                            <span
                              className='pb-10'
                              onClick={() =>
                                setSectors((prev) => {
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
                      setSectors((prev) => {
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
                          },
                        ];
                      });
                    }}
                  >
                    <BiPlusMedical /> Add Sector
                  </button>
                </div>
              </div>
            )}

            <h3>Financial Details</h3>
            <div className='col-lg-4'>
              <div className='form-input'>
                <input
                  onChange={(e) => setBaseFare(e.target.value)}
                  value={baseFare}
                  placeholder=' '
                  type='number'
                  onWheel={(e) => e.target.blur()}
                />
                <label className='lh-1 text-16 text-light-1'>Base Fare</label>
              </div>
            </div>
            {isFlightType && (
              <div className='col-lg-4'>
                <div className='form-input'>
                  <input
                    onChange={(e) => setVendorYqAmount(e.target.value)}
                    value={vendorYqAmount}
                    placeholder=' '
                    type='number'
                    onWheel={(e) => e.target.blur()}
                  />
                  <label className='lh-1 text-16 text-light-1'>Vendor YQ Amount</label>
                </div>
              </div>
            )}
            <div className='col-lg-4'>
              <div className='form-input'>
                <input
                  onChange={(e) => setTaxes(e.target.value)}
                  value={taxes}
                  placeholder=' '
                  type='number'
                  onWheel={(e) => e.target.blur()}
                />
                <label className='lh-1 text-16 text-light-1'>Taxes</label>
              </div>
            </div>
            <div className='col-lg-4'>
              <div className='form-input'>
                <input
                  onChange={(e) => setVendorGstAmount(e.target.value)}
                  value={vendorGstAmount}
                  placeholder=' '
                  type='number'
                  onWheel={(e) => e.target.blur()}
                />
                <label className='lh-1 text-16 text-light-1'>Vendor GST Amount</label>
              </div>
            </div>
            <div className='col-lg-4'>
              <div className='form-input'>
                <input
                  onChange={(e) => setVendorMiscCharges(e.target.value)}
                  value={vendorMiscCharges}
                  placeholder=' '
                  type='number'
                  onWheel={(e) => e.target.blur()}
                />
                <label className='lh-1 text-16 text-light-1'>Vendor Misc Charges</label>
              </div>
            </div>
            <div className='col-lg-4'>
              <div className='form-input'>
                <input
                  onChange={(e) => setQuotedAmount(e.target.value)}
                  value={quotedAmount}
                  placeholder=' '
                  type='number'
                  onWheel={(e) => e.target.blur()}
                />
                <label className='lh-1 text-16 text-light-1'>Quoted Amount</label>
              </div>
            </div>
            <div className='col-lg-4'>
              <div className='form-input'>
                <input
                  onChange={(e) => setActualAmount(e.target.value)}
                  value={actualAmount}
                  placeholder=' '
                  type='number'
                  onWheel={(e) => e.target.blur()}
                />
                <label className='lh-1 text-16 text-light-1'>Actual Amount</label>
              </div>
            </div>
            <div className='col-lg-4'>
              <div className='form-input'>
                <input
                  onChange={(e) => setCurrency(e.target.value)}
                  value={currency}
                  placeholder=' '
                  type='text'
                  maxLength={3}
                />
                <label className='lh-1 text-16 text-light-1'>Currency</label>
              </div>
            </div>

            {/* Commission */}
            <h3>Commission Details</h3>
            <div className='form-input-select col-lg-4'>
              <label>Commission Rule</label>
              <Select
                isClearable
                options={commissionRules}
                value={commissionRuleID}
                onChange={(id) => setCommissionRuleID(id)}
              />
            </div>
            <div className='col-lg-4'>
              <div className='form-input'>
                <input
                  onChange={(e) => setIataCommissionPct(e.target.value)}
                  value={iataCommissionPct}
                  placeholder=' '
                  type='number'
                  onWheel={(e) => e.target.blur()}
                />
                <label className='lh-1 text-16 text-light-1'>
                  IATA Commission %
                </label>
              </div>
            </div>
            <div className='col-lg-4'>
              <div className='form-input'>
                <input
                  onChange={(e) => setPlbCommissionPct(e.target.value)}
                  value={plbCommissionPct}
                  placeholder=' '
                  type='number'
                  onWheel={(e) => e.target.blur()}
                />
                <label className='lh-1 text-16 text-light-1'>PLB Commission %</label>
              </div>
            </div>

            {/* Travel Dates */}
            <h3>Travel Details</h3>
            <div className='d-block ml-3 form-datepicker col-lg-4'>
              <label>Travel Date</label>
              <DatePicker
                style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                inputClass='custom_input-picker'
                containerClassName='custom_container-picker'
                value={travelDate}
                onChange={setTravelDate}
                numberOfMonths={1}
                offsetY={10}
                format='DD MMMM YYYY'
              />
            </div>
            {isHotelBooking && (
              <div className='d-block ml-3 form-datepicker col-lg-4'>
                <label>Checkout Date</label>
                <DatePicker
                  style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                  inputClass='custom_input-picker'
                  containerClassName='custom_container-picker'
                  value={checkoutDate}
                  onChange={setCheckoutDate}
                  numberOfMonths={1}
                  offsetY={10}
                  format='DD MMMM YYYY'
                />
              </div>
            )}
            {isFlightType && (
              <>
                <div className='col-lg-4'>
                  <div className='form-input'>
                    <input
                      onChange={(e) => setBaggageAllowance(e.target.value)}
                      value={baggageAllowance}
                      placeholder=' '
                      type='text'
                    />
                    <label className='lh-1 text-16 text-light-1'>
                      Baggage Allowance
                    </label>
                  </div>
                </div>
                <div className='col-lg-4'>
                  <div className='form-input'>
                    <input
                      onChange={(e) => setSeatNumbers(e.target.value)}
                      value={seatNumbers}
                      placeholder=' '
                      type='text'
                    />
                    <label className='lh-1 text-16 text-light-1'>Seat Numbers</label>
                  </div>
                </div>
              </>
            )}

            {/* Options / Flags */}
            <h3>Options</h3>
            <div className='d-flex items-center gap-3'>
              <ReactSwitch
                onChange={() => setShowClientGst((prev) => !prev)}
                checked={showClientGst}
              />
              <label>Show Client GST</label>
            </div>
            <div className='d-flex items-center gap-3'>
              <ReactSwitch
                onChange={() => setIsPersonal((prev) => !prev)}
                checked={isPersonal}
              />
              <label>Is Personal</label>
            </div>
            <div className='d-flex items-center gap-3'>
              <ReactSwitch
                onChange={() => setShowFare((prev) => !prev)}
                checked={showFare}
              />
              <label>Show Fare</label>
            </div>
            <div className='d-flex items-center gap-3'>
              <ReactSwitch
                onChange={() => setSendOnlyToSupport((prev) => !prev)}
                checked={sendOnlyToSupport}
              />
              <label>Send Only To Support</label>
            </div>
            <div className='d-flex items-center gap-3'>
              <ReactSwitch
                onChange={() => setEmailTravellers((prev) => !prev)}
                checked={emailTravellers}
              />
              <label>Email Travellers</label>
            </div>
            <div className='d-flex items-center gap-3'>
              <ReactSwitch
                onChange={() => setTripcentralBilling((prev) => !prev)}
                checked={tripcentralBilling}
              />
              <label>Tripcentral Billing</label>
            </div>
            {tripcentralBilling && (
              <div className='col-lg-4'>
                <div className='form-input'>
                  <input
                    onChange={(e) => setTripcentralCostAmount(e.target.value)}
                    value={tripcentralCostAmount}
                    placeholder=' '
                    type='number'
                    onWheel={(e) => e.target.blur()}
                  />
                  <label className='lh-1 text-16 text-light-1'>
                    Tripcentral Cost Amount
                  </label>
                </div>
              </div>
            )}

            <div className='d-inline-block'>
              <button
                type='submit'
                className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
              >
                Update Agent Booking
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

EditAgentBooking.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditAgentBooking;

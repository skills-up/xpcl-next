import { useEffect, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AiOutlineMail } from 'react-icons/ai';
import { BiPlusMedical } from 'react-icons/bi';
import { BsTrash3, BsWhatsapp } from 'react-icons/bs';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import WindowedSelect from 'react-windowed-select';
import { createItem } from '../../../api/xplorzApi';
import { sendToast } from '../../../utils/toastify';

function EmailClients() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [markup, setMarkup] = useState(0);
  const [withoutFares, setWithoutFares] = useState(false);
  const [additionalFlights, setAdditionalFlights] = useState([]);
  const clientTravellers = useSelector(
    (state) => state.flightSearch.value.clientTravellers
  );
  const airlines = useSelector((state) => state.flightSearch.value.airlineOrgs);
  const airports = useSelector((state) => state.apis.value.airports);
  const cabinOptions = ['Economy', 'Premium Economy', 'Business', 'First'];
  const travellers = useSelector((state) => state.flightSearch.value.travellers);
  const emailClients = useSelector((state) => state.flightSearch.value.emailClients);
  const destinations = useSelector((state) => state.flightSearch.value.destinations);
  const travellerDOBS = useSelector((state) => state.flightSearch.value.travellerDOBS);
  const [user, setUser] = useState();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const response = await createItem('auth/me', {});
    if (response?.success) {
      setUser(response.data);
    }
  };

  const submit = async (type) => {
    if (additionalFlights.length === 0 && emailClients.length === 0) {
      sendToast('error', 'Please select a record to send to the client', 4000);
      return;
    }
    if (name.trim().length === 0) {
      sendToast('error', 'Please enter a Recipient Name', 4000);
      return;
    }
    if (email.trim().length === 0) {
      sendToast('error', 'Please enter a Recipient Email', 4000);
      return;
    }
    if (markup === '') {
      sendToast('error', 'Please enter a Markup', 4000);
      return;
    }
    for (let additionalFlight of additionalFlights) {
      if (!additionalFlight.airline) {
        sendToast('error', 'Please Select an Airline', 4000);
        return;
      }
      if (additionalFlight.flight.trim().length === 0) {
        sendToast('error', 'Please enter Flight Code', 4000);
        return;
      }
      if (!additionalFlight.from_airport_id) {
        sendToast('error', 'Please Select From Airport', 4000);
        return;
      }
      if (!additionalFlight.to_airport_id) {
        sendToast('error', 'Please Select To Airport', 4000);
        return;
      }
      if (!additionalFlight.depart_time) {
        sendToast('error', 'Please enter Depart Time', 4000);
        return;
      }
      if (!additionalFlight.arrival_time) {
        sendToast('error', 'Please enter Arrival Time', 4000);
        return;
      }
      if (!additionalFlight.cabin) {
        sendToast('error', 'Please Select a Cabin', 4000);
        return;
      }
      if (!additionalFlight.class) {
        sendToast('error', 'Please enter Class', 4000);
        return;
      }
      if (!additionalFlight.price) {
        sendToast('error', 'Please enter Price', 4000);
        return;
      }
    }
    // From, To, Date
    let fromDestination;
    let toDestination;
    for (let airport of airports) {
      if (destinations.from.iata === airport.iata_code) fromDestination = airport.name;
      if (destinations.to.iata === airport.iata_code) toDestination = airport.name;
    }
    let dateDestination = new DateObject({
      date: destinations.departDate,
      format: 'YYYY-MM-DD',
    })
      .toDate()
      .toDateString();
    // Manipulating Data
    let tempTo = [];
    let tempFrom = [];
    for (let opt of emailClients) {
      let airlineName;
      for (let airline of airlines) {
        if (airline.code === opt.segments[0].flight.airline) airlineName = airline.name;
      }
      let cabin;
      if (opt.provider === 'aa') {
        if (opt.prices.prices.ADT.cabinClass === 'EC') cabin = 'Economy';
      } else if (opt.provider === 'tj') {
        if (opt.prices.prices.ADULT.cabinClass === 'PREMIUM_ECONOMY')
          cabin = 'Premium Economy';
        else {
          cabin =
            opt.prices.prices.ADULT.cabinClass.charAt(0).toUpperCase() +
            opt.prices.prices.ADULT.cabinClass.slice(1).toLowerCase();
        }
      }
      let data = {
        airline: airlineName,
        airline_code: opt.segments[0].flight.airline,
        from: opt.segments[0].departure.airport.code,
        to: opt.segments.at(-1).arrival.airport.code,
        departure: new Date(opt.segments[0].departure.time).toString().slice(0, -31),
        arrival: new Date(opt.segments.at(-1).arrival.time).toString().slice(0, -31),
        flight: `${opt.segments[0].flight.airline} ${opt.segments[0].flight.number}`,
        cabin,
        price: +opt.total + +markup,
      };
      if (opt.type === 'to') {
        tempTo.push(data);
      } else if (opt.type === 'from') {
        tempFrom.push(data);
      }
    }
    for (let opt of additionalFlights) {
      let data = {
        airline: opt.airline.label,
        airline_code: opt.airline.value,
        from: opt.from_airport_id.iata,
        to: opt.to_airport_id.iata,
        departure: new Date(opt.depart_date.format('YYYY-MM-DD') + 'T' + opt.depart_time)
          .toString()
          .slice(0, -31),
        arrival: new Date(opt.arrival_date.format('YYYY-MM-DD') + 'T' + opt.arrival_time)
          .toString()
          .slice(0, -31),
        flight: `${opt.airline.code} ${opt.flight}`,
        cabin: opt.cabin.value,
        price: +opt.price + +markup,
      };
      if (opt.from_airport_id.iata === destinations.from.iata) {
        tempFrom.push(data);
      } else {
        tempTo.push(data);
      }
    }
    let manipData = { to: tempTo, from: tempFrom };
    // Form Data
    let formData = new FormData();
    formData.append(
      'subject',
      `Flight Options from ${destinations.from.iata} to ${destinations.to.iata} - ${dateDestination}`
    );
    let data = (
      <div>
        <p>Hi {name},</p>
        <p>
          Here are the options for {destinations.from.iata} to {destinations.to.iata} on{' '}
          {dateDestination}
        </p>
        {Object.entries(manipData).map(([key, value], index) => {
          // Traveller Names
          let str = '';
          for (let i = 0; i < travellers.length; i++) {
            if (travellers.length > 1) {
              if (i + 1 < travellers.length) {
                if (i > 0) {
                  str += ' , ' + travellers[i].label;
                } else {
                  str += travellers[i].label;
                }
              } else {
                str += ' and ' + travellers[i].label;
              }
            } else {
              str += travellers[i].label;
            }
          }
          if (value && value.length > 0)
            return (
              <table width='100%' style={{ border: '0' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ccc', paddingTop: '15px' }}>
                    <th>S.No.</th>
                    <th>Airline</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Departure</th>
                    <th>Arrival</th>
                    <th>Flight</th>
                    <th>Cabin</th>
                    {!withoutFares && <th>Price</th>}
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {value.map((element, index) => {
                    return (
                      <>
                        <tr key={index}>
                          <td colspan='10'>
                            <hr />
                          </td>
                        </tr>
                        <tr
                          style={{ borderBottom: '1px solid #ccc', paddingTop: '15px' }}
                        >
                          <td rowspan='1' style={{ textAlign: 'center' }}>
                            {index + 1}.
                          </td>
                          <td rowspan='1' style={{ textAlign: 'center' }}>
                            <span
                              class='proton-image-anchor'
                              data-proton-remote='remote-1'
                              style={{ maxWidth: '50px' }}
                            >
                              <img
                                src={`/img/flights/${element.airline_code}.png`}
                                loading='lazy'
                                style={{ maxWidth: '50px' }}
                              />
                            </span>
                            <br />
                            {element.airline}
                          </td>
                          <td style={{ textAlign: 'center' }}>{element.from}</td>
                          <td style={{ textAlign: 'center' }}>{element.to}</td>
                          <td style={{ textAlign: 'center' }}>{element.departure}</td>
                          <td style={{ textAlign: 'center' }}>{element.arrival}</td>
                          <td style={{ textAlign: 'center' }}>{element.flight}</td>
                          <td style={{ textAlign: 'center' }}>{element.cabin}</td>
                          {!withoutFares && (
                            <td rowspan='1' style={{ textAlign: 'center' }}>
                              {(+element.price).toLocaleString('en-IN', {
                                maximumFractionDigits: 2,
                                style: 'currency',
                                currency: 'INR',
                              })}
                            </td>
                          )}
                          <td rowspan='1' style={{ textAlign: 'center' }}>
                            <a
                              target='_blank'
                              href={`mailto:${
                                user?.email
                              }?cc=support@xplorz.com&amp;subject=Selected flight option for ${str} from ${
                                element.from
                              } to ${element.to} on ${element.departure}&amp;body=Dear ${
                                user?.name
                              },%0D%0A%0D%0AWe've selected the following flight option for ${str}:%0D%0A%0D%0A${
                                element.flight
                              } : ${element.from} @ ${element.departure} &rarr; ${
                                element.to
                              } @ ${element.arrival} - ${element.cabin} ${
                                !withoutFares ? '%0D%0A%0D%0AFare per pax: ' : ''
                              }${
                                !withoutFares
                                  ? `${(+element.price).toLocaleString('en-IN', {
                                      maximumFractionDigits: 2,
                                      style: 'currency',
                                      currency: 'INR',
                                    })}/-`
                                  : ''
                              }%0D%0A%0D%0APlease book the same.%0D%0A%0D%0AThanks!`}
                              style={{
                                background: '#f0ad4e',
                                color: '#fff',
                                borderColor: '#eea236',
                                fontWeight: 'bold',
                                padding: '1em',
                                textDecoration: 'none',
                                fontSize: '12px',
                                lineHeight: '1.5',
                                borderRadius: '3px',
                              }}
                              //  'background:#f0ad4e;color:#fff;border-color:#eea236;font-weight:bold;padding:1em;text-decoration:none;font-size:12px;line-height:1.5;border-radius:3px'
                              rel='noreferrer nofollow noopener'
                            >
                              Book
                            </a>
                          </td>
                        </tr>
                      </>
                    );
                  })}
                </tbody>
              </table>
            );
        })}
        <br />
        <p>Please let us know which of the above work.</p>
        <p>
          Regards,
          <br />
          XCPL Support Team
        </p>
      </div>
    );
    formData.append('body', renderToStaticMarkup(data));
    formData.append('to[]', email);
    // Email
    let response;
    if (type === 'email') {
      response = await createItem('send/email', formData);
    }
    // Whatsapp
    else if (type === 'whatsapp') {
    }
  };

  return (
    <>
      {/* End .row */}
      <div className='border-light bg-white rounded-4 pr-20 py-20 lg:px-10 lg:pb-20 mb-15'>
        <div className='pl-20 lg:pl-0'>
          <div className='row x-gap-30 y-gap-20 my-2'>
            <div className='col-md-5'>
              <div className='form-input'>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  placeholder=' '
                  type='text'
                />
                <label className='lh-1 text-16 text-light-1'>
                  Recipient First Name<span className='text-danger'>*</span>
                </label>
              </div>
            </div>
            <div className='col-md-5'>
              <div className='form-input'>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  placeholder=' '
                  type='email'
                />
                <label className='lh-1 text-16 text-light-1'>
                  Recipient Email<span className='text-danger'>*</span>
                </label>
              </div>
            </div>
            <div className='col-md-2'>
              <div className='form-input'>
                <input
                  onChange={(e) => setMarkup(e.target.value)}
                  value={markup}
                  placeholder=' '
                  type='number'
                />
                <label className='lh-1 text-16 text-light-1'>
                  Mark-Up<span className='text-danger'>*</span>
                </label>
              </div>
            </div>
          </div>
          {/* Without Fares */}
          <div className='form-checkbox d-flex items-center'>
            <input
              type='checkbox'
              name='name'
              checked={withoutFares}
              onClick={() => {
                setWithoutFares((prev) => !prev);
              }}
            />
            <div className='form-checkbox__mark'>
              <div className='form-checkbox__icon icon-check' />
            </div>
            <div className='ml-10'>Without Fares</div>
          </div>

          {/* Additional Flight Options */}
          <div className='mt-10'>
            <label className='d-block'>Additional Flight Options</label>
            <div>
              {additionalFlights.map((element, index) => {
                return (
                  <div
                    className='d-flex flex-column bg-light my-4 py-20 pb-40 px-30 md:px-10 md:py-10'
                    key={index}
                  >
                    <div className='d-flex justify-between'>
                      <div>{index + 1}.</div>
                      <span
                        className='pb-10'
                        onClick={() =>
                          setAdditionalFlights((prev) => {
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
                          Airline<span className='text-danger'>*</span>
                        </label>
                        <Select
                          options={airlines.map((el) => ({
                            value: el.id,
                            label: el.name,
                            code: el.code,
                          }))}
                          placeholder='Search..'
                          value={element['airline']}
                          onChange={(id) => {
                            setAdditionalFlights((prev) => {
                              prev[index]['airline'] = id;
                              return [...prev];
                            });
                          }}
                        />
                      </div>
                      <div className='col-md-6'>
                        <div className='form-input bg-white'>
                          <input
                            value={element['flight']}
                            onChange={(e) => {
                              setAdditionalFlights((prev) => {
                                prev[index]['flight'] = e.target.value;
                                return [...prev];
                              });
                            }}
                            placeholder=' '
                            type='text'
                          />
                          <label className='lh-1 text-16 text-light-1'>
                            Flight<span className='text-danger'>*</span>
                          </label>
                        </div>
                      </div>
                      <div className='form-input-select col-md-6'>
                        <label>
                          From<span className='text-danger'>*</span>
                        </label>
                        <WindowedSelect
                          options={airports.map((airport) => ({
                            value: airport.id,
                            label: `|${airport.iata_code}|${airport.city}|${airport.name}|${airport.country_name}`,
                            iata: airport.iata_code,
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
                            setAdditionalFlights((prev) => {
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
                          options={airports.map((airport) => ({
                            value: airport.id,
                            label: `|${airport.iata_code}|${airport.city}|${airport.name}|${airport.country_name}`,
                            iata: airport.iata_code,
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
                            setAdditionalFlights((prev) => {
                              prev[index]['to_airport_id'] = id;
                              return [...prev];
                            })
                          }
                        />
                      </div>
                      <div className='col-md-6 col-lg-3 form-datepicker'>
                        <label>
                          Depart<span className='text-danger'>*</span>
                        </label>
                        <DatePicker
                          style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                          inputClass='custom_input-picker'
                          containerClassName='custom_container-picker'
                          value={element['depart_date']}
                          onChange={(date) => {
                            setAdditionalFlights((prev) => {
                              prev[index]['depart_date'] = date;
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
                              setAdditionalFlights((prev) => {
                                prev[index]['depart_time'] = e.target.value;
                                return [...prev];
                              })
                            }
                            value={element['depart_time']}
                            placeholder=' '
                            type='time'
                            step={30}
                          />
                          <label className='lh-1 text-16 text-light-1'>
                            Depart Time<span className='text-danger'>*</span>
                          </label>
                        </div>
                      </div>
                      <div className='col-md-6 col-lg-3 form-datepicker'>
                        <label>
                          Arrive<span className='text-danger'>*</span>
                        </label>
                        <DatePicker
                          style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                          inputClass='custom_input-picker'
                          containerClassName='custom_container-picker'
                          value={element['arrival_date']}
                          onChange={(date) => {
                            setAdditionalFlights((prev) => {
                              prev[index]['arrival_date'] = date;
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
                              setAdditionalFlights((prev) => {
                                prev[index]['arrival_time'] = e.target.value;
                                return [...prev];
                              })
                            }
                            value={element['arrival_time']}
                            placeholder=' '
                            type='time'
                            step={30}
                          />
                          <label className='lh-1 text-16 text-light-1'>
                            Arrival Time<span className='text-danger'>*</span>
                          </label>
                        </div>
                      </div>
                      <div className='col-md-6 form-input-select'>
                        <label>
                          Cabin<span className='text-danger'>*</span>
                        </label>
                        <Select
                          options={cabinOptions.map((el) => ({ value: el, label: el }))}
                          value={element['cabin']}
                          onChange={(id) =>
                            setAdditionalFlights((prev) => {
                              prev[index]['cabin'] = id;
                              return [...prev];
                            })
                          }
                        />
                      </div>
                      <div className='col-md-3'>
                        <div className='form-input bg-white'>
                          <input
                            onChange={(e) =>
                              setAdditionalFlights((prev) => {
                                prev[index]['class'] = e.target.value;
                                return [...prev];
                              })
                            }
                            value={element['class']}
                            placeholder=' '
                            minLength={1}
                            maxLength={1}
                            type='text'
                          />
                          <label className='lh-1 text-16 text-light-1'>
                            Class<span className='text-danger'>*</span>
                          </label>
                        </div>
                      </div>
                      <div className='col-md-3'>
                        <div className='form-input bg-white'>
                          <input
                            onChange={(e) =>
                              setAdditionalFlights((prev) => {
                                prev[index]['price'] = e.target.value;
                                return [...prev];
                              })
                            }
                            value={element['price']}
                            placeholder=' '
                            type='number'
                          />
                          <label className='lh-1 text-16 text-light-1'>
                            Price<span className='text-danger'>*</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className='d-flex justify-center'>
              <button
                className='btn btn-success my-2 d-flex items-center gap-2'
                onClick={(e) => {
                  e.preventDefault();
                  setAdditionalFlights((prev) => {
                    let fromAirportID = null;
                    if (prev.length > 0) {
                      if (prev.at(-1)?.to_airport_id)
                        fromAirportID = prev.at(-1)?.to_airport_id;
                    }
                    return [
                      ...prev,
                      {
                        airline: null,
                        flight: '',
                        from_airport_id: fromAirportID,
                        to_airport_id: null,
                        depart_date: new DateObject(),
                        depart_time: '',
                        arrival_date: new DateObject(),
                        arrival_time: '',
                        cabin: null,
                        class: '',
                        price: '',
                      },
                    ];
                  });
                }}
              >
                <BiPlusMedical /> Add Flight Option
              </button>
            </div>
          </div>
        </div>
        {/* End search button_item */}
        <div className='button-item pl-20 mt-20 lg:pl-0 row x-gap-10 y-gap-10'>
          <div className='col-md-6'>
            <button
              className='d-block mainSearch__submit button -blue-1 col-12 py-15 h-60 rounded-4 bg-dark-3 text-white'
              onClick={() => submit('email')}
            >
              <AiOutlineMail className='icon-search text-20 mr-10' />
              Send In Email
            </button>
          </div>
          <div className='col-md-6'>
            <button
              className='d-block mainSearch__submit button -blue-1 py-15 col-12 h-60 rounded-4 bg-dark-3 text-white'
              onClick={submit}
            >
              <BsWhatsapp className='icon-search text-20 mr-10' />
              Send Through Whatsapp
            </button>
          </div>
        </div>
      </div>
      {/* End .mainSearch */}
    </>
  );
}

export default EmailClients;

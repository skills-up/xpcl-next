import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { BiPlusMedical } from 'react-icons/bi';
import { BsSend, BsTrash3 } from 'react-icons/bs';
import WindowedSelect from 'react-windowed-select';

function EmailClients() {
  const [travellers, setTravellers] = useState([]);
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
  const classOptions = ['O', 'W', 'P', 'J'];

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {};

  const submit = async () => {};

  return (
    <>
      {/* End .row */}
      <div className='border-light bg-white rounded-4 pr-20 py-20 lg:px-10 lg:pb-20 mb-15'>
        <div className='pl-20 lg:pl-0'>
          <div className='form-input-select'>
            <label>
              Travellers<span className='text-danger'>*</span>
            </label>
            <Select
              options={clientTravellers.map((el) => ({
                value: el.id,
                label: el.traveller_name,
                traveller_id: el.traveller_id,
              }))}
              value={travellers}
              isMulti
              placeholder='Search..'
              onChange={(values) => setTravellers(values)}
            />
          </div>
          <div className='row x-gap-30 y-gap-20 my-2'>
            <div className='col-md-5'>
              <div className='form-input'>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  placeholder=' '
                  type='text'
                />
                <label className='lh-1 text-16 text-light-1'>Recipient First Name</label>
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
                <label className='lh-1 text-16 text-light-1'>Recipient Email</label>
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
                <label className='lh-1 text-16 text-light-1'>Mark-Up</label>
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
                          <label className='lh-1 text-16 text-light-1'>Flight</label>
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
                          <label className='lh-1 text-16 text-light-1'>Depart Time</label>
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
                            Arrival Time
                          </label>
                        </div>
                      </div>
                      <div className='col-md-6 form-input-select'>
                        <label>Cabin</label>
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
                      <div className='form-input-select col-md-3'>
                        <label>
                          Class<span className='text-danger'>*</span>
                        </label>
                        <Select
                          options={classOptions.map((el) => ({ value: el, label: el }))}
                          value={element['class']}
                          placeholder='Search..'
                          onChange={(id) =>
                            setAdditionalFlights((prev) => {
                              prev[index]['class'] = id;
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
                                prev[index]['price'] = e.target.value;
                                return [...prev];
                              })
                            }
                            value={element['price']}
                            placeholder=' '
                            type='number'
                          />
                          <label className='lh-1 text-16 text-light-1'>Price</label>
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
                        class: null,
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
        <div className='button-item pl-20 mt-20 lg:pl-0'>
          <button
            className='d-block mainSearch__submit button -blue-1 py-15 h-60 col-12 rounded-4 bg-dark-3 text-white'
            onClick={submit}
          >
            <BsSend className='icon-search text-20 mr-10' />
            Send In Email
          </button>
        </div>
      </div>
      {/* End .mainSearch */}
    </>
  );
}

export default EmailClients;

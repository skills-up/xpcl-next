import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { use, useEffect, useState } from 'react';
import { createItem, getList } from '../../../../api/xplorzApi';
import ReactSwitch from 'react-switch';
import Select from 'react-select';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { AiOutlinePlus } from 'react-icons/ai';
import { BsTrash3 } from 'react-icons/bs';
import NewFileUploads from '../../../../components/new-file-uploads';

const AddNewTravellers = () => {
  const [prefix, setPrefix] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [passportName, setPassportName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportGender, setPassportGender] = useState(null);
  const [passportDOB, setPassportDOB] = useState(null);
  const [passportIssueDate, setPassportIssueDate] = useState(null);
  const [passportExpiryDate, setPassportExpiryDate] = useState(null);
  const [euBiometrics, setEUBiometrics] = useState(null);
  const [passportIssuePlace, setPassportIssuePlace] = useState('');
  const [mobilePhone, setMobilePhone] = useState('');
  const [email, setEmail] = useState('');
  const [domesticAirlinePreference, setDomesticAirlinePreference] = useState([]);
  const [domesticCabinPreference, setDomesticCabinPreference] = useState(null);
  const [internationalAirlinePreference, setInternationalAirlinePreference] = useState(
    []
  );
  const [internationalCabinPreference, setInternationalCabinPreference] = useState(null);
  const [mealPreference, setMealPreference] = useState(null);
  const [seatPreference, setSeatPreference] = useState(null);
  const [cabinPosition, setCabinPosition] = useState(null);
  const [farePreference, setFarePreference] = useState(null);
  const [address, setAddress] = useState('');
  const [mealNotes, setMealNotes] = useState('');
  const [seatNotes, setSeatNotes] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [vaccinationCertificateFile, setVaccinationCertificateFile] = useState(null);
  const [panCardScanFile, setPanCardScanFile] = useState(null);
  const [aadhaarCardScanFile, setAadhaarCardScanFile] = useState(null);
  const [photoScanFile, setPhotoScanFile] = useState(null);
  const [aliases, setAliases] = useState([{ value: '' }]);
  const [vaccinationDates, setVaccinationDates] = useState([]);
  const [passportScanFiles, setPassportScanFiles] = useState([]);
  const [countries, setCountries] = useState([]);
  const [countryCodeID, setCountryCodeID] = useState(null);
  const [airlines, setAirlines] = useState([]);
  const [eaPhoneNumber, setEAPhoneNumber] = useState('');
  const [fareMarkupPercent, setFareMarkupPercent] = useState('');
  const [airlineMarkupOverrides, setAirlineMarkupOverrides] = useState([
    { airline: '', markup: '' },
  ]);

  // Options
  const passportPrefixOptions = [
    { value: 'MR', label: 'Mr.' },
    { value: 'MRS', label: 'Mrs.' },
    { value: 'MSTR', label: 'Mstr.' },
    { value: 'MS', label: 'Ms.' },
  ];
  const passportGenderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
  ];
  const cabinPreferenceOptions = [
    { value: 'Business', label: 'Business' },
    { value: 'Economy', label: 'Economy' },
    { value: 'Premium Economy', label: 'Premium Economy' },
  ];
  const mealPreferenceOptions = [
    { value: 'AVML', label: 'Vegetarian' },
    { value: 'HNML', label: 'Hindu Non Vegetarian' },
    { value: 'VJML', label: 'Jain Vegetarian' },
    { value: 'NVML', label: 'Non Vegetarian' },
    { value: 'VLML', label: 'Lacto Ovo Meal' },
    { value: 'SFML', label: 'Sea Food Meal' },
  ];
  const seatPreferenceOptions = [
    { value: 'Window', label: 'Window' },
    { value: 'Aisle', label: 'Aisle' },
  ];
  const cabinPositionOptions = [
    { value: 'Front', label: 'Front' },
    { value: 'Middle', label: 'Middle' },
    { value: 'Rear', label: 'Rear' },
  ];
  const farePreferenceOptions = [
    { value: 'Refundable Fare', label: 'Refundable Fare' },
    { value: 'Non-Refundable Fare', label: 'Non-Refundable Fare' },
  ];

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    getData();
  }, []);

  const handleOverrideChange = (index, field, value) => {
    setAirlineMarkupOverrides((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addOverrideRow = () => {
    setAirlineMarkupOverrides((prev) => [...prev, { airline: '', markup: '' }]);
  };

  const removeOverrideRow = (index) => {
    setAirlineMarkupOverrides((prev) => {
      if (prev.length === 1) return [{ airline: '', markup: '' }];
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const getData = async () => {
    let response = await getList('countries');
    let airlines = await getList('organizations', { is_airline: 1 });
    if (response?.success && airlines?.success) {
      setCountries(response.data);
      setAirlines(airlines.data.map((el) => ({ label: el.name, value: el.code })));
    } else {
      sendToast('error', 'Error Getting Data', 4000);
      router.back();
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    let passportFormData = new FormData();
    passportFormData.append('prefix', prefix?.value ?? '');
    passportFormData.append('first_name', firstName);
    passportFormData.append('middle_name', middleName ?? '');
    passportFormData.append('last_name', lastName);
    passportFormData.append('passport_name', passportName ?? '');
    passportFormData.append('passport_number', passportNumber ?? '');
    passportFormData.append('passport_gender', passportGender?.value ?? '');
    if (passportDOB)
      passportFormData.append('passport_dob', passportDOB.format('YYYY-MM-DD'));
    else {
      sendToast('error', 'Date of Birth (as on passport) is a mandatory field', 4000);
      return;
    }
    if (passportIssueDate)
      passportFormData.append(
        'passport_issue_date',
        passportIssueDate.format('YYYY-MM-DD')
      );
    if (euBiometrics)
      passportFormData.append('last_eu_biometrics', euBiometrics.format('YYYY-MM-DD'));
    if (passportExpiryDate)
      passportFormData.append(
        'passport_expiry_date',
        passportExpiryDate.format('YYYY-MM-DD')
      );
    passportFormData.append('passport_issue_place', passportIssuePlace ?? '');
    passportFormData.append('mobile_phone', mobilePhone ?? '');
    passportFormData.append('email_address', email ?? '');
    passportFormData.append('ea_phone_number', eaPhoneNumber.trim());
    if (fareMarkupPercent !== '' && !Number.isNaN(Number(fareMarkupPercent)))
      passportFormData.append('fare_markup_percent', fareMarkupPercent);
    const cleanedOverrides = airlineMarkupOverrides
      .map(({ airline, markup }) => ({
        airline: airline?.trim().toUpperCase(),
        markup: markup === '' ? '' : parseFloat(markup),
      }))
      .filter(({ airline, markup }) => airline && markup !== '' && !Number.isNaN(markup));
    if (cleanedOverrides.length) {
      const overridePayload = {};
      cleanedOverrides.forEach(({ airline, markup }) => {
        overridePayload[airline] = markup;
      });
      passportFormData.append('airline_markup_overrides', JSON.stringify(overridePayload));
    }
    if (domesticAirlinePreference && domesticAirlinePreference.length > 0)
      for (let pref of domesticAirlinePreference)
        passportFormData.append('domestic_airline_preference[]', pref?.value ?? '');
    if (internationalAirlinePreference && internationalAirlinePreference.length > 0)
      for (let pref of internationalAirlinePreference)
        passportFormData.append('international_airline_preference[]', pref?.value ?? '');
    passportFormData.append(
      'domestic_cabin_preference',
      domesticCabinPreference?.value ?? ''
    );
    passportFormData.append(
      'international_cabin_preference',
      internationalCabinPreference?.value ?? ''
    );
    passportFormData.append('meal_preference', mealPreference?.value ?? '');
    passportFormData.append('seat_preference', seatPreference?.value ?? '');
    passportFormData.append('cabin_position', cabinPosition?.value ?? '');
    passportFormData.append('fare_preference', farePreference?.value ?? '');
    passportFormData.append('address', address ?? '');
    let meal_str = '';
    let seat_str = '';
    if (mealNotes.trim().length > 0) {
      let arr = mealNotes.split(' ');
      for (let i = 0; i < arr.length; i++) {
        if (i + 1 < arr.length) {
          meal_str += (arr[i] ? arr[i].at(0).toUpperCase() + arr[i].slice(1) : '') + ' ';
        } else {
          meal_str += arr[i] ? arr[i].at(0).toUpperCase() + arr[i].slice(1) : '';
        }
      }
    }
    if (seatNotes.trim().length > 0) {
      let arr = seatNotes.split(' ');
      for (let i = 0; i < arr.length; i++) {
        if (i + 1 < arr.length) {
          seat_str += (arr[i] ? arr[i].at(0).toUpperCase() + arr[i].slice(1) : '') + ' ';
        } else {
          seat_str += arr[i] ? arr[i].at(0).toUpperCase() + arr[i].slice(1) : '';
        }
      }
    }
    passportFormData.append('meal_notes', meal_str ?? '');
    passportFormData.append('seat_notes', seat_str ?? '');
    passportFormData.append('pan_number', panNumber ?? '');
    passportFormData.append('aadhaar_number', aadhaarNumber ?? '');
    passportFormData.append(
      'vaccination_certificate_file',
      vaccinationCertificateFile ?? ''
    );
    passportFormData.append('pan_card_scan_file', panCardScanFile ?? '');
    passportFormData.append('aadhaar_card_scan_file', aadhaarCardScanFile ?? '');
    passportFormData.append('photo_scan_file', photoScanFile ?? '');
    // Country
    if (countryCodeID?.value)
      passportFormData.append('passport_country_code', countryCodeID.value);
    // Aliases
    if (aliases.length === 1 && aliases[0].value.trim().length === 0) {
      passportFormData.append('aliases[]', `${passportName}`);
      passportFormData.append('aliases[]', `${lastName} ${firstName} ${prefix?.value ?? ''}`.trim());
    } else {
      for (let alias of aliases) passportFormData.append('aliases[]', alias?.value);
    }
    if (vaccinationDates && vaccinationDates.length > 0) {
      if (vaccinationDates.length > 3) {
        sendToast('error', 'Max 3 Vaccination Dates are allowed', 4000);
        return;
      }
      for (let date of vaccinationDates)
        passportFormData.append('vaccination_dates[]', date.format('YYYY-MM-DD'));
    }
    for (let file of passportScanFiles)
      passportFormData.append('passport_scan_files[]', file);

    const response = await createItem('travellers', passportFormData);
    if (response?.success) {
      sendToast('success', 'Created Traveller Successfully.', 4000);
      router.push('/dashboard/travellers/view/' + response.data.id);
    } else {
      sendToast(
        'error',
        response.data?.message || response.data?.error || 'Failed to Create Traveller.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Add New Traveller' />
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
                  <h1 className='text-30 lh-14 fw-600'>Add New Traveller</h1>
                  <div className='text-15 text-light-1'>Create a new traveller.</div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <h3>Personal Details</h3>
                    <div className='form-input-select col-lg-2'>
                      <label>Prefix</label>
                      <Select
                        isClearable
                        options={passportPrefixOptions}
                        value={prefix}
                        onChange={(id) => setPrefix(id)}
                      />
                    </div>
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setFirstName(e.target.value)}
                          value={firstName}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          First Name<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-lg-2'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setMiddleName(e.target.value)}
                          value={middleName}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Middle Name</label>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setLastName(e.target.value)}
                          value={lastName}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Last Name<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-lg-3'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setMobilePhone(e.target.value)}
                          value={mobilePhone}
                          placeholder=''
                          minLength={11}
                          maxLength={12}
                          pattern='[0-9]{11,12}'
                          inputMode='numeric'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-light-1 text-15'>
                          Mobile Phone (with Country Code)
                        </label>
                      </div>
                    </div>
                    <div className='col-lg-3'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setEmail(e.target.value)}
                          value={email}
                          placeholder=' '
                          type='email'
                        />
                        <label className='lh-1 text-16 text-light-1'>Email Address</label>
                      </div>
                    </div>
                    <div className='col-lg-3'>
                      <div className='form-input'>
                        <input
                          value={eaPhoneNumber}
                          inputMode='numeric'
                          minLength={11}
                          maxLength={12}
                          pattern='[0-9]{11,12}'
                          placeholder=' '
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '');
                            if (digits.length <= 12) setEAPhoneNumber(digits);
                          }}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          EA Phone Number (12 digits)
                        </label>
                      </div>
                    </div>
                    <div className='col-lg-3'>
                      <div className='form-input'>
                        <input
                          type='number'
                          min='0'
                          step='0.01'
                          onChange={(e) => setFareMarkupPercent(e.target.value)}
                          value={fareMarkupPercent}
                          placeholder=' '
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Fare Markup Percent (%)
                        </label>
                      </div>
                    </div>
                    <div className='col-lg-6'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setAddress(e.target.value)}
                          value={address}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Address</label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <label className='lh-1 text-16 text-light-1 mb-10 d-block'>
                        Airline Markup Overrides
                      </label>
                      <div
                        className='overflow-auto rounded-4'
                        style={{ border: '1px solid #e0e0e0' }}
                      >
                        <table className='table w-100 mb-0'>
                          <thead>
                            <tr>
                              <th className='text-15 fw-600'>Airline Code</th>
                              <th className='text-15 fw-600'>Markup (%)</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {airlineMarkupOverrides.map((row, index) => (
                              <tr key={index}>
                                <td>
                                  <input
                                    type='text'
                                    className='form-control'
                                    maxLength={3}
                                    value={row.airline}
                                    placeholder='e.g. AI'
                                    onChange={(e) =>
                                      handleOverrideChange(
                                        index,
                                        'airline',
                                        e.target.value.toUpperCase()
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type='number'
                                    className='form-control'
                                    min='0'
                                    step='0.01'
                                    value={row.markup}
                                    placeholder='e.g. 5'
                                    onChange={(e) =>
                                      handleOverrideChange(index, 'markup', e.target.value)
                                    }
                                  />
                                </td>
                                <td className='text-right'>
                                  <span
                                    className='pb-10'
                                    onClick={() => removeOverrideRow(index)}
                                  >
                                    <BsTrash3 className='text-danger'/>
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <button
                        type='button'
                        className='btn btn-success my-2 d-flex items-center gap-2'
                        onClick={addOverrideRow}
                      >
                        <AiOutlinePlus className='mr-5' /> Add Row
                      </button>
                      <p className='text-13 text-light-1 mt-5'>
                        Leave blank to use the default markup settings.
                      </p>
                    </div>
                    <h3>Passport Details</h3>
                    <div className='col-lg-3'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setPassportName(e.target.value)}
                          value={passportName}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Name (as on passport)<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='d-block ml-3 form-datepicker-alternate col-lg-3'>
                      <label className='text-15'>
                        Date Of Birth (as on passport)
                        <span className='text-danger'>*</span>
                      </label>
                      <DatePicker
                        style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                        inputClass='custom_input-picker'
                        containerClassName='custom_container-picker'
                        value={passportDOB}
                        onChange={setPassportDOB}
                        numberOfMonths={1}
                        offsetY={10}
                        format='DD MMMM YYYY'
                      />
                    </div>
                    <div className='col-lg-3 form-input-select'>
                      <label>Passport Gender</label>
                      <Select
                        isClearable
                        options={passportGenderOptions}
                        value={passportGender}
                        onChange={(id) => setPassportGender(id)}
                      />
                    </div>
                    <div className='col-lg-3 form-input-select'>
                      <label>Passport Country</label>
                      <Select
                        isClearable
                        options={countries.map((el) => ({
                          value: el.code,
                          label: `${el.name} (${el.code})`,
                        }))}
                        value={countryCodeID}
                        onChange={(id) => setCountryCodeID(id)}
                      />
                    </div>
                    <div className='col-lg-3'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setPassportNumber(e.target.value)}
                          value={passportNumber}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Passport Number
                        </label>
                      </div>
                    </div>
                    <div className='d-block ml-3 form-datepicker col-lg-3'>
                      <label>Passport Issue Date</label>
                      <DatePicker
                        style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                        inputClass='custom_input-picker'
                        containerClassName='custom_container-picker'
                        value={passportIssueDate}
                        onChange={(d) => {
                          setPassportIssueDate(d);
                          if (d)
                            setPassportExpiryDate(
                              new DateObject(d.toDate().getTime() + 315569260000)
                            );
                        }}
                        numberOfMonths={1}
                        offsetY={10}
                        format='DD MMMM YYYY'
                      />
                    </div>
                    <div className='d-block ml-3 form-datepicker col-lg-3'>
                      <label>Passport Expiry Date</label>
                      <DatePicker
                        style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                        inputClass='custom_input-picker'
                        containerClassName='custom_container-picker'
                        value={passportExpiryDate}
                        onChange={setPassportExpiryDate}
                        numberOfMonths={1}
                        offsetY={10}
                        format='DD MMMM YYYY'
                      />
                    </div>
                    <div className='col-lg-3'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setPassportIssuePlace(e.target.value)}
                          value={passportIssuePlace}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Passport Issue Place
                        </label>
                      </div>
                    </div>
                    <div className='d-block ml-3 form-datepicker col-lg-3'>
                      <label>Last EU Biometrics</label>
                      <DatePicker
                        style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                        inputClass='custom_input-picker'
                        containerClassName='custom_container-picker'
                        value={euBiometrics}
                        onChange={setEUBiometrics}
                        numberOfMonths={1}
                        offsetY={10}
                        format='DD MMMM YYYY'
                      />
                    </div>
                    {/* Aliases */}
                    <div>
                      <h3>Aliases</h3>
                      <div>
                        {aliases.map((element, index) => (
                          <div key={index} className='d-flex my-2'>
                            <div className='form-input'>
                              <input
                                value={aliases[index].value}
                                onChange={(e) => {
                                  setAliases((prev) => {
                                    prev[index].value = e.target.value;
                                    return [...prev];
                                  });
                                }}
                                type='text'
                                placeholder=' '
                              />
                              <label className='lh-1 text-16 text-light-1'>
                                Add Alias {index + 1}
                              </label>
                            </div>
                            {index !== 0 && (
                              <button
                                className='btn btn-outline-danger ml-10 px-20'
                                onClick={(e) => {
                                  e.preventDefault();
                                  setAliases((prev) => {
                                    prev.splice(index, 1);
                                    return [...prev];
                                  });
                                }}
                              >
                                <BsTrash3 />
                              </button>
                            )}
                            {index + 1 === aliases?.length && (
                              <button
                                className='btn btn-outline-success ml-10 px-20'
                                onClick={() => {
                                  setAliases((prev) => [...prev, { value: '' }]);
                                }}
                              >
                                <AiOutlinePlus />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <h3>Preferences</h3>
                    <div className='form-input-select col-lg-3'>
                      <label>Domestic Airline Preference</label>
                      <Select
                        isClearable
                        isMulti
                        options={airlines}
                        value={domesticAirlinePreference}
                        onChange={setDomesticAirlinePreference}
                      />
                    </div>
                    <div className='form-input-select col-lg-3'>
                      <label>International Airline Preference</label>
                      <Select
                        isClearable
                        isMulti
                        options={airlines}
                        value={internationalAirlinePreference}
                        onChange={setInternationalAirlinePreference}
                      />
                    </div>
                    <div className='col-lg-3 form-input-select'>
                      <label>Domestic Cabin Preference</label>
                      <Select
                        isClearable
                        options={cabinPreferenceOptions}
                        value={domesticCabinPreference}
                        onChange={(id) => setDomesticCabinPreference(id)}
                      />
                    </div>
                    <div className='col-lg-3 form-input-select'>
                      <label>International Cabin Preference</label>
                      <Select
                        isClearable
                        options={cabinPreferenceOptions}
                        value={internationalCabinPreference}
                        onChange={(id) => setInternationalCabinPreference(id)}
                      />
                    </div>
                    <div className='col-lg-3 form-input-select'>
                      <label>Meal Preference</label>
                      <Select
                        isClearable
                        options={mealPreferenceOptions}
                        value={mealPreference}
                        onChange={(id) => setMealPreference(id)}
                      />
                    </div>
                    <div className='col-lg-3 form-input-select'>
                      <label>Seat Preference</label>
                      <Select
                        isClearable
                        options={seatPreferenceOptions}
                        value={seatPreference}
                        onChange={(id) => setSeatPreference(id)}
                      />
                    </div>
                    <div className='col-lg-3 form-input-select'>
                      <label>Cabin Position</label>
                      <Select
                        isClearable
                        options={cabinPositionOptions}
                        value={cabinPosition}
                        onChange={(id) => setCabinPosition(id)}
                      />
                    </div>
                    <div className='col-lg-3 form-input-select'>
                      <label>Fare Preference</label>
                      <Select
                        isClearable
                        options={farePreferenceOptions}
                        value={farePreference}
                        onChange={(id) => setFarePreference(id)}
                      />
                    </div>
                    <div className='col-lg-6'>
                      <div className='form-input'>
                        <input
                          style={{ textTransform: 'capitalize' }}
                          onChange={(e) => setMealNotes(e.target.value)}
                          value={mealNotes}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Meal Notes</label>
                      </div>
                    </div>
                    <div className='col-lg-6'>
                      <div className='form-input'>
                        <input
                          style={{ textTransform: 'capitalize' }}
                          onChange={(e) => setSeatNotes(e.target.value)}
                          value={seatNotes}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Seat Notes</label>
                      </div>
                    </div>
                    <h3>Documents</h3>
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setPanNumber(e.target.value)}
                          value={panNumber}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>PAN Number</label>
                      </div>
                    </div>
                    <div className='col-lg-4'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setAadhaarNumber(e.target.value)}
                          value={aadhaarNumber}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Aadhaar Number
                        </label>
                      </div>
                    </div>
                    {/* Vaccination Dates */}
                    <div className='d-block col-lg-4 ml-3 form-datepicker'>
                      <label>Vaccination Dates (Upto 3)</label>
                      <DatePicker
                        multiple
                        style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                        inputClass='custom_input-picker'
                        containerClassName='custom_container-picker'
                        value={vaccinationDates}
                        onChange={setVaccinationDates}
                        numberOfMonths={1}
                        offsetY={10}
                        format='DD MMM YYYY'
                      />
                    </div>
                    {/* Passport Scan Files Upload */}
                    <div className='col-12'>
                      <label>Passport</label>
                      <NewFileUploads multiple={true} setUploads={setPassportScanFiles} />
                    </div>
                    {/* Photo Scan File Upload */}
                    <div className='col-12'>
                      <label>Digital Photograph</label>
                      <NewFileUploads multiple={false} setUploads={setPhotoScanFile} />
                    </div>
                    {/* Pan Card Scan File Upload */}
                    <div className='col-12'>
                      <label>PAN Card</label>
                      <NewFileUploads multiple={false} setUploads={setPanCardScanFile} />
                    </div>
                    {/* Aadhaar Card Scan File Upload */}
                    <div className='col-12'>
                      <label>Aadhaar Card</label>
                      <NewFileUploads
                        multiple={false}
                        setUploads={setAadhaarCardScanFile}
                      />
                    </div>
                    {/* Vaccination Certificate File Upload */}
                    <div className='col-12'>
                      <label>Vaccination Certificate</label>
                      <NewFileUploads
                        fileTypes={['PDF']}
                        multiple={false}
                        setUploads={setVaccinationCertificateFile}
                      />
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Traveller
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

export default AddNewTravellers;

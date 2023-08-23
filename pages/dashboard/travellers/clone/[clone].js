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
  const [aliases, setAliases] = useState([{ value: '' }]);
  const [vaccinationDates, setVaccinationDates] = useState([]);
  const [passportScanFiles, setPassportScanFiles] = useState([]);
  const [countries, setCountries] = useState([]);
  const [countryCodeID, setCountryCodeID] = useState(null);
  const [airlines, setAirlines] = useState([]);

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
    if (router.isReady) {
      getData();
    }
  }, [router.isReady]);

  const getData = async () => {
    if (router.query.clone) {
      const response = await getItem('travellers', router.query.clone);
      if (response?.success) {
        // Countries
        let countries = await getList('countries');
        let airlines = await getList('organizations', { is_airline: 1 });
        if (countries?.success && airlines?.success) {
          setCountries(countries.data);
          setAirlines(airlines.data.map((el) => ({ label: el.name, value: el.code })));
        } else {
          sendToast('error', 'Error Getting Data', 4000);
          router.back();
        }

        // Setting previous values
        if (response.data?.prefix) {
          for (let opt of passportPrefixOptions)
            if (response.data.prefix === opt.value) setPrefix(opt);
        }
        setFirstName(response.data?.first_name ?? '');
        setMiddleName(response.data?.middle_name ?? '');
        setLastName(response.data?.last_name ?? '');
        setPassportName(response.data?.passport_name ?? '');
        setPassportNumber(response.data?.passport_number ?? '');
        if (response.data?.passport_dob)
          setPassportDOB(
            new DateObject({ date: response.data?.passport_dob, format: 'YYYY-MM-DD' })
          );
        if (response.data?.passport_issue_date)
          setPassportIssueDate(
            new DateObject({
              date: response.data?.passport_issue_date,
              format: 'YYYY-MM-DD',
            })
          );
        if (response.data?.passport_expiry_date)
          setPassportExpiryDate(
            new DateObject({
              date: response.data?.passport_expiry_date,
              format: 'YYYY-MM-DD',
            })
          );
        if (response.data?.last_eu_biometrics) {
          setEUBiometrics(
            new DateObject({
              date: response.data?.last_eu_biometrics,
              format: 'YYYY-MM-DD',
            })
          );
        }
        setPassportIssuePlace(response.data?.passport_issue_place ?? '');
        setMobilePhone(response.data?.mobile_phone ?? '');
        setEmail(response.data?.email_address ?? '');
        if (
          response.data?.domestic_airline_preference &&
          response.data?.domestic_airline_preference?.length > 0
        ) {
          let tempDomestic = [];
          for (let pref of response.data?.domestic_airline_preference)
            for (let airline of airlines.data)
              if (pref === airline.code)
                tempDomestic.push({ label: airline.name, value: airline.code });
          setDomesticAirlinePreference(tempDomestic);
        }
        if (
          response.data?.international_airline_preference &&
          response.data?.international_airline_preference?.length > 0
        ) {
          let tempInternational = [];
          for (let pref of response.data?.international_airline_preference)
            for (let airline of airlines.data)
              if (pref === airline.code)
                tempInternational.push({ label: airline.name, value: airline.code });
          setInternationalAirlinePreference(tempInternational);
        }
        setAddress(response.data?.address ?? '');
        setMealNotes(response.data?.meal_notes ?? '');
        setSeatNotes(response.data?.seat_notes ?? '');
        setPanNumber(response.data?.pan_number ?? '');
        setAadhaarNumber(response.data?.aadhaar_number ?? '');
        // Countries
        for (let country of countries.data) {
          if (country.code === response.data.passport_country_code) {
            setCountryCodeID({
              value: country.code,
              label: `${country.name} (${country.code})`,
            });
          }
        }
        // Setting Passport Gender
        for (let gender of passportGenderOptions)
          if (gender.value === response.data?.passport_gender) setPassportGender(gender);
        // Setting Domestic Cabin Preference
        for (let pref of cabinPreferenceOptions)
          if (pref.value === response.data?.domestic_cabin_preference)
            setDomesticCabinPreference(pref);
        // Setting International Cabin Preference
        for (let pref of cabinPreferenceOptions)
          if (pref.value === response.data?.international_cabin_preference)
            setInternationalCabinPreference(pref);
        // Setting Meal Preference
        for (let pref of mealPreferenceOptions)
          if (pref.value === response.data?.meal_preference) setMealPreference(pref);
        // Setting Seat Preference
        for (let pref of seatPreferenceOptions)
          if (pref.value === response.data?.seat_preference) setSeatPreference(pref);
        // Setting Cabin Position
        for (let pos of cabinPositionOptions)
          if (pos.value === response.data?.cabin_position) setCabinPosition(pos);
        // Setting Fare Preference
        for (let pref of farePreferenceOptions)
          if (pref.value === response.data?.fare_preference) setFarePreference(pref);
        // Setting Aliases
        let tempAliasArr = [];
        for (let value of response.data?.aliases) {
          if (value) tempAliasArr.push({ value });
          else tempAliasArr.push({ value: '' });
        }
        setAliases(tempAliasArr);
        // Vaccination Dates
        if (response.data?.vaccination_dates) {
          let tempVaccinationDateArr = [];
          for (let value of response.data?.vaccination_dates) {
            tempVaccinationDateArr.push(
              new DateObject({ date: value, format: 'YYYY-MM-DD' })
            );
          }
          setVaccinationDates(tempVaccinationDateArr);
        }
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Unable to fetch required data',
          4000
        );
        router.push('/dashboard/travellers');
      }
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
    if (euBiometrics)
      passportFormData.append('last_eu_biometrics', euBiometrics.format('YYYY-MM-DD'));
    if (passportIssueDate)
      passportFormData.append(
        'passport_issue_date',
        passportIssueDate.format('YYYY-MM-DD')
      );
    if (passportExpiryDate)
      passportFormData.append(
        'passport_expiry_date',
        passportExpiryDate.format('YYYY-MM-DD')
      );
    passportFormData.append('passport_issue_place', passportIssuePlace ?? '');
    passportFormData.append('mobile_phone', mobilePhone ?? '');
    passportFormData.append('email_address', email ?? '');
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
    // Country
    if (countryCodeID?.value)
      passportFormData.append('passport_country_code', countryCodeID.value);
    // Aliases
    if (aliases.length === 1 && aliases[0].value.trim().length === 0) {
      passportFormData.append('aliases[]', `${passportName}`);
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
                    <div className='col-lg-2 form-input-select'>
                      <label>Prefix</label>
                      <Select
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
                          placeholder=' '
                          type='number'
                        />
                        <label className='lh-1 text-15 text-light-1'>
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
                        options={passportGenderOptions}
                        value={passportGender}
                        onChange={(id) => setPassportGender(id)}
                      />
                    </div>
                    <div className='col-lg-3 form-input-select'>
                      <label>Passport Country</label>
                      <Select
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
                        isMulti
                        options={airlines}
                        value={domesticAirlinePreference}
                        onChange={setDomesticAirlinePreference}
                      />
                    </div>
                    <div className='form-input-select col-lg-3'>
                      <label>International Airline Preference</label>
                      <Select
                        isMulti
                        options={airlines}
                        value={internationalAirlinePreference}
                        onChange={setInternationalAirlinePreference}
                      />
                    </div>
                    <div className='col-lg-3 form-input-select'>
                      <label>Domestic Cabin Preference</label>
                      <Select
                        options={cabinPreferenceOptions}
                        value={domesticCabinPreference}
                        onChange={(id) => setDomesticCabinPreference(id)}
                      />
                    </div>
                    <div className='col-lg-3 form-input-select'>
                      <label>International Cabin Preference</label>
                      <Select
                        options={cabinPreferenceOptions}
                        value={internationalCabinPreference}
                        onChange={(id) => setInternationalCabinPreference(id)}
                      />
                    </div>
                    <div className='col-lg-3 form-input-select'>
                      <label>Meal Preference</label>
                      <Select
                        options={mealPreferenceOptions}
                        value={mealPreference}
                        onChange={(id) => setMealPreference(id)}
                      />
                    </div>
                    <div className='col-lg-3 form-input-select'>
                      <label>Seat Preference</label>
                      <Select
                        options={seatPreferenceOptions}
                        value={seatPreference}
                        onChange={(id) => setSeatPreference(id)}
                      />
                    </div>
                    <div className='col-lg-3 form-input-select'>
                      <label>Cabin Position</label>
                      <Select
                        options={cabinPositionOptions}
                        value={cabinPosition}
                        onChange={(id) => setCabinPosition(id)}
                      />
                    </div>
                    <div className='col-lg-3 form-input-select'>
                      <label>Fare Preference</label>
                      <Select
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
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Aadhaar Number
                        </label>
                      </div>
                    </div>
                    {/* Vaccination Dates */}
                    <div className='d-block ml-3 form-datepicker col-lg-4'>
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
                        format='DD MMMM YYYY'
                      />
                    </div>
                    {/* Pan Card Scan File Upload */}
                    <div className='col-lg-4'>
                      <label>PAN Card Scan File</label>
                      <NewFileUploads multiple={false} setUploads={setPanCardScanFile} />
                    </div>
                    {/* Aadhaar Card Scan File Upload */}
                    <div className='col-lg-4'>
                      <label>Aadhaar Card Scan Certificate File</label>
                      <NewFileUploads
                        multiple={false}
                        setUploads={setAadhaarCardScanFile}
                      />
                    </div>
                    {/* Vaccination Certificate File Upload */}
                    <div className='col-lg-4'>
                      <label>Vaccination Certificate File</label>
                      <NewFileUploads
                        fileTypes={['PDF']}
                        multiple={false}
                        setUploads={setVaccinationCertificateFile}
                      />
                    </div>
                    {/* Passport Scan Files Upload */}
                    <div className='col-lg-4'>
                      <label>Passport Scan Files</label>
                      <NewFileUploads multiple={true} setUploads={setPassportScanFiles} />
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

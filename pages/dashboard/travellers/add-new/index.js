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
import { FileUploadWithPreview } from 'file-upload-with-preview';
import 'file-upload-with-preview/dist/style.css';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { AiOutlinePlus } from 'react-icons/ai';
import { BsTrash3 } from 'react-icons/bs';

const AddNewTravellers = () => {
  const [prefix, setPrefix] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [passportName, setPassportName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportGender, setPassportGender] = useState(null);
  const [passportDOB, setPassportDOB] = useState(new DateObject());
  const [passportIssueDate, setPassportIssueDate] = useState(new DateObject());
  const [passportExpiryDate, setPassportExpiryDate] = useState(new DateObject());
  const [passportIssuePlace, setPassportIssuePlace] = useState('');
  const [mobilePhone, setMobilePhone] = useState('');
  const [email, setEmail] = useState('');
  const [domesticAirlinePreference, setDomesticAirlinePreference] = useState('');
  const [domesticCabinPreference, setDomesticCabinPreference] = useState(null);
  const [internationalAirlinePreference, setInternationalAirlinePreference] =
    useState('');
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
  const [vaccinationDates, setVaccinationDates] = useState([new DateObject()]);
  const [passportScanFiles, setPassportScanFiles] = useState(null);

  // Options
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
    { value: 'Vegetarian', label: 'Vegetarian' },
    { value: 'Jain Vegetarian', label: 'Jain Vegetarian' },
    { value: 'Non Vegetarian', label: 'Non Vegetarian' },
    { value: 'Lacto Ovo Meal', label: 'Lacto Ovo Meal' },
    { value: 'Sea Food Meal', label: 'Sea Food Meal' },
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
    setVaccinationCertificateFile(
      new FileUploadWithPreview('travellers-add-new-vaccination', {
        multiple: false,
        accept: '.pdf',
        text: {
          browse: 'Browse',
          chooseFile: '',
          label: 'Choose File to Upload',
        },
      })
    );
    setPanCardScanFile(
      new FileUploadWithPreview('travellers-add-new-pancard', {
        multiple: false,
        accept: '.jpg, .png, .pdf',
        text: {
          browse: 'Browse',
          chooseFile: '',
          label: 'Choose File to Upload',
        },
      })
    );
    setAadhaarCardScanFile(
      new FileUploadWithPreview('travellers-add-new-aadhaar', {
        multiple: false,
        accept: '.jpg, .png, .pdf',
        text: {
          browse: 'Browse',
          chooseFile: '',
          label: 'Choose File to Upload',
        },
      })
    );
    setPassportScanFiles(
      new FileUploadWithPreview('travellers-add-new-passport', {
        multiple: true,
        accept: '.jpg, .png, .jpeg, .pdf',
        text: {
          browse: 'Browse',
          chooseFile: '',
          label: 'Choose Files to Upload',
        },
      })
    );
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    let passportFormData = new FormData();
    passportFormData.append('prefix', prefix);
    passportFormData.append('first_name', firstName);
    passportFormData.append('middle_name', middleName);
    passportFormData.append('last_name', lastName);
    passportFormData.append('passport_name', passportName);
    passportFormData.append('passport_number', passportNumber);
    passportFormData.append('passport_gender', passportGender?.value || '');
    passportFormData.append('passport_dob', passportDOB.format('YYYY-MM-DD'));
    passportFormData.append(
      'passport_issue_date',
      passportIssueDate.format('YYYY-MM-DD')
    );
    passportFormData.append(
      'passport_expiry_date',
      passportExpiryDate.format('YYYY-MM-DD')
    );
    passportFormData.append('passport_issue_place', passportIssuePlace);
    passportFormData.append('mobile_phone', mobilePhone);
    passportFormData.append('email_address', email);
    passportFormData.append('domestic_airline_preference', domesticAirlinePreference);
    passportFormData.append(
      'domestic_cabin_preference',
      domesticCabinPreference?.value || ''
    );
    passportFormData.append(
      'international_airline_preference',
      internationalAirlinePreference
    );
    passportFormData.append(
      'international_cabin_preference',
      internationalCabinPreference?.value || ''
    );
    passportFormData.append('meal_preference', mealPreference?.value || '');
    passportFormData.append('seat_preference', seatPreference?.value || '');
    passportFormData.append('cabin_position', cabinPosition?.value || '');
    passportFormData.append('fare_preference', farePreference?.value || '');
    passportFormData.append('address', address);
    passportFormData.append('meal_notes', mealNotes);
    passportFormData.append('seat_notes', seatNotes);
    passportFormData.append('pan_number', panNumber);
    passportFormData.append('aadhaar_number', aadhaarNumber);
    passportFormData.append(
      'vaccination_certificate_file',
      vaccinationCertificateFile?.cachedFileArray[0] || ''
    );
    passportFormData.append(
      'pan_card_scan_file',
      panCardScanFile?.cachedFileArray[0] || ''
    );
    passportFormData.append(
      'aadhaar_card_scan_file',
      aadhaarCardScanFile?.cachedFileArray[0] || ''
    );
    // Aliases
    if (aliases.length === 1 && aliases[0].value.trim().length === 0) {
      passportFormData.append(
        'aliases[]',
        `${firstName} ${middleName.trim().length > 0 ? middleName + ' ' : ''}${lastName}`
      );
    } else {
      for (let alias of aliases) passportFormData.append('aliases[]', alias?.value);
    }
    for (let date of vaccinationDates)
      passportFormData.append('vaccination_dates[]', date.format('YYYY-MM-DD'));
    for (let file of passportScanFiles?.cachedFileArray)
      passportFormData.append('passport_scan_files[]', file);

    const response = await createItem('travellers', passportFormData);
    if (response?.success) {
      sendToast('success', 'Created Traveller Successfully.', 4000);
      router.push('/dashboard/travellers');
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
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setPrefix(e.target.value)}
                          value={prefix}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Prefix</label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setFirstName(e.target.value)}
                          value={firstName}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          First name<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
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
                    <div className='col-12'>
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
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setPassportName(e.target.value)}
                          value={passportName}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Passport Name<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
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
                    <div className='col-12'>
                      <label>Passport Gender</label>
                      <Select
                        options={passportGenderOptions}
                        value={passportGender}
                        placeholder='Search & Select Passport Gender'
                        onChange={(id) => setPassportGender(id)}
                      />
                    </div>
                    <div className='d-block ml-4'>
                      <label>Passport Date Of Birth</label>
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
                    <div className='d-block ml-4'>
                      <label>Passport Issue Date</label>
                      <DatePicker
                        style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                        inputClass='custom_input-picker'
                        containerClassName='custom_container-picker'
                        value={passportIssueDate}
                        onChange={setPassportIssueDate}
                        numberOfMonths={1}
                        offsetY={10}
                        format='DD MMMM YYYY'
                      />
                    </div>
                    <div className='d-block ml-4'>
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
                    <div className='col-12'>
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
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setMobilePhone(e.target.value)}
                          value={mobilePhone}
                          placeholder=' '
                          type='number'
                        />
                        <label className='lh-1 text-16 text-light-1'>Mobile Phone</label>
                      </div>
                    </div>
                    <div className='col-12'>
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
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setDomesticAirlinePreference(e.target.value)}
                          value={domesticAirlinePreference}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Domestic Airline Preference
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <label>Domestic Cabin Preference</label>
                      <Select
                        options={cabinPreferenceOptions}
                        value={domesticCabinPreference}
                        placeholder='Search & Select Domestic Cabin Preference'
                        onChange={(id) => setDomesticCabinPreference(id)}
                      />
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) =>
                            setInternationalAirlinePreference(e.target.value)
                          }
                          value={internationalAirlinePreference}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          International Airline Preference
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <label>International Cabin Preference</label>
                      <Select
                        options={cabinPreferenceOptions}
                        value={internationalCabinPreference}
                        placeholder='Search & Select International Cabin Preference'
                        onChange={(id) => setInternationalCabinPreference(id)}
                      />
                    </div>
                    <div className='col-12'>
                      <label>Meal Preference</label>
                      <Select
                        options={mealPreferenceOptions}
                        value={mealPreference}
                        placeholder='Search & Select Meal Preference'
                        onChange={(id) => setMealPreference(id)}
                      />
                    </div>
                    <div className='col-12'>
                      <label>Seat Preference</label>
                      <Select
                        options={seatPreferenceOptions}
                        value={seatPreference}
                        placeholder='Search & Select Seat Preference'
                        onChange={(id) => setSeatPreference(id)}
                      />
                    </div>
                    <div className='col-12'>
                      <label>Cabin Position</label>
                      <Select
                        options={cabinPositionOptions}
                        value={cabinPosition}
                        placeholder='Search & Select Cabin Position'
                        onChange={(id) => setCabinPosition(id)}
                      />
                    </div>
                    <div className='col-12'>
                      <label>Fare Preference</label>
                      <Select
                        options={farePreferenceOptions}
                        value={farePreference}
                        placeholder='Search & Select Fare Preference'
                        onChange={(id) => setFarePreference(id)}
                      />
                    </div>
                    <div className='col-12'>
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
                      <div className='form-input'>
                        <input
                          onChange={(e) => setMealNotes(e.target.value)}
                          value={mealNotes}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Meal Notes</label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setSeatNotes(e.target.value)}
                          value={seatNotes}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>Seat Notes</label>
                      </div>
                    </div>
                    <div className='col-12'>
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
                    <div className='col-12'>
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
                    {/* Vaccination Certificate File Upload */}
                    <div className='col-lg-12'>
                      <label>Vaccination Certificate File</label>
                      <div
                        className='custom-file-container col-lg-6'
                        data-upload-id='travellers-add-new-vaccination'
                      ></div>
                    </div>
                    {/* Pan Card Scan File Upload */}
                    <div className='col-lg-12'>
                      <label>PAN Card Scan File</label>
                      <div
                        className='custom-file-container col-lg-6'
                        data-upload-id='travellers-add-new-pancard'
                      ></div>
                    </div>
                    {/* Aadhaar Card Scan File Upload */}
                    <div className='col-lg-12'>
                      <label>Aadhaar Card Scan Certificate File</label>
                      <div
                        className='custom-file-container col-lg-6'
                        data-upload-id='travellers-add-new-aadhaar'
                      ></div>
                    </div>
                    {/* Aliases */}
                    <div>
                      <label>Aliases</label>
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
                    {/* Vaccination Dates */}
                    <div className='d-block ml-4'>
                      <label>Vaccination Dates</label>
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
                    {/* Passport Scan Files Upload */}
                    <div className='col-lg-6'>
                      <label>Passport Scan Files</label>
                      <div
                        className='custom-file-container'
                        data-upload-id='travellers-add-new-passport'
                      ></div>
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

import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import ReactSwitch from 'react-switch';
import { createItem, getList } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { sendToast } from '../../../../utils/toastify';

const groupForOptions = [
  { value: 'traveller', label: 'Traveller' },
  { value: 'organization', label: 'Organization' },
];

const AddNewWhatsAppGroup = () => {
  const [name, setName] = useState('');
  const [groupFor, setGroupFor] = useState(groupForOptions[0]);
  const [groupableIds, setGroupableIds] = useState([]);
  const [travellerOptions, setTravellerOptions] = useState([]);
  const [organizationOptions, setOrganizationOptions] = useState([]);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [phoneInput, setPhoneInput] = useState('');
  const [isPersonal, setIsPersonal] = useState(false);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    getOptions();
  }, []);

  const sanitizeNumbers = (numbers) =>
    Array.from(
      new Set(
        numbers
          .map((ph) => `${ph}`.trim())
          .filter((ph) => ph.length > 0)
      )
    );

  const syncPhoneNumbers = (numbers) => {
    const cleaned = sanitizeNumbers(numbers);
    setPhoneNumbers(cleaned);
    setPhoneInput(cleaned.join(', '));
  };

  const handlePhoneInputChange = (value) => {
    setPhoneInput(value);
    const parsed = value.split(',').map((ph) => ph.trim());
    setPhoneNumbers(sanitizeNumbers(parsed));
  };

  const handleRemovePhoneNumber = (phone) => {
    syncPhoneNumbers(phoneNumbers.filter((ph) => ph !== phone));
  };

  const getOptions = async () => {
    const [travellers, organizations, defaultNumbers] = await Promise.all([
      getList('travellers'),
      getList('organizations', { is_client: 1 }),
      getList('whats-app-groups', { default_numbers: 1 }),
    ]);
    if (travellers?.success && organizations?.success && defaultNumbers.success) {
      setTravellerOptions(
        travellers.data.map((traveller) => ({
          value: traveller.id,
          label:
            traveller?.passport_name ||
            `${traveller?.first_name ?? ''} ${traveller?.last_name ?? ''}`.trim() ||
            `Traveller #${traveller.id}`,
          phones: [traveller.mobile_phone, traveller.ea_phone_number].filter(x => !!x),
        }))
      );
      setOrganizationOptions(
        organizations.data.map((org) => ({
          value: org.id,
          label: org.name || `Organization #${org.id}`,
          phones: [org.contact_phone].filter(x => !!x)
        }))
      );
      syncPhoneNumbers(defaultNumbers.data || []);
    } else {
      sendToast('error', 'Unable to fetch required data', 4000);
      router.push('/dashboard/whats-app-groups');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      sendToast('error', 'Name is required', 4000);
      return;
    }
    if (trimmedName.length > 128) {
      sendToast('error', 'Name cannot exceed 128 characters', 4000);
      return;
    }
    if (!groupFor?.value) {
      sendToast('error', 'Please select a groupable type', 4000);
      return;
    }
    if (!groupableIds?.length) {
      sendToast('error', 'Please select at least one traveller/organization', 4000);
      return;
    }
    const cleanedNumbers = phoneNumbers;
    if (!cleanedNumbers.length) {
      sendToast('error', 'Please provide at least one phone number', 4000);
      return;
    }
    const invalid = cleanedNumbers.find((ph) => !/^\d{11,12}$/.test(ph));
    if (invalid) {
      sendToast('error', 'Phone numbers must be 11-12 digit numbers', 4000);
      return;
    }
    const response = await createItem('whats-app-groups', {
      name: trimmedName,
      group_for: groupFor.value,
      groupable_id: groupableIds.map(g => g.value),
      phone_numbers: cleanedNumbers,
      is_personal: isPersonal,
    });
    if (response?.success) {
      sendToast('success', 'Created WhatsApp group successfully.', 4000);
      router.push('/dashboard/whats-app-groups');
    } else {
      sendToast(
        'error',
        response?.data?.message ||
        response?.data?.error ||
        'Failed to create WhatsApp group.',
        4000
      );
    }
  };

  const currentGroupableOptions = useMemo(
    () =>
      groupFor?.value === 'traveller' ? travellerOptions : organizationOptions,
    [groupFor, organizationOptions, travellerOptions]
  );

  const handleGroupableIdChange = (options) => {
    const selectedOptions = options || [];

    // Get currently selected values to identify removed ones
    const currentValues = groupableIds.map(g => g.value);
    const newValues = selectedOptions.map(g => g.value);

    // Identify removed options
    const removedValues = currentValues.filter(v => !newValues.includes(v));

    // Get numbers to remove (from removed options)
    const optionsSource = (groupFor?.value === 'traveller') ? travellerOptions : organizationOptions;
    const removedNumbers = optionsSource
      .filter(opt => removedValues.includes(opt.value))
      .flatMap(opt => opt.phones || []);

    // Update phone numbers: remove removedNumbers, add newNumbers, keep existing manual numbers
    // Ideally we want to keep numbers that were manually added, but sync numbers from selections.
    // A simple approach: 
    // 1. Start with current phoneNumbers
    // 2. Remove numbers associated with REMOVED options
    // 3. Add numbers associated with NEWLY ADDED options (if not already present)

    // Better approach matching previous logic but for multi-select:
    // We can't easily distinguish manual vs auto numbers without more state.
    // Let's stick to the previous logic's spirit:
    // If an option is added, add its numbers.
    // If an option is removed, remove its numbers.

    let updatedNumbers = [...phoneNumbers];

    // Remove numbers from removed options
    if (removedNumbers.length) {
      updatedNumbers = updatedNumbers.filter(num => !removedNumbers.includes(num));
    }

    // Add numbers from new options (only the ones that are NOT already in the selected list - wait, 
    // if we just add all numbers from current selection, we might duplicate or re-add removed ones if we are not careful.
    // But `handleGroupableIdChange` gives us the NEW state of selections.

    // Let's refine:
    // Find added options
    const addedValues = newValues.filter(v => !currentValues.includes(v));
    const addedNumbers = optionsSource
      .filter(opt => addedValues.includes(opt.value))
      .flatMap(opt => opt.phones || []);

    if (addedNumbers.length) {
      updatedNumbers = [...updatedNumbers, ...addedNumbers];
    }

    syncPhoneNumbers(updatedNumbers);
    setGroupableIds(selectedOptions);
  }

  return (
    <>
      <Seo pageTitle='Add New WhatsApp Group' />
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
                  <h1 className='text-30 lh-14 fw-600'>Add New WhatsApp Group</h1>
                  <div className='text-15 text-light-1'>
                    Create a new WhatsApp group for travellers or organizations.
                  </div>
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
                          onChange={(e) => setName(e.target.value)}
                          value={name}
                          placeholder=' '
                          type='text'
                          required
                          maxLength={128}
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Name<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='form-input-select col-12 col-lg-6'>
                      <label>
                        Select Group For<span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={groupForOptions}
                        value={groupFor}
                        placeholder='Search & Select Group For (required)'
                        onChange={(value) => {
                          setGroupFor(value);
                          setGroupableIds([]);
                        }}
                      />
                    </div>
                    <div className='form-input-select col-12 col-lg-6'>
                      <label>
                        Select {groupFor?.value || 'Group For first'}<span className='text-danger'>*</span>
                      </label>
                      <Select
                        isMulti
                        options={currentGroupableOptions}
                        value={groupableIds}
                        placeholder={
                          groupFor?.value === 'traveller'
                            ? 'Search & Select Travellers (required)'
                            : 'Search & Select Organizations (required)'
                        }
                        onChange={handleGroupableIdChange}
                      />
                    </div>
                    <div className='col-12'>
                      <label className='lh-1 text-16 text-light-1 mb-2 d-block'>
                        Phone Numbers<span className='text-danger'>*</span>
                      </label>
                      <textarea
                        className='form-control'
                        rows={3}
                        placeholder='Enter 12 digit phone numbers separated by commas'
                        value={phoneInput}
                        onChange={(e) => handlePhoneInputChange(e.target.value)}
                      />
                      <div className='d-flex flex-wrap gap-2 mt-2'>
                        {phoneNumbers.map((phone) => (
                          <span
                            key={phone}
                            className='d-inline-flex align-items-center gap-2 px-3 py-2 rounded-4 bg-light'
                          >
                            {phone}
                            <button
                              type='button'
                              className='btn btn-sm btn-light border-0 p-0 m-0 lh-1'
                              onClick={() => handleRemovePhoneNumber(phone)}
                              aria-label={`Remove ${phone}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className='d-flex items-center gap-3 mb-3'>
                      <ReactSwitch
                        onChange={() => setIsPersonal((prev) => !prev)}
                        checked={isPersonal}
                      />
                      <label>Is Personal</label>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add WhatsApp Group
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

export default AddNewWhatsAppGroup;

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { getItem, updateItem, getList } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { sendToast } from '../../../../utils/toastify';
import ReactSwitch from 'react-switch';

const UpdateWhatsAppGroup = () => {
  const [name, setName] = useState('');
  const [groupFor, setGroupFor] = useState(null);
  const [groupableIds, setGroupableIds] = useState([]);
  const [options, setOptions] = useState([]);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [phoneInput, setPhoneInput] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [isPersonal, setIsPersonal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      getData();
    }
  }, [router.isReady]);

  const getData = async () => {
    if (!router.query.edit) return;
    const groupRes = await getItem('whats-app-groups', router.query.edit);
    if (groupRes?.success) {
      setName(groupRes.data?.name ?? '');
      setInviteLink(groupRes.data?.invite_link || '');
      setIsPersonal(groupRes.data?.is_personal || false);
      setGroupFor(groupRes.data?.group_for);

      const numbers = Array.isArray(groupRes.data?.phone_numbers)
        ? groupRes.data.phone_numbers.map((num) => `${num}`)
        : [];
      syncPhoneNumbers(numbers);

      // Fetch options based on group_for
      if (groupRes.data?.group_for) {
        getOptions(groupRes.data.group_for, groupRes.data.is_personal);
      }
    } else {
      sendToast(
        'error',
        groupRes?.data?.message ||
        groupRes?.data?.error ||
        'Failed to fetch WhatsApp group data.',
        4000
      );
      router.push('/dashboard/whats-app-groups');
    }
  };

  const getOptions = async (groupForValue, is_personal) => {
    let res;
    if (groupForValue === 'traveller') {
      res = await getList('travellers');
    } else if (groupForValue === 'organization') {
      res = await getList('organizations', { is_client: 1 });
    }

    if (res?.success) {
      const formattedOptions = res.data.map((item) => ({
        value: item.id,
        label: groupForValue === 'traveller'
          ? (item?.passport_name || `${item?.first_name ?? ''} ${item?.last_name ?? ''}`.trim() || `Traveller #${item.id}`)
          : (item.name || `Organization #${item.id}`),
        phones: groupForValue === 'traveller'
          ? [item.mobile_phone, item.ea_phone_number].filter(x => !!x)
          : [item.contact_phone].filter(x => !!x),
        whats_app_group_id: is_personal ? item.personal_whats_app_group_id : item.whats_app_group_id, // Ensure this field is available
      }));

      setOptions(formattedOptions);

      // Pre-select based on whats_app_group_id
      const currentGroupId = parseInt(router.query.edit);
      const selected = formattedOptions.filter(opt => opt.whats_app_group_id == currentGroupId);
      setGroupableIds(selected);
    } else {
      sendToast('error', 'Unable to fetch options', 4000);
    }
  };

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

  const handleGroupableIdChange = (selectedOptions) => {
    const selected = selectedOptions || [];

    const currentValues = groupableIds.map(g => g.value);
    const newValues = selected.map(g => g.value);

    const removedValues = currentValues.filter(v => !newValues.includes(v));
    const removedNumbers = options
      .filter(opt => removedValues.includes(opt.value))
      .flatMap(opt => opt.phones || []);

    let updatedNumbers = [...phoneNumbers];

    if (removedNumbers.length) {
      updatedNumbers = updatedNumbers.filter(num => !removedNumbers.includes(num));
    }

    const addedValues = newValues.filter(v => !currentValues.includes(v));
    const addedNumbers = options
      .filter(opt => addedValues.includes(opt.value))
      .flatMap(opt => opt.phones || []);

    if (addedNumbers.length) {
      updatedNumbers = [...updatedNumbers, ...addedNumbers];
    }

    syncPhoneNumbers(updatedNumbers);
    setGroupableIds(selected);
  }

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
    // if (!groupFor) {
    //   sendToast('error', 'Group type is missing', 4000);
    //   return;
    // }
    if (!groupableIds?.length) {
      sendToast('error', 'Please select at least one member', 4000);
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
    const response = await updateItem('whats-app-groups', router.query.edit, {
      name: trimmedName,
      // group_for: groupFor,
      groupable_id: groupableIds.map(g => g.value),
      phone_numbers: cleanedNumbers,
      is_personal: isPersonal,
    });
    if (response?.success) {
      sendToast('success', 'Updated WhatsApp group successfully.', 4000);
      router.push('/dashboard/whats-app-groups');
    } else {
      sendToast(
        'error',
        response?.data?.message ||
        response?.data?.error ||
        'Failed to update WhatsApp group.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Update WhatsApp Group' />
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
                  <h1 className='text-30 lh-14 fw-600'>Update WhatsApp Group</h1>
                  <div className='text-15 text-light-1'>
                    Update an existing WhatsApp group.
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
                        Select {groupFor === 'traveller' ? 'Travellers' : 'Organizations'}<span className='text-danger'>*</span>
                      </label>
                      <Select
                        isMulti
                        options={options}
                        value={groupableIds}
                        placeholder={
                          groupFor === 'traveller'
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
                    <div className='col-12 col-lg-6'>
                      <div className='form-input'>
                        <input value={inviteLink} placeholder=' ' type='text' readOnly />
                        <label className='lh-1 text-16 text-light-1'>
                          Invite Link (readonly)
                        </label>
                      </div>
                    </div>
                    {groupFor === 'traveller' && <div className='d-flex items-center gap-3 mb-3'>
                      <ReactSwitch
                        onChange={() => setIsPersonal((prev) => !prev)}
                        checked={isPersonal}
                      />
                      <label>Is Personal</label>
                    </div>}
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Update WhatsApp Group
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

export default UpdateWhatsAppGroup;

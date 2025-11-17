import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getItem, updateItem } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { sendToast } from '../../../../utils/toastify';

const UpdateWhatsAppGroup = () => {
  const [name, setName] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [phoneInput, setPhoneInput] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) getData();
  }, [router.isReady]);

  const getData = async () => {
    if (!router.query.edit) return;
    const groupRes = await getItem('whats-app-groups', router.query.edit);
    if (groupRes?.success) {
      setName(groupRes.data?.name ?? '');
      setInviteLink(groupRes.data?.invite_link || '');
      const numbers = Array.isArray(groupRes.data?.phone_numbers)
        ? groupRes.data.phone_numbers.map((num) => `${num}`)
        : [];
      syncPhoneNumbers(numbers);
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
    const cleanedNumbers = phoneNumbers;
    if (!cleanedNumbers.length) {
      sendToast('error', 'Please provide at least one phone number', 4000);
      return;
    }
    const invalid = cleanedNumbers.find((ph) => !/^\d{12}$/.test(ph));
    if (invalid) {
      sendToast('error', 'Phone numbers must be 12 digit numbers', 4000);
      return;
    }
    const response = await updateItem('whats-app-groups', router.query.edit, {
      name: trimmedName,
      phone_numbers: cleanedNumbers,
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

import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { createItem } from '../../api/xplorzApi';
import { TiTickOutline } from 'react-icons/ti';
import { sendToast } from '../../utils/toastify';

const ContactForm = () => {
  const handleSubmit = async (event) => {
    event.preventDefault();
    // handle form submission logic here
    const res = await createItem('auth/sign-up', {
      organization_name: companyName,
      address: addr,
      gstn,
      contact_name: name,
      contact_email: email,
      contact_phone: phone,
    });
    if (res?.success) {
      console.log('success');
      setResSuccess(true);
    } else
      sendToast(
        'error',
        res?.data?.message ||
          res?.data?.error ||
          'Error with Sign Up submission, please try again later.',
        4000
      );
    setSignupClicked(false);
  };
  const [resSuccess, setResSuccess] = useState(false);
  const [siteKeyCorrect, setSiteKeyCorrect] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addr, setAddr] = useState('');
  const [gstn, setGstn] = useState('');
  const [signupClicked, setSignupClicked] = useState(false);

  return (
    <div className='bg-light border-light rounded-4 px-30 py-30'>
      {resSuccess && (
        <div className='text-center'>
          <h4 className='text-blue-1 d-flex items-center gap-2 justify-center'>
            <TiTickOutline className='text-40 mb-1' /> <span>Signup Successful</span>
          </h4>
          <p className='text-secondary text-18'>
            Thanks {name}, we've received your inquiry for signing up for our corporate
            account for {companyName}. Our representative will get in touch shortly.
          </p>
        </div>
      )}
      {!resSuccess && (
        <>
          <h3 className='text-center mb-20'>Sign-Up</h3>
          <form className='row y-gap-20' onSubmit={handleSubmit}>
            <div className='col-lg-4 col-md-6'>
              <div className='form-input'>
                <input
                  type='text'
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  placeholder=' '
                />
                <label className='lh-1 text-16 text-light-1'>
                  Name of the Company<span className='text-danger'>*</span>
                </label>
              </div>
            </div>
            <div className='col-lg-4 col-md-6'>
              <div className='form-input'>
                <input
                  type='text'
                  value={gstn}
                  pattern='^\d{2}[A-Za-z]{5}\d{4}[A-Za-z]\wZ\w$'
                  onChange={(e) => setGstn(e.target.value)}
                  placeholder=' '
                />
                <label className='lh-1 text-16 text-light-1'>GSTN</label>
              </div>
            </div>
            <div className='col-lg-4 col-md-6'>
              <div className='form-input'>
                <input
                  type='text'
                  value={addr}
                  onChange={(e) => setAddr(e.target.value)}
                  required
                  placeholder=' '
                />
                <label className='lh-1 text-16 text-light-1'>
                  Address<span className='text-danger'>*</span>
                </label>
              </div>
            </div>
            <div className='col-lg-4 col-md-6'>
              <div className='form-input'>
                <input
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder=' '
                />
                <label className='lh-1 text-16 text-light-1'>
                  Contact Person's Name<span className='text-danger'>*</span>
                </label>
              </div>
            </div>
            <div className='col-lg-4 col-md-6'>
              <div className='form-input'>
                <input
                  type='number'
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder=' '
                />
                <label className='lh-1 text-16 text-light-1'>
                  Phone<span className='text-danger'>*</span>
                </label>
              </div>
            </div>
            <div className='col-lg-4 col-md-6'>
              <div className='form-input'>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder=' '
                />
                <label className='lh-1 text-16 text-light-1'>
                  Email<span className='text-danger'>*</span>
                </label>
              </div>
            </div>
            <div className='col-12 row justify-between lg:pr-0 items-center'>
              <div className='col-lg-4'>
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_GOOGLE_SITE_KEY}
                  onChange={(value) => {
                    if (value) setSiteKeyCorrect(true);
                    else setSiteKeyCorrect(false);
                  }}
                />
              </div>
              <div className='col-lg-3 lg:pr-0'>
                <button
                  disabled={!siteKeyCorrect || signupClicked}
                  type='submit'
                  className='button col-lg-10 col-12 px-24 h-50 -dark-1 bg-blue-1 text-white'
                >
                  Sign-Up
                  <div className='icon-arrow-top-right ml-15'></div>
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ContactForm;

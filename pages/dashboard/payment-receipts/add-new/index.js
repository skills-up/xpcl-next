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
import DatePicker, { DateObject } from 'react-multi-date-picker';

const AddNewPaymentReceipt = () => {
  const [type, setType] = useState(null);
  const [organizationID, setOrganizationID] = useState(null);
  const [drAccountID, setDrAccountID] = useState(null);
  const [crAccountID, setCrAccountID] = useState(null);
  const [date, setDate] = useState(new DateObject());
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [bankCashAccounts, setBankCashAccounts] = useState([]);
  const [tdsAccounts, setTDSAccounts] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [itc, setItc] = useState(false);
  const [itcObj, setItcObj] = useState({
    name: '',
    gstn: '',
    igst: '',
    cgst: '',
    sgst: '',
  });
  const [tds, setTds] = useState(false);
  const [tdsObj, setTdsObj] = useState({
    name: '',
    pan: '',
    account_id: null,
    amount: '',
  });

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) getData();
  }, [router.isReady]);

  useEffect(() => {
    console.log('test');
    if (itcObj?.gstn) {
      if (itcObj.gstn.slice(0, 2) === '27') {
        setItcObj((prev) => ({ ...prev, igst: '' }));
      } else {
        setItcObj((prev) => ({ ...prev, ...{ cgst: '', sgst: '' } }));
      }
    }
  }, [itcObj.gstn]);

  const getData = async () => {
    setType({ value: router.query.type });
    const organizations = await getList('organizations');
    const accounts = await getList('accounts');
    const bankCashAccounts = await getList('accounts', { is_bank_cash: 1 });
    const tdsAccounts = await getList('accounts', { category: 'TDS Deductions' });
    if (
      accounts?.success &&
      organizations?.success &&
      tdsAccounts?.success &&
      bankCashAccounts?.success
    ) {
      setAccounts(
        accounts.data.map((element) => ({ value: element.id, label: element.name }))
      );
      setBankCashAccounts(
        bankCashAccounts.data.map((element) => ({
          value: element.id,
          label: element.name,
        }))
      );
      setTDSAccounts(
        tdsAccounts.data.map((element) => ({ value: element.id, label: element.name }))
      );
      setOrganizations(
        organizations.data.map((element) => ({
          value: element.id,
          label: element.name,
        }))
      );
    } else {
      sendToast('error', 'Unable to fetch required data', 4000);
      router.push('/dashboard/payment-receipts');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!crAccountID?.value) {
      sendToast('error', 'You must select a Credit Account', 4000);
      return;
    }
    if (!drAccountID?.value) {
      sendToast('error', 'You must select a Debit Account', 4000);
      return;
    }

    const tempTDSObj = tdsObj;
    if (tempTDSObj['account_id']?.value)
      tempTDSObj['account_id'] = tempTDSObj['account_id']?.value;

    const response = await createItem('payment-receipts', {
      type: type.value,
      // organization_id: organizationID?.value,
      dr_account_id: drAccountID.value,
      cr_account_id: crAccountID.value,
      date: date.format('YYYY-MM-DD'),
      amount,
      narration,
      itc:
        type.value === 'Payment'
          ? itc
            ? {
                ...itcObj,
                ...{
                  igst: itcObj?.igst || 0,
                  cgst: itcObj?.cgst || 0,
                  sgst: itcObj?.sgst || 0,
                },
              }
            : null
          : null,
      tds: type.value === 'Payment' ? (tds ? tempTDSObj : null) : null,
    });
    if (response?.success) {
      sendToast('success', 'Created ' + router.query.type + ' Successfully.', 4000);
      router.push('/dashboard/payment-receipts');
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Failed to Create ' + router.query.type,
        4000
      );
    }
  };

  // Auto Assigning Credit Acc
  useEffect(() => {
    if (organizationID && accounts.length > 0) {
      for (let acc of accounts) {
        if (acc.label === organizationID.label) {
          if (type?.value === 'Payment') setCrAccountID(acc);
          else if (type?.value === 'Receipt') setDrAccountID(acc);
        }
      }
    }
  }, [organizationID]);

  return (
    <>
      <Seo pageTitle={'Add New ' + (router.query?.type || '')} />
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
                  <h1 className='text-30 lh-14 fw-600'>Add New {router.query?.type}</h1>
                  <div className='text-15 text-light-1'>
                    Create a new {router.query?.type?.toLowerCase()}.
                  </div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    {/* {type?.value !== 'Voucher' && (
                      <div className='form-input-select'>
                        <label>Organization</label>
                        <Select
                          options={organizations}
                          value={organizationID}
                          placeholder='Search & Select Organization'
                          onChange={(id) => setOrganizationID(id)}
                        />
                      </div>
                    )} */}
                    <div className='d-block ml-3 form-datepicker'>
                      <label>
                        Date<span className='text-danger'>*</span>
                      </label>
                      <DatePicker
                        style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                        inputClass='custom_input-picker'
                        containerClassName='custom_container-picker'
                        value={date}
                        onChange={setDate}
                        numberOfMonths={1}
                        offsetY={10}
                        format='DD MMMM YYYY'
                      />
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setAmount(e.target.value)}
                          value={amount}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Amount<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='form-input-select'>
                      <label>
                        {type?.value === 'Payment'
                          ? 'Paid To'
                          : type?.value === 'Receipt'
                          ? 'Received In'
                          : 'Debit Account'}
                        <span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={
                          type?.value === 'Receipt'
                            ? bankCashAccounts.filter(
                                (acc) => acc?.value !== crAccountID?.value
                              )
                            : accounts.filter((acc) => acc?.value !== crAccountID?.value)
                        }
                        value={drAccountID}
                        placeholder='Search & Select Debit Account (required)'
                        onChange={(id) => setDrAccountID(id)}
                      />
                    </div>
                    <div className='form-input-select'>
                      <label>
                        {type?.value === 'Payment'
                          ? 'Paid From'
                          : type?.value === 'Receipt'
                          ? 'Received From'
                          : 'Credit Account'}
                        <span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={
                          type?.value === 'Payment'
                            ? bankCashAccounts.filter(
                                (acc) => acc?.value !== crAccountID?.value
                              )
                            : accounts.filter((acc) => acc?.value !== crAccountID?.value)
                        }
                        value={crAccountID}
                        placeholder='Search & Select Credit Account (required)'
                        onChange={(id) => setCrAccountID(id)}
                      />
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setNarration(e.target.value)}
                          value={narration}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Narration<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    {/* ITC */}
                    {type?.value === 'Payment' && (
                      <div className='d-flex items-center gap-3'>
                        <ReactSwitch
                          onChange={() => setItc((prev) => !prev)}
                          checked={itc}
                        />
                        <label>ITC</label>
                      </div>
                    )}
                    {itc && type?.value === 'Payment' && (
                      <div className='row pr-0'>
                        <div className='col-3 pr-0'>
                          <div className='form-input'>
                            <input
                              onChange={(e) =>
                                setItcObj((prev) => ({ ...prev, name: e.target.value }))
                              }
                              value={itcObj.name}
                              placeholder=' '
                              type='text'
                            />
                            <label className='lh-1 text-16 text-light-1'>
                              Name<span className='text-danger'>*</span>
                            </label>
                          </div>
                        </div>
                        <div className='col-3 pr-0'>
                          <div className='form-input'>
                            <input
                              onChange={(e) =>
                                setItcObj((prev) => ({ ...prev, gstn: e.target.value }))
                              }
                              value={itcObj.gstn}
                              placeholder=' '
                              type='text'
                            />
                            <label className='lh-1 text-16 text-light-1'>
                              GSTN<span className='text-danger'>*</span>
                            </label>
                          </div>
                        </div>
                        <div className='col-2 pr-0'>
                          <div className='form-input'>
                            <input
                              onChange={(e) =>
                                setItcObj((prev) => ({ ...prev, cgst: e.target.value }))
                              }
                              value={itcObj.cgst}
                              placeholder=' '
                              type='number'
                              onWheel={(e) => e.target.blur()}
                              disabled={
                                itcObj.gstn ? itcObj.gstn.slice(0, 2) !== '27' : false
                              }
                            />
                            <label className='lh-1 text-16 text-light-1'>
                              CGST
                              {itcObj.gstn && itcObj.gstn.slice(0, 2) === '27' && (
                                <span className='text-danger'>*</span>
                              )}
                            </label>
                          </div>
                        </div>
                        <div className='col-2 pr-0'>
                          <div className='form-input'>
                            <input
                              onChange={(e) =>
                                setItcObj((prev) => ({ ...prev, sgst: e.target.value }))
                              }
                              value={itcObj.sgst}
                              placeholder=' '
                              type='number'
                              onWheel={(e) => e.target.blur()}
                              disabled={
                                itcObj.gstn ? itcObj.gstn.slice(0, 2) !== '27' : false
                              }
                            />
                            <label className='lh-1 text-16 text-light-1'>
                              SGST
                              {itcObj.gstn && itcObj.gstn.slice(0, 2) === '27' && (
                                <span className='text-danger'>*</span>
                              )}
                            </label>
                          </div>
                        </div>
                        <div className='col-2 pr-0'>
                          <div className='form-input'>
                            <input
                              onChange={(e) =>
                                setItcObj((prev) => ({ ...prev, igst: e.target.value }))
                              }
                              value={itcObj.igst}
                              placeholder=' '
                              type='number'
                              onWheel={(e) => e.target.blur()}
                              disabled={
                                itcObj.gstn ? itcObj.gstn.slice(0, 2) === '27' : false
                              }
                            />
                            <label className='lh-1 text-16 text-light-1'>
                              IGST
                              {itcObj.gstn && itcObj.gstn.slice(0, 2) !== '27' && (
                                <span className='text-danger'>*</span>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* TDS */}
                    {type?.value === 'Payment' && (
                      <div className='d-flex items-center gap-3'>
                        <ReactSwitch
                          onChange={() => setTds((prev) => !prev)}
                          checked={tds}
                        />
                        <label>TDS</label>
                      </div>
                    )}
                    {tds && type?.value === 'Payment' && (
                      <div className='row pr-0 items-center'>
                        <div className='col-3 pr-0'>
                          <div className='form-input'>
                            <input
                              onChange={(e) =>
                                setTdsObj((prev) => ({ ...prev, name: e.target.value }))
                              }
                              value={tdsObj.name}
                              placeholder=' '
                              type='text'
                            />
                            <label className='lh-1 text-16 text-light-1'>
                              Name<span className='text-danger'>*</span>
                            </label>
                          </div>
                        </div>
                        <div className='col-3 pr-0'>
                          <div className='form-input'>
                            <input
                              onChange={(e) =>
                                setTdsObj((prev) => ({ ...prev, pan: e.target.value }))
                              }
                              value={tdsObj.pan}
                              placeholder=' '
                              type='text'
                            />
                            <label className='lh-1 text-16 text-light-1'>
                              PAN<span className='text-danger'>*</span>
                            </label>
                          </div>
                        </div>
                        <div className='col-4 pr-0 form-input-select'>
                          <label>
                            Account<span className='text-danger'>*</span>
                          </label>
                          <Select
                            options={tdsAccounts}
                            value={tdsObj.account_id}
                            onChange={(id) =>
                              setTdsObj((prev) => ({ ...prev, account_id: id }))
                            }
                          />
                        </div>
                        <div className='col-2 pr-0'>
                          <div className='form-input'>
                            <input
                              onChange={(e) =>
                                setTdsObj((prev) => ({ ...prev, amount: e.target.value }))
                              }
                              value={tdsObj.amount}
                              placeholder=' '
                              type='number'
                              onWheel={(e) => e.target.blur()}
                            />
                            <label className='lh-1 text-16 text-light-1'>
                              Amount<span className='text-danger'>*</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add {router.query?.type}
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

export default AddNewPaymentReceipt;

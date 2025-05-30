import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import Select from 'react-select';
import ReactSwitch from 'react-switch';
import { createItem, getItem, getList } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import NewFileUploads from '../../../../components/new-file-uploads';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { capitalize } from '../../../../utils/text-utils';
import { sendToast } from '../../../../utils/toastify';

const AddNewPaymentReceipt = () => {
  const [type, setType] = useState(null);
  // const [organizationID, setOrganizationID] = useState(null);
  const [drAccountID, setDrAccountID] = useState(null);
  const [crAccountID, setCrAccountID] = useState(null);
  const [date, setDate] = useState(new DateObject());
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [tdsAccounts, setTDSAccounts] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [bankCashAccounts, setBankCashAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itc, setItc] = useState(false);
  const [itcObj, setItcObj] = useState({
    org_id: null,
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

  const [typeOptions, setTypeOptions] = useState([
    { label: 'Payment', value: 'Payment' },
    { label: 'Receipt', value: 'Receipt' },
    { label: 'Voucher', value: 'Voucher' },
  ]);
  const [disabled, setDisabled] = useState(false);

  let prevDate = null;
  const router = useRouter();

  useEffect(() => {
    getData();
  }, [router.isReady]);

  useEffect(() => {
    if (selectedOrganization) {
      if (selectedOrganization.gstn?.slice(0, 2) === '27') {
        setItcObj((prev) => ({ ...prev, org_id: selectedOrganization.value, igst: '' }));
      } else {
        setItcObj((prev) => ({
          ...prev,
          org_id: selectedOrganization.value,
          cgst: '',
          sgst: '',
        }));
      }
    }
  }, [selectedOrganization]);

  const getData = async () => {
    if (router.query.clone) {
      const response = await getItem('payment-receipts', router.query.clone);
      if (response?.success) {
        prevDate = response.data.date;
        setNarration(response.data.narration);
        setAmount(response.data.amount);
        setDate(new DateObject({ date: prevDate, format: 'YYYY-MM-DD' }));

        const miscOrgs = await getList('organizations', { is_misc: 1 });
        const accounts = await getList('accounts', { date: prevDate });
        const tdsAccounts = await getList('accounts', { category: 'TDS Deductions' });
        const bankCashAccounts = await getList('accounts', { is_bank_cash: 1 });
        if (
          accounts?.success &&
          miscOrgs?.success &&
          tdsAccounts?.success &&
          bankCashAccounts?.success
        ) {
          const orgData = miscOrgs.data.map((element) => ({
            value: element.id,
            label: `${element.name}${element.gstn ? ` (${element.gstn})` : ''}`,
            gstn: element.gstn,
          }));
          setAccounts(
            accounts.data.map((element) => ({
              value: element.id,
              label: `${element.name}${element.org_code ? ` (${element.org_code})` : ''}`,
            }))
          );
          setOrganizations(orgData);
          setBankCashAccounts(
            bankCashAccounts.data.map((element) => ({
              value: element.id,
              label: element.name,
            }))
          );
          setTDSAccounts(
            tdsAccounts.data.map((element) => ({
              value: element.id,
              label: element.name,
            }))
          );
          // Setting Type
          for (let type of typeOptions)
            if (type.value === response.data.type) setType(type);
          // Setting Organization ID
          // for (let org of organizations.data)
          //   if (org.id === response.data.organization_id)
          //     setOrganizationID({ value: org.id, label: org.name });
          // Setting Debit Account ID
          for (let account of accounts.data)
            if (account.id === response.data.dr_account_id)
              setDrAccountID({ value: account.id, label: account.name });
          // Setting Credit Account ID
          for (let account of accounts.data)
            if (account.id === response.data.cr_account_id)
              setCrAccountID({ value: account.id, label: account.name });
          // Setting TDS
          if (response.data.type === 'Payment') {
            setTds(response.data?.payment_tds ? true : false);
            setItc(response.data?.payment_itc ? true : false);
            if (response.data?.payment_itc) {
              setItcObj((prev) => ({ ...prev, ...response.data.payment_itc }));
              setSelectedOrganization(
                orgData.filter((org) => org.value === response.data.payment_itc.org_id)[0]
              );
            }
            let tempTDSObj = response.data?.payment_tds;
            if (tempTDSObj) {
              for (let account of tdsAccounts.data)
                if (account.id === response.data?.payment_tds?.account_id)
                  tempTDSObj['account_id'] = { value: account.id, label: account.name };
              setTdsObj(tempTDSObj);
            }
          }
        } else {
          sendToast('error', 'Unable to fetch required data', 4000);
          router.push('/dashboard/payment-receipts');
        }
      } else {
        sendToast(
          'error',
          response.data?.message || response.data?.error || 'Unable to fetch the item',
          4000
        );
        router.push('/dashboard/payment-receipts');
      }
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
    if (tds && !tdsObj.pan.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}$/)) {
      sendToast('error', 'PAN format is invalid', 4000);
      return;
    }
    if (itc && !itcObj?.org_id) {
      sendToast('error', 'You must select a Payment ITC Organization', 4000);
      return;
    }
    const tempTDSObj = tdsObj;
    if (tempTDSObj['account_id']?.value)
      tempTDSObj['account_id'] = tempTDSObj['account_id']?.value;

    let formData = new FormData();
    formData.append('type', type.value);
    formData.append('dr_account_id', drAccountID.value);
    formData.append('cr_account_id', crAccountID.value);
    formData.append('date', date.format('YYYY-MM-DD'));
    formData.append('amount', amount);
    formData.append('narration', capitalize(narration));
    if (type.value === 'Payment') {
      if (itc) {
        for (let [k, v] of Object.entries(itcObj || {})) {
          formData.append(`itc[${k}]`, v || 0);
        }
      }
      if (tds) {
        for (let [k, v] of Object.entries(tempTDSObj ?? {})) {
          formData.append(`tds[${k}]`, v);
        }
      }
      if (imageFile) {
        formData.append('file', imageFile);
      }
    }
    setDisabled(true);
    const response = await createItem('payment-receipts', formData);
    setDisabled(false);
    if (response?.success) {
      sendToast('success', 'Created ' + type?.value + ' Successfully.', 4000);
      router.push('/dashboard/payment-receipts');
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Failed to Create ' + type?.value,
        4000
      );
    }
  };

  // Auto Assigning Credit Acc
  // useEffect(() => {
  //   if (organizationID && accounts.length > 0) {
  //     if (loading) setLoading(false);
  //     else {
  //       for (let acc of accounts) {
  //         if (acc.label === organizationID.label) {
  //           if (type?.value === 'Payment') setCrAccountID(acc);
  //           else if (type?.value === 'Receipt') setDrAccountID(acc);
  //         }
  //       }
  //     }
  //   }
  // }, [organizationID, accounts]);
  const fetchAccounts = async (date) => {
    const newDate = date.format('YYYY-MM-DD');
    if (newDate == prevDate) return;
    const accounts = await getList('accounts', { date: newDate });
    if (accounts?.success) {
      prevDate = newDate;
      const accountIDs = accounts.data.map((element) => element.id);
      if (crAccountID && !accountIDs.includes(crAccountID.value)) setCrAccountID(null);
      if (drAccountID && !accountIDs.includes(drAccountID.value)) setDrAccountID(null);
      setAccounts(
        accounts.data.map((element) => ({ value: element.id, label: element.name }))
      );
    }
  };

  return (
    <>
      <Seo pageTitle={'Add New ' + (type?.value || '')} />
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
                  <h1 className='text-30 lh-14 fw-600'>Add New {type?.value}</h1>
                  <div className='text-15 text-light-1'>
                    Create a new {type?.value?.toLowerCase()}
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
                        onChange={(date) => {
                          setDate(date);
                          if (date) fetchAccounts(date);
                        }}
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
                        Debit Account<span className='text-danger'>*</span>
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
                        Credit Account<span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={
                          type?.value === 'Payment'
                            ? bankCashAccounts.filter(
                                (acc) => acc?.value !== drAccountID?.value
                              )
                            : accounts.filter((acc) => acc?.value !== drAccountID?.value)
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
                          className='capitalize'
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
                        <div className='col-6 pr-0'>
                          <div className='form-input-select'>
                            <label className='lh-1 text-16 text-light-1'>
                              Vendor<span className='text-danger'>*</span>
                            </label>
                            <Select
                              options={organizations}
                              value={selectedOrganization}
                              placeholder='Select Vendor'
                              onChange={setSelectedOrganization}
                            />{' '}
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
                        <div className='col-4 pr-0 pb-1 form-input-select'>
                          <label>
                            Account<span className='text-danger'>*</span>
                          </label>
                          <Select
                            options={tdsAccounts}
                            value={tdsObj.account_id}
                            placeholder='Search & Select Account'
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
                    {type?.value === 'Payment' && (
                      <div className='col-12'>
                        <label>Upload File</label>
                        <NewFileUploads
                          multiple={false}
                          fileTypes={['PNG', 'JPG', 'JPEG', 'PDF']}
                          setUploads={setImageFile}
                        />
                      </div>
                    )}
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                        disabled={disabled}
                      >
                        Add {type?.value}
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

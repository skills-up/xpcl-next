import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import ReactSwitch from 'react-switch';
import { createItem, getList } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { sendToast } from '../../../../utils/toastify';

const AddNewAccounts = () => {
  const [accountCategories, setAccountCategories] = useState([]);
  const [accountCategoryID, setAccountCategoryID] = useState(null);
  const [name, setName] = useState('');
  const [isBankCash, setIsBankCash] = useState(false);

  const date = new Date();
  const baseYear = date.getFullYear();
  const [year, setYear] = useState({ label: baseYear, value: baseYear });

  const yearOptions = [
    { label: baseYear - 1, value: baseYear - 1 },
    { label: baseYear, value: baseYear },
    { label: baseYear + 1, value: baseYear + 1 },
  ];

  const currencyOptions = [
    { label: 'AED', value: null },
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'GBP', value: 'GBP' },
    { label: 'INR', value: 'INR' },
  ]
  const [currency, setCurrency] = useState(currencyOptions[0]);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const accountCategories = await getList('account-categories');
    if (accountCategories?.success) {
      setAccountCategories(
        accountCategories.data.map((element) => ({
          value: element.id,
          label: element.name,
          pnl: !element.is_balance_sheet_category,
        }))
      );
    } else {
      sendToast('error', 'Unable to fetch required data', 4000);
      router.push('/dashboard/accounts');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Checking if account id is not null
    const response = await createItem('accounts', {
      name,
      account_category_id: accountCategoryID?.value || null,
      year: year?.value,
      is_bank_cash: isBankCash,
      currency: currency?.value || null,
    });
    if (response?.success) {
      sendToast('success', 'Created Account Successfully.', 4000);
      router.push('/dashboard/accounts');
    } else {
      sendToast(
        'error',
        response.data?.message || response.data?.error || 'Failed to Create Account.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Add New Account' />
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
                  <h1 className='text-30 lh-14 fw-600'>Add New Account</h1>
                  <div className='text-15 text-light-1'>Create a new account.</div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <div className='form-input-select'>
                      <label>Select Account Category</label>
                      <Select
                        options={accountCategories}
                        value={accountCategoryID}
                        placeholder='Search & Select Account Category'
                        onChange={(id) => setAccountCategoryID(id)}
                      />
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setName(e.target.value)}
                          value={name}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Name<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    {accountCategoryID?.pnl && (
                      <div className='col-12'>
                        <div className='form-input-select'>
                          <label>Year</label>
                          <Select
                            options={yearOptions}
                            value={year}
                            onChange={(id) => setYear(id)}
                          />
                        </div>
                      </div>
                    )}
                    {accountCategoryID?.label === 'Credit Cards' && (
                      <div className='col-12'>
                        <div className='form-input'>
                          <input
                            onChange={(e) => setCode(e.target.value)}
                            value={code}
                            placeholder=' '
                            type='text'
                            required
                          />
                          <label className='lh-1 text-16 text-light-1'>
                            Code<span className='text-danger'>*</span>
                          </label>
                        </div>
                      </div>
                    )}
                    <div className='col-12'>
                      <div className='form-input-select'>
                        <label>Select Currency</label>
                        <Select
                          options={currencyOptions}
                          value={currency}
                          onChange={(id) => setCurrency(id)}
                        />
                      </div>
                    </div>
                    <div className='d-flex items-center gap-3'>
                      <ReactSwitch
                        onChange={() => setIsBankCash((prev) => !prev)}
                        checked={isBankCash}
                      />
                      <label>Is Bank / Cash Account</label>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Account
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

export default AddNewAccounts;

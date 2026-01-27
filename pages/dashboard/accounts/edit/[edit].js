import Seo from '../../../../components/common/Seo';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getItem, getList, updateItem } from '../../../../api/xplorzApi';
import ReactSwitch from 'react-switch';
import Select from 'react-select';

const UpdateAccounts = () => {
  const [accountCategories, setAccountCategories] = useState([]);
  const [accountCategoryID, setAccountCategoryID] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isBankCash, setIsBankCash] = useState(false);

  const date = new Date();
  const baseYear = date.getFullYear() - (date.getMonth() < 4 ? 1 : 0);
  const [year, setYear] = useState({ label: baseYear, value: baseYear });

  const yearOptions = [
    { label: baseYear - 1, value: baseYear - 1 },
    { label: baseYear, value: baseYear },
    { label: baseYear + 1, value: baseYear + 1 },
  ];

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    getData();
  }, [router.isReady]);

  const getData = async () => {
    if (router.query.edit) {
      const response = await getItem('accounts', router.query.edit);
      if (response?.success) {
        setName(response.data?.name);
        setCode(response.data?.code);
        setIsBankCash(response.data?.is_bank_cash);
        const accountCategories = await getList('account-categories');
        if (accountCategories?.success) {
          setAccountCategories(
            accountCategories.data.map((element) => ({
              value: element.id,
              label: element.name,
              pnl: !element.is_balance_sheet_category,
            }))
          );
          // Setting Account Categories
          for (let category of accountCategories.data) {
            if (category.id === response.data.account_category_id) {
              setAccountCategoryID({
                value: category.id,
                label: category.name,
                pnl: !category.is_balance_sheet_category,
              });
            }
          }
          // Setting Year
          for (let opt of yearOptions)
            if (response.data.year === +opt.value) setYear(opt);
        } else {
          sendToast('error', 'Unable to fetch required data', 4000);
          router.push('/dashboard/accounts');
        }
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Unable to fetch required data',
          4000
        );
        router.push('/dashboard/accounts');
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Checking if account id is not null
    const response = await updateItem('accounts', router.query.edit, {
      name,
      account_category_id: accountCategoryID?.value || null,
      year: year?.value,
      code: code || null,
      is_bank_cash: isBankCash,
    });
    if (response?.success) {
      sendToast('success', 'Updated Account Successfully.', 4000);
      router.push('/dashboard/accounts');
    } else {
      sendToast(
        'error',
        response.data?.message || response.data?.error || 'Failed to Update Account.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Update Account' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>Update Account</h1>
                  <div className='text-15 text-light-1'>Update an existing account.</div>
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
                        defaultValue={accountCategoryID}
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
                        Update Account
                      </button>
                    </div>
                  </form>
                </div>
                </div>
                </>
  );
};

UpdateAccounts.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default UpdateAccounts;

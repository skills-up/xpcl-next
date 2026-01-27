import Seo from '../../../../components/common/Seo';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getList } from '../../../../api/xplorzApi';
import ReactSwitch from 'react-switch';
import Select from 'react-select';

const AddNewAccountCategories = () => {
  const [accountCategories, setAccountCategories] = useState([]);
  const [accountCategoryID, setAccountCategoryID] = useState(null);
  const [name, setName] = useState('');

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
        }))
      );
    } else {
      sendToast('error', 'Unable to fetch required data', 4000);
      router.push('/dashboard/account-categories');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Checking if account id is not null
    if (accountCategoryID?.value) {
      const response = await createItem('account-categories', {
        name,
        parent_category_id: accountCategoryID.value,
      });
      if (response?.success) {
        sendToast('success', 'Created Account Category Successfully.', 4000);
        router.push('/dashboard/account-categories');
      } else {
        sendToast(
          'error',
          response.data?.message ||
          response.data?.error ||
          'Failed to Create Account Category.',
          4000
        );
      }
    } else {
      sendToast('error', 'You must select a Parent Category first.', 8000);
    }
  };

  return (
    <>
      <Seo pageTitle='Add New Account Category' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
        <div className='col-12'>
          <h1 className='text-30 lh-14 fw-600'>Add New Account Category</h1>
          <div className='text-15 text-light-1'>
            Create a new account category.
          </div>
        </div>
        {/* End .col-12 */}
      </div>
      {/* End .row */}

      <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
        <div>
          <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
            <div className='form-input-select'>
              <label>
                Select Parent Category<span className='text-danger'>*</span>
              </label>
              <Select
                isClearable
                options={accountCategories}
                value={accountCategoryID}
                placeholder='Search & Select Parent Category (required)'
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
            <div className='d-inline-block'>
              <button
                type='submit'
                className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
              >
                Add Account Category
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

AddNewAccountCategories.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddNewAccountCategories;

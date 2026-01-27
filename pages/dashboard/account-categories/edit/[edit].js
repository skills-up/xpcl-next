import Seo from '../../../../components/common/Seo';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getItem, getList, updateItem } from '../../../../api/xplorzApi';
import ReactSwitch from 'react-switch';
import Select from 'react-select';

const UpdateAccountCategories = () => {
  const [accountCategories, setAccountCategories] = useState([]);
  const [accountCategoryID, setAccountCategoryID] = useState(null);
  const [name, setName] = useState('');

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    getData();
  }, [router.isReady]);

  const getData = async () => {
    if (router.query.edit) {
      const response = await getItem('account-categories', router.query.edit);
      if (response?.success) {
        const accountCategories = await getList('account-categories');
        if (accountCategories?.success) {
          setName(response.data?.name);

          setAccountCategories(
            accountCategories.data
              .filter((element) => element.name !== response.data?.name)
              .map((element) => ({
                value: element.id,
                label: element.name,
              }))
          );
          // Getting Account ID
          for (let category of accountCategories.data) {
            if (category.id === response.data.parent_category_id) {
              setAccountCategoryID({ value: category.id, label: category.name });
            }
          }
        } else {
          sendToast('error', 'Unable to fetch required data', 4000);
          router.push('/dashboard/account-categories');
        }
      } else {
        sendToast(
          'error',
          response.data?.message ||
          response.data?.error ||
          'Failed to get the required Account Category data.',
          4000
        );
        router.push('/dashboard/account-categories');
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Checking if account id is not null
    if (accountCategoryID?.value) {
      const response = await updateItem('account-categories', router.query.edit, {
        name,
        parent_category_id: accountCategoryID.value,
      });
      if (response?.success) {
        sendToast('success', 'Updated Account Category Successfully.', 4000);
        router.push('/dashboard/account-categories');
      } else {
        sendToast(
          'error',
          response.data?.message ||
          response.data?.error ||
          'Failed to Update Account Category.',
          4000
        );
      }
    } else {
      sendToast('error', 'You must select a Parent Category first.', 8000);
    }
  };

  return (
    <>
      <Seo pageTitle='Update Account Category' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
        <div className='col-12'>
          <h1 className='text-30 lh-14 fw-600'>Update Account Category</h1>
          <div className='text-15 text-light-1'>
            Update an existing account category.
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
                defaultValue={accountCategoryID}
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
                Update Account Category
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

UpdateAccountCategories.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default UpdateAccountCategories;

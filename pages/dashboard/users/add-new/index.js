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

const AddNewUser = () => {
  const [roles, setRoles] = useState([]);
  const [roleID, setRoleID] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const roles = await getList('roles');
    if (roles?.success) {
      setRoles(roles.data.map((element) => ({ value: element.id, label: element.name })));
    } else {
      sendToast('error', 'Unable to fetch roles list', 4000);
      router.push('/dashboard/users');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Checking if account id is not null
    if (roleID?.value) {
      if (password === confirmPassword) {
        const response = await createItem('/users', {
          role_id: roleID.value,
          name,
          email,
          password,
          password_confirmation: confirmPassword,
        });
        if (response?.success) {
          sendToast('success', 'Created User Successfully.', 4000);
          router.push('/dashboard/users');
        } else {
          sendToast(
            'error',
            response.data?.message || response.data?.error || 'Failed to Create User.',
            4000
          );
        }
      } else {
        sendToast('error', 'Passwords do not match.', 4000);
      }
    } else {
      sendToast('error', 'You must select a Role first.', 8000);
    }
  };

  return (
    <>
      <Seo pageTitle='Add New User' />
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
                  <h1 className='text-30 lh-14 fw-600'>Add New User</h1>
                  <div className='text-15 text-light-1'>Create a new user.</div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <div>
                      <Select
                        options={roles}
                        value={roleID}
                        placeholder='Search & Select Role (required)'
                        onChange={(id) => setRoleID(id)}
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
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setEmail(e.target.value)}
                          value={email}
                          placeholder=' '
                          type='email'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Email<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setPassword(e.target.value)}
                          value={password}
                          placeholder=' '
                          type='password'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Password<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          value={confirmPassword}
                          placeholder=' '
                          type='password'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Confirm Password<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add User
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

export default AddNewUser;

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { customAPICall, getItem } from '../../api/xplorzApi';
import {
  setToken,
  setTokenExpireTime,
  setInitialUserState,
  setPermissions,
  setCurrentOrganization,
  setOrganization,
} from '../../features/auth/authSlice';
import { sendToast } from '../../utils/toastify';

const LoginForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector((state) => state.auth.value.token);
  // Checking if already logged in
  useEffect(() => {
    if (token !== '') {
      window.location = '/';
    }
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    const response = await customAPICall('auth/login', 'post', { email, password });
    if (response?.success) {
      if (response.data?.access_token) {
        // Call to get permissions
        dispatch(setToken({ token: response.data.access_token }));
        const me = response.data?.user;
        if (me) {
          // Getting permissions from role id
          const permissions = await getItem('roles', me?.role_id);
          if (permissions?.success && permissions?.data?.permissions_list) {
            // Setting permissions
            dispatch(
              setPermissions({
                permissions: Object.values(permissions.data.permissions_list),
              })
            );
            // Setting Token Expiry
            dispatch(
              setTokenExpireTime({
                tokenExpireTime: Date.now() + response.expires_in * 1000,
              })
            );
            // Set user organization id
            dispatch(setOrganization({ organization: me.organization_id }));
            // Setting current organization
            dispatch(
              setCurrentOrganization({ currentOrganization: me.current_organization_id })
            );
            sendToast('success', 'Login Successful', 4000);
            if (me.organization_id === 1) router.push('/dashboard');
            else router.push('/');
          } else {
            sendToast('error', 'Could Not Find User Permissions', 4000);
            dispatch(setInitialUserState());
          }
        } else {
          sendToast('error', 'Could Not Verify User', 4000);
          dispatch(setInitialUserState());
        }
      } else sendToast('error', 'Could Not Find Access Token', 4000);
    } else {
      sendToast('error', 'Invalid Username/Password', 4000);
    }
  };

  return (
    <form className='row y-gap-20' onSubmit={onSubmit}>
      <div className='col-12'>
        <h1 className='text-22 fw-500'>Welcome back</h1>
        {/* <p className='mt-10'>
          Don&apos;t have an account yet?{' '}
          <Link href='/others-pages/signup' className='text-blue-1'>
            Sign up for free
          </Link>
        </p> */}
      </div>
      {/* End .col */}

      <div className='col-12'>
        <div className='form-input '>
          <input
            type='email'
            required
            placeholder=' '
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className='lh-1 text-14 text-light-1'>Email</label>
        </div>
      </div>
      {/* End .col */}

      <div className='col-12'>
        <div className='form-input '>
          <input
            type='password'
            required
            placeholder=' '
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label className='lh-1 text-14 text-light-1'>Password</label>
        </div>
      </div>
      {/* End .col */}

      {/* <div className='col-12'>
        <a href='#' className='text-14 fw-500 text-blue-1 underline'>
          Forgot your password?
        </a>
      </div> */}
      {/* End .col */}

      <div className='col-12'>
        <button
          type='submit'
          href='#'
          className='button py-20 -dark-1 bg-blue-1 text-white w-100'
        >
          Sign In <div className='icon-arrow-top-right ml-15' />
        </button>
      </div>
      {/* End .col */}
    </form>
  );
};

export default LoginForm;

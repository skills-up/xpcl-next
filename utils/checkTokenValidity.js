import { customAPICall } from '../api/xplorzApi';
import { setInitialUserState } from '../features/auth/authSlice';
import { sendToast } from './toastify';

export const checkUser = async (router, dispatch) => {
  let checkingUser = sessionStorage.getItem('checking-user');
  // Checking user every 15 mins
  if (checkingUser) {
    // If 15 mins or more has passed, checking once again if the user is still valid
    if (Date.now() - +checkingUser > 900000) {
      sessionStorage.removeItem('checking-user');
      checkingUser = null;
    }
  }
  // If valid, then create session storage item again, otherwise log them out
  if (!checkingUser) {
    if (router) {
      const response = await customAPICall('/auth/me', 'post');
      if (!response?.success) {
        dispatch(setInitialUserState());
        setTimeout(() => {
          sendToast(
            'error',
            'Your current session has expired. Please login again.',
            4000
          );
          if (router.pathname !== '/') router.push('/');
          return;
        }, 1000);
      } else sessionStorage.setItem('checking-user', Date.now());
    }
  }
};

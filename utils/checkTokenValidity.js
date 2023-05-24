import { customAPICall } from '../api/xplorzApi';
import { setInitialUserState } from '../features/auth/authSlice';
import { sendToast } from './toastify';

export const checkUser = async (router, dispatch) => {
  if (!sessionStorage.getItem('checking-user')) {
    if (router) {
      const response = await customAPICall('/auth/me', 'post');
      if (!response?.success) {
        dispatch(setInitialUserState());
        sendToast('error', 'Your current session has expired. Please login again.', 4000);
        router.push('/login');
        return;
      }
      sessionStorage.setItem('checking-user', Date.now());
    }
  }
};

import { toast } from 'react-toastify';

export const sendToast = (type, message = '', timeout = 5000) => {
  toast.dismiss();
  if (type === 'success') {
    toast.success(message, {
      position: 'top-right',
      autoClose: timeout,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
  } else if (type === 'error') {
    toast.error(message, {
      position: 'top-right',
      autoClose: timeout,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    });
  }
};

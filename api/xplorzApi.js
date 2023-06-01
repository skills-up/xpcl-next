import axios from 'axios';
import { store } from '../app/store';
import { setInitialUserState } from '../features/auth/authSlice';
import { sendToast } from '../utils/toastify';

const baseURL = process.env.NEXT_PUBLIC_API_URL;
const travelURL = process.env.NEXT_PUBLIC_TRAVEL_URL;

export const getList = async (entity, params = {}) => {
  // Converting params object to query params
  const response = await customAPICall(entity, 'get', {}, { params });
  return response;
};

export const createItem = async (entity, data) => {
  const response = await customAPICall(entity, 'post', data);
  return response;
};

export const getItem = async (entity, id = -1) => {
  const response = await customAPICall(entity + '/' + id, 'get');
  return response;
};

export const updateItem = async (entity, id = -1, data) => {
  const response = await customAPICall(entity + '/' + id, 'put', data);
  return response;
};

export const deleteItem = async (entity, id = -1) => {
  const response = await customAPICall(entity + '/' + id, 'delete');
  return response;
};

export const customAPICall = async (
  entity,
  requestMethod,
  data = {},
  additionConfig = {},
  airplaneCalls = false
) => {
  try {
    const token = await store.getState().auth.value.token;
    const ax = axios.create({
      baseURL: airplaneCalls ? travelURL : baseURL,
      withCredentials: false,
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        authorization: 'Bearer ' + token,
      },
    });
    // Lower Case
    requestMethod = requestMethod.toLowerCase();
    // Checking for Request Method;
    let response;
    switch (requestMethod) {
      case 'get':
        response = await ax.get(entity, additionConfig);
        break;
      case 'post':
        response = await ax.post(entity, data, additionConfig);
        break;
      case 'put':
        response = await ax.put(entity, data, additionConfig);
        break;
      case 'delete':
        response = await ax.delete(entity, additionConfig);
        break;
      default:
        throw { message: 'Invalid Request Method' };
    }
    // If response successful
    if (response) {
      return { success: true, data: response.data };
    }
  } catch (err) {
    if (err?.response?.status === 401) {
      store.dispatch(setInitialUserState());
      sendToast('error', 'Your current session has expired. Please login again.', 4000);
      window.location.assign('/login');
      return;
    }
    console.error(
      err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        err?.error ||
        err
    );
    return { success: false, data: err?.response?.data || err };
  }
};

import axios from 'axios';
import { store } from '../app/store';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const getList = async (entity, params = null) => {
  // Converting params object to query params
  if (params !== null && typeof params === 'object') {
    let queryStr = '?';
    queryStr += new URLSearchParams(params).toString();
    entity += queryStr;
  }
  const response = await customAPICall(entity, 'get');
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

export const customAPICall = async (entity, requestMethod, data = {}) => {
  try {
    const token = await store.getState().auth.value.token;
    const ax = axios.create({
      baseURL,
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
        response = await ax.get(entity);
        break;
      case 'post':
        response = await ax.post(entity, data);
        break;
      case 'put':
        response = await ax.put(entity, data);
        break;
      case 'delete':
        response = await ax.delete(entity);
        break;
      default:
        throw { message: 'Invalid Request Method' };
    }
    // If response successful
    if (response) {
      return { success: true, data: response.data };
    }
  } catch (err) {
    console.error(err?.response?.data?.message || err?.message || err?.error || err);
    return { success: false, data: err?.response?.data || err };
  }
};

import axios from 'axios';
import { store } from '../app/store';

const baseURL = process.env.NEXT_PUBLIC_API_URL;
const token = store.getState().auth.value.token;

export const getList = async (entity) => {
  const response = await customAPICall(entity, 'get', null, {
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
      authorization: 'Bearer' + token,
    },
  });
  return response;
};

export const createItem = async (entity, data) => {
  const response = await customAPICall(entity, 'post', data, {
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
      authorization: 'Bearer' + token,
    },
  });
  return response;
};
export const getItem = async (entity) => {
  const response = await customAPICall(entity, 'get', null, {
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
      authorization: 'Bearer' + token,
    },
  });
  return response;
};
export const updateItem = async (entity, data) => {
  const response = await customAPICall(entity, 'put', data, {
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
      authorization: 'Bearer' + token,
    },
  });
  return response;
};

export const deleteItem = async (entity) => {
  const response = await customAPICall(entity, 'delete', null, {
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
      authorization: 'Bearer' + token,
    },
  });
  return response;
};

export const customAPICall = async (
  entity,
  requestMethod,
  data = null,
  config = {
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
  }
) => {
  try {
    // Lower Case
    requestMethod = requestMethod.toLowerCase();
    // URL
    const url = baseURL + entity;
    // Checking for Request Method;
    let response;
    switch (requestMethod) {
      case 'get':
        response = await axios
          .get(url, config)
          .then((res) => {
            return res.data;
          })
          .catch((err) => {
            err.response.data;
          });
        break;
      case 'post':
        response = await axios
          .post(url, data, config)
          .then((res) => {
            return res.data;
          })
          .catch((err) => {
            err.response.data;
          });
        break;
      case 'put':
        response = await axios
          .put(url, data, config)
          .then((res) => {
            return res.data;
          })
          .catch((err) => {
            err.response.data;
          });
        break;
      case 'delete':
        response = await axios
          .delete(url, config)
          .then((res) => {
            return res.data;
          })
          .catch((err) => {
            err.response.data;
          });
        break;
      default:
        throw { message: 'Invalid Request Method' };
    }
    // If response successfull
    if (response) {
      return { success: true, data: response };
    } else {
      throw { message: 'Error' };
    }
  } catch (err) {
    console.error(err?.message || err?.error || err);
    return { success: false, data: err };
  }
};

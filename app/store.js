import { configureStore, combineReducers } from '@reduxjs/toolkit';
import findPlaceSlice from '../features/hero/findPlaceSlice';
import { authReducer } from '../features/auth/authSlice';
import { apisReducer } from '../features/apis/apisSlice';
import { persistReducer, persistStore } from 'redux-persist';
import { flightSearchReducer } from '../features/flightSearch/flightSearchSlice';
import { hotelSearchReducer } from '../features/hotelSearch/hotelSearchSlice';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import thunk from 'redux-thunk';
import storage from 'redux-persist-indexeddb-storage';

const secretKey = process?.env?.NEXT_PUBLIC_REDUX_PERSIST_SECRET_KEY;

const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};

const getStorage = () => {
  if (typeof window !== 'undefined') {
    return storage('xplorzDB');
  }
  return createNoopStorage();
};

const storage_ = getStorage();

const persistConfig = {
  key: 'root',
  storage: storage_,
  whitelist: ['auth', 'apis'],
  transforms: [
    encryptTransform({
      secretKey,
      onError: (error) => {
        console.error(error);
      },
    }),
  ],
};

const rootReducer = combineReducers({
  flightSearch: flightSearchReducer,
  hotelSearch: hotelSearchReducer,
  apis: apisReducer,
  hero: findPlaceSlice,
  auth: authReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({ reducer: persistedReducer, middleware: [thunk] });

export const persistor = persistStore(store);

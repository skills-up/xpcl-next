import { configureStore, combineReducers } from '@reduxjs/toolkit';
import findPlaceSlice from '../features/hero/findPlaceSlice';
import { authReducer } from '../features/auth/authSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import thunk from 'redux-thunk';

const secretKey = process?.env?.NEXT_PUBLIC_REDUX_PERSIST_SECRET_KEY;

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
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
  hero: findPlaceSlice,
  auth: authReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({ reducer: persistedReducer, middleware: [thunk] });

export const persistor = persistStore(store);

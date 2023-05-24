import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  value: {
    airports: [],
    lastAirportCache: '',
    clientOrganizations: [],
  },
};

const apisSlice = createSlice({
  name: 'apis',
  initialState,
  reducers: {
    setAirports: (state, action) => {
      state.value.airports = action.payload.airports;
    },
    setLastAirportCache: (state, action) => {
      state.value.lastAirportCache = action.payload.lastAirportCache;
    },
    setClientOrganizations: (state, action) => {
      state.value.clientOrganizations = action.payload.clientOrganizations;
    },
    setInitialClientOrganizations: (state) => {
      state.value.clientOrganizations = initialState.value.clientOrganizations;
    },
    setInitialAirportsState: (state) => {
      state.value.airports = initialState.value.airports;
      state.value.lastAirportCache = initialState.value.lastAirportCache;
    },
    setInitialApisState: (state) => {
      state.value = initialState.value;
    },
  },
});

export const {
  setAirports,
  setLastAirportCache,
  setClientOrganizations,
  setInitialClientOrganizations,
  setInitialAirportsState,
  setInitialApisState,
} = apisSlice.actions;

export const apisReducer = apisSlice.reducer;

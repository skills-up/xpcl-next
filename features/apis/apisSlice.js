import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  value: {
    airports: [],
    lastAirportCache: '',
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
    setInitialApisState: (state) => {
      state.value = initialState.value;
    },
  },
});

export const { setAirports, setInitialApisState, setLastAirportCache } =
  apisSlice.actions;

export const apisReducer = apisSlice.reducer;

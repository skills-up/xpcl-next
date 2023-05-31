import { createSlice } from '@reduxjs/toolkit';
import { akasa, tripjack } from '../../pages/test/temp';

export const initialState = {
  value: {
    returnFlight: true,
    searchData: { aa: akasa, tj: tripjack, ad: null },
    travellers: [],
  },
};

const flightSearchSlice = createSlice({
  name: 'flightSearch',
  initialState,
  reducers: {
    setReturnFlight: (state, action) => {
      state.value.returnFlight = action.payload.returnFlight;
    },
    setSearchData: (state, action) => {
      state.value.searchData = { ...state.value.searchData, ...action.payload };
    },
    setTravellers: (state, action) => {
      state.value.travellers = action.payload.travellers;
    },
    setInitialState: (state) => {
      state.value = initialState.value;
    },
  },
});

export const { setReturnFlight, setSearchData, setTravellers, setInitialState } =
  flightSearchSlice.actions;

export const flightSearchReducer = flightSearchSlice.reducer;

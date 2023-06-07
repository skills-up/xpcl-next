import { createSlice } from '@reduxjs/toolkit';
import { akasa, tripjack } from '../../pages/test/temp';

export const initialState = {
  value: {
    returnFlight: true,
    // searchData: { aa: null, tj: null, ad: null },
    searchData: { aa: akasa, tj: tripjack, ad: null },
    travellers: [],
    // travellerDOBS: { ADT: 0, CHD: 0, INF: 0 },
    travellerDOBS: { ADT: 1, CHD: 1, INF: 1 },
    airlineOrgs: [],
    paginateDataNumber: 0,
    paginateDataPerPage: 7,
    paginateTotalDataSize: 0,
    stops: null,
    cabins: null,
    airlines: null,
    departingFrom: null,
    arrivingAt: null,
    departTimes: null,
    arriveTimes: null,
    price: { min: 0, max: 0 },
  },
};

const flightSearchSlice = createSlice({
  name: 'flightSearch',
  initialState,
  reducers: {
    setStops: (state, action) => {
      state.value.stops = action.payload;
    },
    setCabins: (state, action) => {
      state.value.cabins = action.payload;
    },
    setAirlines: (state, action) => {
      state.value.airlines = action.payload;
    },
    setDepartTimes: (state, action) => {
      state.value.departTimes = action.payload;
    },
    setArriveTimes: (state, action) => {
      state.value.arriveTimes = action.payload;
    },
    setDepartingFrom: (state, action) => {
      state.value.departingFrom = action.payload;
    },
    setArrivingAt: (state, action) => {
      state.value.arrivingAt = action.payload;
    },
    setPrice: (state, action) => {
      state.value.price = action.payload;
    },
    setSearchData: (state, action) => {
      state.value.searchData = { ...state.value.searchData, ...action.payload };
    },
    setInitialSearchData: (state) => {
      state.value.searchData = initialState.value.searchData;
    },
    setTravellerDOBS: (state, action) => {
      state.value.travellerDOBS = action.payload;
    },
    setAirlineOrgs: (state, action) => {
      state.value.airlineOrgs = action.payload.airlineOrgs;
    },
    setPaginateDataNumber: (state, action) => {
      state.value.paginateDataNumber = action.payload.paginateDataNumber;
    },
    setPaginateDataPerPage: (state, action) => {
      state.value.paginateDataPerPage = action.payload.paginateDataPerPage;
    },
    setPaginateTotalDataSize: (state, action) => {
      state.value.paginateTotalDataSize = action.payload.paginateTotalDataSize;
    },
    setTravellers: (state, action) => {
      state.value.travellers = action.payload.travellers;
    },
    setInitialState: (state) => {
      state.value = initialState.value;
    },
  },
});

export const {
  setReturnFlight,
  setSearchData,
  setTravellers,
  setTravellerDOBS,
  setAirlineOrgs,
  setInitialSearchData,
  setPaginateDataNumber,
  setPaginateDataPerPage,
  setPaginateTotalDataSize,
  setAirlines,
  setArriveTimes,
  setArrivingAt,
  setCabins,
  setDepartTimes,
  setDepartingFrom,
  setPrice,
  setStops,
  setInitialState,
} = flightSearchSlice.actions;

export const flightSearchReducer = flightSearchSlice.reducer;

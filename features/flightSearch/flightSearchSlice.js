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
    clientTravellers: [],
    paginateDataNumber: 0,
    paginateDataPerPage: 10,
    paginateTotalDataSize: 0,
    stops: null,
    cabins: null,
    airlines: null,
    departingFrom: null,
    arrivingAt: null,
    departTimes: null,
    arriveTimes: null,
    price: { value: { min: 0, max: 0 }, maxPrice: 0 },
    sort: {
      _: true,
      price: true,
      total_duration: false,
      departure_time: false,
      arrival_time: false,
    },
    selectedBookings: { to: null, from: null },
    emailClientMode: false,
    emailClients: [],
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
    setReturnFlight: (state, action) => {
      state.value.returnFlight = action.payload;
    },
    setSort: (state, action) => {
      if (action.payload.key === '_') {
        state.value.sort['_'] = action.payload.value;
      } else {
        for (let [key, value] of Object.entries(state.value.sort)) {
          if (key !== '_') {
            if (key !== action.payload.key) state.value.sort[key] = false;
            else state.value.sort[key] = action.payload.value;
          }
        }
      }
    },
    setEmailClientMode: (state, action) => {
      state.value.emailClientMode = action.payload;
    },
    setEmailClients: (state, action) => {
      state.value.emailClients = action.payload;
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
    setClientTravellers: (state, action) => {
      state.value.clientTravellers = action.payload.clientTravellers;
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
    setSelectedBookings: (state, action) => {
      state.value.selectedBookings = action.payload;
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
  setEmailClientMode,
  setEmailClients,
  setInitialSearchData,
  setPaginateDataNumber,
  setPaginateDataPerPage,
  setPaginateTotalDataSize,
  setAirlines,
  setClientTravellers,
  setArriveTimes,
  setArrivingAt,
  setCabins,
  setSelectedBookings,
  setDepartTimes,
  setSort,
  setDepartingFrom,
  setPrice,
  setStops,
  setInitialState,
} = flightSearchSlice.actions;

export const flightSearchReducer = flightSearchSlice.reducer;

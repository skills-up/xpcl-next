import { createSlice } from '@reduxjs/toolkit';
import { DateObject } from 'react-multi-date-picker';
import { akasa, tripjack } from '../../pages/test/temp';

export const initialState = {
  value: {
    rooms: [],
    city: '',
    checkInDate: new DateObject(),
    checkOutDate: new DateObject(),
    selectedData: null,
    paginateDataNumber: 0,
    paginateDataPerPage: 10,
    paginateTotalDataSize: 0,
    price: { value: { min: 0, max: 0 }, maxPrice: 0 },
    sort: {
      _: true,
      price: true,
      total_duration: false,
      departure_time: false,
      arrival_time: false,
    },
  },
};

const hotelSearchSlice = createSlice({
  name: 'hotelSearch',
  initialState,
  reducers: {
    setRooms: (state, action) => void (state.value.rooms = action.payload),
    setCity: (state, action) => void (state.value.city = action.payload),
    setCheckInDate: (state, action) => void (state.value.checkInDate = action.payload),
    setCheckOutDate: (state, action) => void (state.value.checkOutDate = action.payload),
    setSelectedData: (state, action) => void (state.value.selectedData = action.payload),
    setPaginateDataNumber: (state, action) =>
      void (state.value.paginateDataNumber = action.payload.paginateDataNumber),
    setPaginateDataPerPage: (state, action) =>
      void (state.value.paginateDataPerPage = action.payload.paginateDataPerPage),
    setPaginateTotalDataSize: (state, action) =>
      void (state.value.paginateTotalDataSize = action.payload.paginateTotalDataSize),
    setPrice: (state, action) => void (state.value.price = action.payload),
    setSort: (state, action) => void (state.value.sort = action.payload),
    setInitialState: (state) => {
      state.value = initialState.value;
    },
  },
});

export const {
  setCheckInDate,
  setCheckOutDate,
  setCity,
  setPaginateDataNumber,
  setPaginateDataPerPage,
  setPaginateTotalDataSize,
  setPrice,
  setRooms,
  setSelectedData,
  setSort,
  setInitialState,
} = hotelSearchSlice.actions;

export const hotelSearchReducer = hotelSearchSlice.reducer;

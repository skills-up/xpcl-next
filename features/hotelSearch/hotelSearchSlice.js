import { createSlice } from '@reduxjs/toolkit';
import { DateObject } from 'react-multi-date-picker';
import { akasa, tjHotel, tripjack } from '../../pages/test/temp';

export const initialState = {
  value: {
    searchData: tjHotel,
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
      rating: false,
    },
  },
};

const hotelSearchSlice = createSlice({
  name: 'hotelSearch',
  initialState,
  reducers: {
    setSearchData: (state, action) => void (state.value.searchData = action.payload),
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
    setInitialState: (state) => {
      state.value = initialState.value;
    },
  },
});

export const {
  setSearchData,
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

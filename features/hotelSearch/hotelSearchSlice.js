import { createSlice } from '@reduxjs/toolkit';
import { DateObject } from 'react-multi-date-picker';

export const initialState = {
  value: {
    searchData: null,
    rooms: [],
    city: '',
    checkInDate: new DateObject(),
    checkOutDate: new DateObject(),
    selectedData: null,
    paginateDataNumber: 0,
    paginateDataPerPage: 50,
    paginateTotalDataSize: 0,
    ratings: 1,
    maxRatings: 5,
    ratingParams: [],
    options: null,
    age: { totalAdult: 0, totalChildren: 0 },
    price: { value: { min: 0, max: 0 }, minPrice: 0, maxPrice: 0 },
    sort: {
      _: true,
      price: true,
      rating: false,
    },
    PNR: null,
  },
};

const hotelSearchSlice = createSlice({
  name: 'hotelSearch',
  initialState,
  reducers: {
    setPNR: (state, action) => void (state.value.PNR = action.payload),
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
    setRatings: (state, action) => void (state.value.ratings = action.payload),
    setMaxRatings: (state, action) => void (state.value.maxRatings = action.payload),
    setOptions: (state, action) => void (state.value.options = action.payload),
    setRatingParams: (state, action) => void (state.value.ratingParams = action.payload),
    setAge: (state, action) => void (state.value.age = action.payload),
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
  setPNR,
  setRatings,
  setOptions,
  setSearchData,
  setRatingParams,
  setCheckInDate,
  setCheckOutDate,
  setCity,
  setAge,
  setPaginateDataNumber,
  setMaxRatings,
  setPaginateDataPerPage,
  setPaginateTotalDataSize,
  setPrice,
  setRooms,
  setSelectedData,
  setSort,
  setInitialState,
} = hotelSearchSlice.actions;

export const hotelSearchReducer = hotelSearchSlice.reducer;

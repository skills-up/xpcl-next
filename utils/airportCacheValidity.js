import { getItem, getList } from '../api/xplorzApi';
import { setAirports, setLastAirportCache } from '../features/apis/apisSlice';
import { store } from '../app/store';
import { sendToast } from './toastify';

const checkAirportCache = async (dispatch) => {
  const airports = store.getState().apis.value.airports;
  const lastAirportCache = store.getState().auth.value.lastAirportCache;

  const lastCache = await getItem('cache', 'airports/last-modfied');
  if (lastCache?.success) {
    // Checking if there is an airport already in redux that exists
    if (airports.length > 0 && lastAirportCache !== '') {
      // Checking for last cache
      if (lastAirportCache !== lastCache.data) {
        await updateAirportCache(lastCache, dispatch);
      }
    } else {
      // Setting Airport Cache + Getting Airport List
      await updateAirportCache(lastCache, dispatch);
    }
    // Adding Session Storage
    sessionStorage.setItem('airports-checked', Date.now());
  } else {
    sendToast(
      'error',
      lastCache.data?.message ||
        lastCache.data?.error ||
        'Error with fetching cache for airports',
      4000
    );
    return;
  }
};

const updateAirportCache = async (lastCache, dispatch) => {
  const airportsResponse = await getList('airports');
  if (airportsResponse?.success) {
    dispatch(setAirports({ airports: airportsResponse.data }));
    dispatch(setLastAirportCache({ lastAirportCache: lastCache.data.datetime }));
  } else {
    sendToast(
      'error',
      airportsResponse.data?.message ||
        airportsResponse.data?.error ||
        'Error while fetching airports',
      4000
    );
  }
};

export default checkAirportCache;

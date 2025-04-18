import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createItem, customAPICall, getList } from '../../../api/xplorzApi';
import { sendToast } from '../../../utils/toastify';
import Seat from '../common/Seat';
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { DateObject } from 'react-multi-date-picker';
import Select from 'react-select';
// import { aaSeatMap, adSeatMap } from '../../../pages/test/temp';
import parse from 'html-react-parser';
import LoadingBar from 'react-top-loading-bar';
import { setSelectedBookings } from '../../../features/flightSearch/flightSearchSlice';
import { TiTickOutline } from 'react-icons/ti';
import FlightProperty from '../../flight-list/common/FlightProperty';
import { FaDoorClosed, FaMinus, FaPlus } from 'react-icons/fa';
import Seo from '../../common/Seo';
import { RxCross1 } from 'react-icons/rx';
import ReactDomServer from 'react-dom/server';
import { TbStairsUp } from 'react-icons/tb';
import { BsBox2Fill } from 'react-icons/bs';
import { GiForkKnifeSpoon } from 'react-icons/gi';
import { ImManWoman } from 'react-icons/im';
import { BiSolidCabinet } from 'react-icons/bi';

function Seatmap({ seatMaps, PNRS, travellerInfos }) {
  const [SEO, setSEO] = useState('');
  const [PNR, setPNR] = PNRS;
  const [seatMap, setSeatMap] = seatMaps;
  const [invoiceDetailsExpand, setInvoiceDetailsExpand] = useState(false);
  // const travellers = useSelector((state) => state.flightSearch.value.travellers);
  const selectedBookings = useSelector(
    (state) => state.flightSearch.value.selectedBookings
  );
  const destinations = useSelector((state) => state.flightSearch.value.destinations);
  const [showItinerary, setShowItinerary] = useState({
    to: true,
    from: true,
    combined: true,
  });
  const [isProgress, setIsProgress] = useState(false);
  const travellerDOBS = useSelector((state) => state.flightSearch.value.travellerDOBS);
  const clientTravellers = useSelector(
    (state) => state.flightSearch.value.clientTravellers
  );
  const returnFlight = useSelector((state) => state.flightSearch.value.returnFlight);
  const client_id = useSelector((state) => state.auth.value.currentOrganization);
  const [travellerInfo, setTravellerInfo] = travellerInfos;
  const [progress, setProgress] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const dispatch = useDispatch();
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [stage, setStage] = useState(0);
  const [expand, setExpand] = useState({ to: [], from: [], combined: [] });
  const [breakdown, setBreakdown] = useState(null);
  // Fetch Flight Details for PNRs
  // Save Them To Seatmaps
  // Display Seatmaps
  const amadeusMealOptions = [
    {
      value: '_',
      label: 'No Preference',
    },
    { value: 'AVML', label: 'Vegetarian' },
    { value: 'HNML', label: 'Hindu Non Vegetarian' },
    { value: 'VJML', label: 'Jain Vegetarian' },
    { value: 'VLML', label: 'Lacto Ovo Meal' },
  ];
  const router = useRouter();

  let getArray = (x) => {
    return x ? (Array.isArray(x) ? x : [x]) : [];
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    updateSEO();
  }, [stage]);

  const updateSEO = () => {
    if (destinations) {
      setSEO(
        `Flight ${stage === 1 ? 'Confirmation' : 'Booking'} | ${
          returnFlight
            ? destinations?.to?.label?.split('|')?.at(1) +
              ' - ' +
              destinations?.from?.label?.split('|')?.at(1) +
              ' - ' +
              destinations?.to?.label?.split('|')?.at(1) +
              ' Roundtrip'
            : destinations?.from?.label?.split('|')?.at(1) +
              ' - ' +
              destinations?.to?.label?.split('|')?.at(1) +
              ', ' +
              new DateObject({
                date: selectedBookings?.to?.segments[0].departure.time.split('T')[0],
                format: 'YYYY-MM-DD',
              })?.format('DD MMMM')
        }`
      );
    }
  };

  const total = (obj) => {
    if (obj) {
      let temp = 0;
      for (let value of Object.values(obj)) {
        temp += value;
      }
      return temp;
    }
  };

  // Breakdown
  useEffect(() => {
    let tempObj = { 'Base Fare': 0, 'Taxes & Fee': 0, 'Meal Total': 0, 'Seats Total': 0 };
    if (travellerInfo && seatMap && PNR) {
      // Base Fare + Taxes
      for (let [key, value] of Object.entries(PNR)) {
        if (value) {
          if (value?.provider === 'tj') {
            if (value.data.data.totalPriceInfo?.totalFareDetail?.fC?.BF) {
              tempObj['Base Fare'] +=
                value.data.data.totalPriceInfo?.totalFareDetail?.fC?.BF;
            }
            if (value.data.data.totalPriceInfo?.totalFareDetail?.fC?.TAF) {
              tempObj['Taxes & Fee'] +=
                value.data.data.totalPriceInfo?.totalFareDetail?.fC?.TAF;
            }
            // Meal
            for (let traveller of travellerInfo) {
              if (traveller.trip_meals[key] && traveller.trip_meals[key].length > 0) {
                for (let meal of traveller.trip_meals[key]) {
                  tempObj['Meal Total'] += meal?.value?.amount || 0;
                }
              }
            }
          } else if (value?.provider === 'ad') {
            if (value.data.fares.B) {
              tempObj['Base Fare'] += value.data.fares.B;
            }
            if (value.data.fares.TAX) {
              tempObj['Taxes & Fee'] += value.data.fares.TAX;
            }
          } else if (value?.provider === 'aa') {
            if (value.data.totals.totalAmount) {
              tempObj['Base Fare'] += value.data.totals.totalAmount;
              if (travellerDOBS.INF && travellerDOBS.INF > 0)
                tempObj['Base Fare'] += 1500;
            }
            if (value.data.totals.totalTax) {
              tempObj['Taxes & Fee'] += value.data.totals.totalTax;
            }
            for (let traveller of travellerInfo) {
              if (traveller.trip_meals[key] && traveller.trip_meals[key].length > 0) {
                for (let meal of traveller.trip_meals[key]) {
                  tempObj['Meal Total'] += meal?.value?.passengersAvailability
                    ? Object.values(meal?.value?.passengersAvailability)[0]?.price || 0
                    : 0;
                }
              }
            }
          }
        }
      }
      // Seats
      for (let [key, value] of Object.entries(seatMap)) {
        if (value) {
          if (value.provider === 'tj') {
            for (let [segKey, seg] of Object.entries(value.data.seatMap)) {
              if (seg.travellers) {
                for (let trav of seg.travellers) {
                  tempObj['Seats Total'] += trav.amount;
                }
              }
            }
          } else if (value.provider === 'ad') {
            for (let seg of value.data) {
              if (seg.travellers) {
                for (let trav of seg.travellers) {
                  tempObj['Seats Total'] += +trav.amount;
                }
              }
            }
          } else if (value.provider === 'aa') {
            for (let seg of value.data) {
              if (seg.seatMap.travellers) {
                for (let trav of seg.seatMap.travellers) {
                  tempObj['Seats Total'] += +trav.amount;
                }
              }
            }
          }
        }
      }
      setBreakdown(tempObj);
    }
  }, [PNR, travellerInfo, seatMap]);

  // useEffect(() => {
  //   console.log('Seatmap', seatMap);
  // }, [seatMap]);

  // Fetching Seatmaps for PNRS
  const getData = async () => {
    if (PNR) {
      let totalCalls = 0;
      let CurrentCalls = 0;
      for (let value of Object.values(PNR)) {
        if (value) totalCalls += 1;
      }
      let response = {};
      let tempDat = { to: null, from: null, combined: null };
      // let tempDat = {
      //   to: { data: aaSeatMap, provider: 'aa' },
      //   from: null,
      //   combined: null,
      // };
      let tempPNR = { ...PNR };
      for (let [key, value] of Object.entries(PNR)) {
        if (value) {
          // API Call to Flight Booking + setSeatMap
          // TJ
          if (value?.provider === 'tj') {
            response = await customAPICall(
              'tj/v1/seatmaps',
              'post',
              { bookingId: value?.data?.bookingId },
              {},
              true
            );
            if (response?.success) {
              tempDat[key] = {
                data: response.data,
                provider: 'tj',
              };
              // Checking if any fair changes occurred
              if (value?.data?.data?.alerts && value?.data?.data?.alerts?.length > 0) {
                for (let alert of value?.data?.data?.alerts) {
                  if (
                    alert?.oldFare &&
                    alert?.newFare &&
                    alert?.oldFare !== alert?.newFare
                  ) {
                    setAlerts((prev) => [...prev, { type: key, alert }]);
                    dispatch(
                      setSelectedBookings({
                        ...selectedBookings,
                        [key]: { ...selectedBookings[key], total: alert?.newFare },
                      })
                    );
                  }
                }
              }
            }
          }
          // AA
          if (value?.provider === 'aa') {
            response = await customAPICall(
              'aa/v1/seatmaps',
              'post',
              { key: value.data.key },
              {},
              true
            );
            let ssr = await customAPICall(
              'aa/v1/fetch-ssrs',
              'post',
              {
                key: value.data.key,
                trips: selectedBookings[key].segments.map((el) => ({
                  origin: el.departure.airport.code,
                  destination: el.arrival.airport.code,
                  departureDate: el.departure.time.split('T')[0],
                  identifier: {
                    identifier: el.flight.number,
                    carrierCode: el.flight.airline,
                  },
                })),
                passengerKeys: value.data.pax.map((p) => p.key),
              },
              {},
              true
            );
            if (response?.success && ssr.success) {
              tempPNR[key].data['ssr'] = ssr.data;
              tempDat[key] = {
                data: response.data,
                provider: 'aa',
              };
            }
          }
          // AD
          if (value?.provider === 'ad') {
            let counter = 0;
            for (let [segKey, segValue] of Object.entries(value?.data?.segments || {})) {
              let travellersTemp = [];
              for (let traveller of travellerInfo) {
                let tempObj = {};
                // Age
                const age = (
                  (Date.now() -
                    +new DateObject({
                      date: traveller?.passport_dob,
                      format: 'YYYY-MM-DD',
                    })
                      .toDate()
                      .getTime()) /
                  31536000000
                ).toFixed(2);
                // If below 2 years of age, infant
                if (age < 2) tempObj['type'] = 'INF';
                // If above 2 but below 12, child
                if (age >= 2 && age < 12) tempObj['type'] = 'CHD';
                // If above 12 years, consider adult
                if (age >= 12) tempObj['type'] = 'ADT';
                tempObj['firstName'] = traveller?.first_name;
                tempObj['lastName'] = traveller?.last_name;
                tempObj['dateOfBirth'] = traveller?.passport_dob;
                // Fare basis
                let pax;
                for (let trav of value.data.travellers) {
                  if (traveller.id === trav.id) {
                    pax = trav?.paxRef;
                  }
                }
                for (let fareBasis of value?.data?.fareBasis) {
                  for (let k of fareBasis.keys) {
                    if (+k.refNumber === pax) {
                      tempObj['fareBasisOverride'] = fareBasis.basis;
                    }
                  }
                }
                // FF
                if (
                  traveller?.frequentFliers[key]?.program?.value?.code &&
                  traveller?.frequentFliers[key]?.membershipID.trim().length > 0
                ) {
                  tempObj['ff'] = {
                    code: traveller.frequentFliers[key].program.value.code,
                    number: traveller.frequentFliers[key].membershipID,
                  };
                }
                travellersTemp.push(tempObj);
              }
              response = await createItem('flights/seatmap', {
                seatCount: travellerDOBS.ADT + travellerDOBS.CHD,
                sector: {
                  departure: segValue.from,
                  arrival: segValue.to,
                  departureDate: segValue.departureDate,
                  arrivalDate: segValue.arrivalDate,
                  airline: segValue.companyCode,
                  flightNumber: segValue.flightNumber,
                  bookingClass: segValue.bookingClass,
                },
                travellers: travellersTemp,
              });
              if (response?.success) {
                for (let cabin of getArray(response.data.cabin)) {
                  if (cabin.compartmentDetails.cabinZoneCode === 'U') {
                    response.data['upperDeckToggle'] = false;
                  }
                }
                tempDat[key] = {
                  data:
                    tempDat[key]?.data && tempDat[key].data.length > 0
                      ? [...tempDat[key].data, { ...response.data, segKey }]
                      : [{ ...response.data, segKey }],
                  provider: 'ad',
                };
              }
              counter += 1;
            }
          }
          if (!response?.success) {
            sendToast('error', 'Could not fetch seatmap', 4000);
            // router.back();
          }
          CurrentCalls += 1;
          setProgress(Math.floor((CurrentCalls / totalCalls) * 100));
        }
      }
      setSeatMap(tempDat);
      setPNR(tempPNR);
    }
  };

  // useEffect(() => console.log('traveller', travellerInfo), [travellerInfo]);

  // On Click
  const onClick = async () => {
    setIsProgress(true);
    let totalCalls = 0;
    let currentCalls = 0;
    let totalSuccess = 0;
    let bookingTemp = { to: null, from: null, combined: null };
    let clients = await getList('organizations', { is_client: 1 });
    let client_code;
    if (clients?.success) {
      for (let client of clients.data)
        if (client_id === client.id) client_code = client.code;
    } else {
      sendToast('error', 'Error fetching client organizations.', 4000);
      setIsProgress(false);
      return;
    }
    for (let value of Object.values(PNR)) {
      if (value) totalCalls += 1;
    }
    for (let [key, value] of Object.entries(PNR)) {
      if (value) {
        // TJ
        if (value.provider === 'tj' || value.provider === 'aa') {
          // PAX
          let travellers = [];
          let seatCost = 0;
          let mealCost = 0;
          for (let traveller of travellerInfo) {
            let tempObj = {};
            let sector = 0;
            // Seats
            let seats = [];
            if (value.provider === 'tj') {
              for (let v of Object.values(seatMap[key]?.data?.seatMap || {})) {
                ++sector;
                if (v.travellers?.length > 0) {
                  for (let trav of v.travellers) {
                    if (trav.id === traveller.id) {
                      seats.push({ sector, code: trav.seatNo, price: trav.amount });
                      seatCost += trav.amount;
                    }
                  }
                }
              }
            } else {
              for (let v of (seatMap[key]?.data || [])) {
                ++sector;
                if (v.seatMap?.travellers?.length > 0) {
                  for (let trav of v.seatMap.travellers) {
                    if (trav.id === traveller.id) {
                      seats.push({ sector, code: trav.designator, price: trav.amount });
                      seatCost += trav.amount;
                    }
                  }
                }
              }
            }
            if (seats.length > 0) tempObj['seats'] = seats;
            // Meals
            const meals = traveller.trip_meals[key]?.map((meal, idx) => ({
              sector: idx+1,
              label: meal.label,
              cost: meal.value?.amount || (Object.values(meal.value?.passengersAvailability || {}).reduce((acc, cur) => acc + (cur.price || 0), 0)),
            })) || [];
            mealCost += meals.reduce((acc, cur) => acc + cur.cost, 0);
            if (meals.length > 0) tempObj['meals'] = meals;
            const client_traveller = clientTravellers.filter(
              (ct) => ct.traveller_id === traveller.id
            )[0];
            if (!client_traveller) {
              sendToast(
                'error',
                'Failed to locate client traveller id for traveller ' +
                  traveller.passport_name,
                4000
              );
              throw new Error('Cannot make booking for TJ');
            } else {
              tempObj['client_traveller_id'] = client_traveller.id;
              tempObj['traveller_id'] = client_traveller.traveller_id;
            }
            travellers.push(tempObj);
          }
          // Total  Amount (base amt + seats cost + meals cost)
          const flightCost = selectedBookings[key].selectedFF.total;
          const quoted_amount = flightCost + seatCost + mealCost;
          const response = await createItem('send/slack', {
            travellers,
            quoted_amount,
            flightCost,
            seatCost,
            mealCost,
            sectors: selectedBookings[key].segments.map((el) => ({
              airline: el.flight.airline,
              flight: el.flight.number,
              from: el.departure.airport.code,
              to: el.arrival.airport.code,
              date: el.departure.time.split('T')[0],
              time: (el.departure.time.split('T')[1] + ':00').substring(0, 8),
              class: (selectedBookings[key].selectedFF?.cabinClass || selectedBookings[key].cabinClass).toUpperCase(),
            })),
            fare_family: selectedBookings[key].selectedFF?.name,
          });
          if (response?.success) {
            totalSuccess += 1;
            bookingTemp[key] = { flightCost, seatCost, mealCost, quoted_amount, travellers };
          }
        }
        // AA
        /* if (value.provider === 'aa') {
          // SSR Bookings
          let ssrsTotal = 0;
          let ssrs = [];
          for (let traveller of travellerInfo) {
            if (traveller.trip_meals[key]) {
              // Getting the traveller key
              let pKey;
              for (let p of value.data.pax) {
                if (
                  p.name.first === traveller.first_name &&
                  p.name.last === traveller.last_name &&
                  p.dob === traveller.passport_dob
                )
                  pKey = p.key;
              }
              if (pKey)
                for (let meal of traveller.trip_meals[key]) {
                  // Age
                  const age = (
                    (Date.now() -
                      +new DateObject({
                        date: traveller?.passport_dob,
                        format: 'YYYY-MM-DD',
                      })
                        .toDate()
                        .getTime()) /
                    31536000000
                  ).toFixed(2);
                  if (age >= 2) {
                    if (
                      meal.value?.passengersAvailability &&
                      meal.value?.passengersAvailability[pKey]
                    ) {
                      ssrs.push({
                        count: 1,
                        key: meal.value?.passengersAvailability[pKey]?.ssrKey,
                      });
                      ssrsTotal += meal.value?.passengersAvailability[pKey]?.price;
                    }
                  }
                }
            }
          }
          if (ssrs.length > 0) {
            const ssrsBooking = await customAPICall(
              'aa/v1/book-ssrs',
              'post',
              {
                key: value.data.key,
                ssrs,
              },
              {},
              true
            );
            if (!ssrsBooking?.success) {
              sendToast('error', 'Error in SSRS Booking', 4000);
            }
          }
          // Seat Bookings (Per Segment Per Traveller)
          let seatTotal = 0;
          let tempTravellers = [];
          for (let pax of value.data.pax) {
            // Travellers
            for (let traveller of travellerInfo) {
              if (
                traveller.first_name === pax.name.first &&
                traveller.last_name === pax.name.last &&
                traveller.passport_dob === pax.dob
              ) {
                let inf = false;
                const age = (
                  (Date.now() -
                    +new DateObject({
                      date: traveller?.passport_dob,
                      format: 'YYYY-MM-DD',
                    })
                      .toDate()
                      .getTime()) /
                  31536000000
                ).toFixed(2);
                if (age < 2) inf = true;
                const clientTraveller = clientTravellers.filter(
                  (ct) => ct.traveller_id === traveller.id
                )[0];
                if (!clientTraveller) {
                  sendToast(
                    'error',
                    'Failed to locate client traveller id for traveller ' +
                      traveller.passport_name,
                    4000
                  );
                  throw new Error('Cannot make booking for AA');
                } else {
                  tempTravellers.push({
                    passengerKey: inf ? 'INFANT' : pax.key,
                    client_traveller_id: clientTraveller.id,
                    quoted_amount: inf
                      ? undefined
                      : traveller?.quoted_amount[key] || undefined,
                    intermediary_quoted:
                      inf || !value?.via_intermediary
                        ? undefined
                        : traveller?.intermediary_quoted[key] || 0,
                  });
                }
                for (let client of clientTravellers) {
                  if (client.traveller_id === traveller.id) {
                    tempTravellers.push({
                      passengerKey: inf ? 'INFANT' : pax.key,
                      client_traveller_id: client.id,
                      quoted_amount: inf
                        ? undefined
                        : traveller?.quoted_amount[key] || undefined,
                      intermediary_quoted:
                        inf || !value?.via_intermediary
                          ? undefined
                          : traveller?.intermediary_quoted[key] || 0,
                    });
                  }
                }
              }
            }
            // Seat Reserve
            if (seatMap[key])
              for (let seg of seatMap[key].data) {
                if (seg.seatMap.travellers && seg.seatMap.travellers.length > 0) {
                  for (let traveller of seg.seatMap.travellers) {
                    if (
                      traveller.first_name === pax.name.first &&
                      traveller.last_name === pax.name.last &&
                      traveller.passport_dob === pax.dob
                    ) {
                      const age = (
                        (Date.now() -
                          +new DateObject({
                            date: traveller?.passport_dob,
                            format: 'YYYY-MM-DD',
                          })
                            .toDate()
                            .getTime()) /
                        31536000000
                      ).toFixed(2);
                      if (age >= 2) {
                        let seatBooking = await customAPICall(
                          'aa/v1/seat-reserve',
                          'post',
                          {
                            key: value.data.key,
                            seatKey: traveller.unitKey,
                            passengerKey: pax.key,
                            journeyKey: selectedBookings[key].journeyKey,
                          },
                          {},
                          true
                        );
                        if (!seatBooking?.success) {
                          sendToast('error', 'Error in Seat Booking', 4000);
                        }
                        seatTotal += traveller.amount;
                      }
                    }
                  }
                }
              }
          }
          // Final Booking
          let total = selectedBookings[key].total + ssrsTotal + seatTotal;
          let book = await customAPICall(
            'aa/v1/book',
            'post',
            {
              key: value.data.key,
              client_id,
              client_code,
              travellers: tempTravellers,
              via_intermediary: value?.via_intermediary,
              hide_fare: value.hide_fare,
              email_travellers: value.email_travellers,
              // amount: total,
            },
            {},
            true
          );
          if (book?.success) {
            bookingTemp[key] = book.data;
            totalSuccess += 1;
          }
        } */
        // AD
        // Reserving Seats
        if (value.provider === 'ad') {
          let seatRequested = false;
          const pnr = value.data.pnr;
          if (seatMap[key]?.data) {
            for (let seg of seatMap[key].data) {
              if (seg.travellers) {
                let tempSeg = [];
                for (let traveller of seg.travellers) {
                  for (let trav of value.data.travellers) {
                    if (traveller.id === trav.id) {
                      tempSeg.push({ seatNumber: traveller.seatNo, paxRef: trav.paxRef });
                      if (traveller.amount > 0) seatRequested = true;
                    }
                  }
                }
                if (tempSeg.length > 0) {
                  let seatBook = await createItem('flights/reserve-seats', {
                    pnr,
                    segRef: seg.segKey,
                    seats: tempSeg,
                  });
                  if (!seatBook?.success) {
                    sendToast('error', 'Error in Seat Bookings', 4000);
                  }
                }
              }
            }
          }
          // Finalize Booking
          const frequentFliers = [];
          const mealRequests = [];
          const travellers = [];
          for (let traveller of travellerInfo) {
            // Getting PAX
            const paxRef = value.data.travellers.filter(
              (trav) => trav.id === traveller.id
            )[0]?.paxRef;
            /* for (let trav of value.data.travellers) {
              if (traveller.id === trav.id) {
                paxRef = trav.paxRef;
              }
            } */
            if (paxRef) {
              const clientTraveller = clientTravellers.filter(
                (ct) => ct.traveller_id === traveller.id
              )[0];
              if (!clientTraveller) {
                sendToast(
                  'error',
                  'Failed to locate client traveller id for traveller ' +
                    traveller.passport_name,
                  4000
                );
                throw new Error('Cannot make booking for AD');
              } else {
                const age = (
                  (Date.now() -
                    +new DateObject({
                      date: traveller?.passport_dob,
                      format: 'YYYY-MM-DD',
                    })
                      .toDate()
                      .getTime()) /
                  31536000000
                ).toFixed(2);
                travellers.push({
                  paxRef,
                  client_traveller_id: clientTraveller.id,
                  quoted_amount:
                    age >= 2 ? traveller?.quoted_amount[key] || undefined : undefined,
                  intermediary_quoted:
                    age >= 2 && value?.via_intermediary
                      ? traveller?.intermediary_quoted[key] || 0
                      : undefined,
                });
              }
            }
            /* for (let client of clientTravellers) {
                if (client.traveller_id === traveller.id) {
                  const age = (
                    (Date.now() -
                      +new DateObject({
                        date: traveller?.passport_dob,
                        format: 'YYYY-MM-DD',
                      })
                        .toDate()
                        .getTime()) /
                    31536000000
                  ).toFixed(2);
                  travellers.push({
                    paxRef,
                    client_traveller_id: client.id,
                    quoted_amount:
                      age >= 2 ? traveller?.quoted_amount[key] || undefined : undefined,
                    intermediary_quoted:
                      age >= 2 && value?.via_intermediary
                        ? traveller?.intermediary_quoted[key] || 0
                        : undefined,
                  });
                }
              } */
            // FF
            if (
              traveller?.frequentFliers[key]?.program?.value?.code &&
              traveller?.frequentFliers[key]?.membershipID.trim().length > 0
            ) {
              frequentFliers.push({
                paxRef,
                code: traveller.frequentFliers[key].program.value.code,
                number: traveller.frequentFliers[key].membershipID,
              });
            }
            // Meals
            // If meal preference existed for a traveller and they didnt change it, then adding this
            let travellerMealFound = false;
            let travellerMealToTake = null;
            if (traveller.trip_meals[key] && traveller.trip_meals[key].length > 0) {
              if (
                traveller.trip_meals[key][0]?.value &&
                traveller.trip_meals[key][0]?.value !== '_'
              ) {
                travellerMealFound = true;
              }
            } else {
              if (traveller.meal_preference) {
                for (let meal of amadeusMealOptions) {
                  if (traveller.meal_preference === meal.value) {
                    travellerMealFound = true;
                    travellerMealToTake = meal;
                  }
                }
              }
            }
            if (travellerMealFound) {
              let found = false;
              for (let meal of mealRequests) {
                if (
                  meal.type ===
                  (travellerMealToTake?.value || traveller.trip_meals[key][0]?.value)
                ) {
                  found = true;
                  meal.paxRefs.push(paxRef);
                }
              }
              if (!found) {
                mealRequests.push({
                  type: travellerMealToTake?.value || traveller.trip_meals[key][0]?.value,
                  paxRefs: [paxRef],
                });
              }
            }
          }
          // Booking Call
          const booking = await createItem('flights/issue-tickets', {
            pnr,
            airline: Object.values(value.data.segments)[0].companyCode,
            seatRequested,
            frequentFliers,
            mealRequests,
            client_id,
            client_code,
            via_intermediary: value?.via_intermediary,
            hide_fare: value.hide_fare,
            email_travellers: value.email_travellers,
            travellers,
          });
          if (booking?.success) {
            bookingTemp[key] = booking.data;
            totalSuccess += 1;
          }
        }
        if (!bookingTemp[key]) bookingTemp[key] = 'Failed';
        currentCalls += 1;
        setProgress(Math.floor((currentCalls / totalCalls) * 100));
        // What Call To Give Finally
        if (currentCalls === totalCalls) {
          setIsProgress(false);
          if (totalSuccess === totalCalls) {
            sendToast('success', `Bookings Successful`, 4000);
            setStage(1);
            setBookingConfirmation(bookingTemp);
          } else if (totalSuccess === 0) sendToast('error', `All Bookings Failed`, 4000);
          else {
            sendToast(
              'error',
              `Only ${totalSuccess}/${totalCalls} Bookings Successful`,
              4000
            );
            setStage(1);
            setBookingConfirmation(bookingTemp);
          }
        }
      }
    }
  };

  // AA Seatmap
  const AASeatMapRender = ({ data, type }) => {
    return (
      <div className='row y-gap-10'>
        {/* Iterating Segments */}
        {data.map((el, ind) => {
          // Getting Group Fee
          const groups = Object.values(el.fees)[0].groups;
          let groupFeeArr = [];
          for (let value of Object.values(groups)) {
            let cost = 0;
            value.fees[0].serviceCharges.map((x) => (cost += x.amount));
            groupFeeArr.push({ group: value.group, amount: cost });
          }
          return (
            <div key={ind} className='aa-seatmap'>
              {/* Accordian */}
              <div
                className={`${
                  expand[type].includes(ind) ? '' : 'bg-primary text-white'
                } d-flex justify-between px-20 py-10 items-center`}
              >
                <div>
                  <h5 className=''>
                    {el.seatMap.departureStation} &rarr; {el.seatMap.arrivalStation}
                  </h5>
                  {!expand[type].includes(ind) && (
                    <div className='row'>
                      {travellerInfo.map((trav, travInd) => {
                        let seatSelected = '';
                        if (el.seatMap?.travellers)
                          for (let travl of el.seatMap?.travellers)
                            if (travl.id === trav.id)
                              seatSelected = travl?.designator || '';
                        const age = (
                          (Date.now() -
                            +new DateObject({
                              date: trav.passport_dob,
                              format: 'YYYY-MM-DD',
                            })
                              .toDate()
                              .getTime()) /
                          31536000000
                        ).toFixed(2);
                        if (age >= 2)
                          return (
                            <span
                              style={{ fontWeight: 'bold' }}
                              className='d-block col-auto'
                              key={travInd}
                            >
                              <span>{trav?.aliases[0]}</span>{' '}
                              <span className='d-inline-block' style={{ width: '50px' }}>
                                - {seatSelected ? seatSelected : 'NA'}
                              </span>
                            </span>
                          );
                      })}
                    </div>
                  )}
                </div>
                <span
                  className='cursor-pointer text-18'
                  onClick={() =>
                    setExpand((prev) => {
                      if (prev[type].includes(ind)) {
                        const i = prev[type].indexOf(ind);
                        if (i > -1) {
                          prev[type].splice(i, 1);
                        }
                      } else prev[type].push(ind);
                      return { ...prev };
                    })
                  }
                >
                  {expand[type].includes(ind) ? (
                    <FaMinus className='mt-20' />
                  ) : (
                    <FaPlus />
                  )}
                </span>
              </div>
              {expand[type].includes(ind) && (
                <div className=''>
                  {/* Legend */}
                  <div
                    className='bg-light-2 pt-10 px-20 mb-20'
                    style={{ height: '100%' }}
                  >
                    <h4 className='text-center mb-5'>Legend</h4>
                    <div className='legend'>
                      <div>
                        <span>
                          <Seat label={<RxCross1 />} type={'booked'} />
                        </span>
                        <span>Booked / Unavailable</span>
                      </div>
                      <div>
                        <span>
                          <Seat type={'selected'} />
                        </span>
                        <span>Selected</span>
                      </div>
                      <div>
                        <span>
                          <Seat isPriced type={'paid'} />
                        </span>
                        <span>Book With Extra Costs</span>
                      </div>
                      <div>
                        <span>
                          <Seat type={'normal'} />
                        </span>
                        <span>Book Without Extra Costs</span>
                      </div>
                    </div>
                    <div className='row my-3'>
                      {travellerInfo.map((trav, travInd) => {
                        let seatSelected = '';
                        if (el.seatMap?.travellers)
                          for (let travl of el.seatMap?.travellers)
                            if (travl.id === trav.id)
                              seatSelected = travl?.designator || '';
                        const age = (
                          (Date.now() -
                            +new DateObject({
                              date: trav.passport_dob,
                              format: 'YYYY-MM-DD',
                            })
                              .toDate()
                              .getTime()) /
                          31536000000
                        ).toFixed(2);
                        if (age >= 2)
                          return (
                            <span
                              style={{ fontWeight: 'bold' }}
                              className='d-block col-auto'
                              key={travInd}
                            >
                              <span>{trav?.aliases[0]}</span>{' '}
                              <span
                                className='text-primary d-inline-block'
                                style={{ width: '50px' }}
                              >
                                - {seatSelected ? seatSelected : 'NA'}
                              </span>
                            </span>
                          );
                      })}
                    </div>
                  </div>
                  {/* Iterating Decks */}
                  <div className='aaseatmap-scroll-container d-flex col-12 scroll-bar-1'>
                    {Object.entries(el.seatMap.decks).map(
                      ([deckKey, deckVal], deckIn) => {
                        return (
                          <div key={deckIn}>
                            {Object.entries(deckVal.compartments).map(
                              ([compKey, compVal], compIn) => {
                                // X - 1-2, 3-4
                                // Y -
                                // Preprocessing
                                let width = Math.floor((compVal.width - 1) / 2);
                                let length = compVal.length / 2;
                                let emptyCol = []; // Finding the aisles
                                for (let i = 0; i < width; i++) {
                                  emptyCol.push(i);
                                }
                                // If any y is odd number, making it -1
                                let yStart = 0;
                                let yEnd = 0;
                                for (let seat of compVal.units) {
                                  //  If its seat type 1
                                  if (seat.type === 1) {
                                    // If seat row number is odd, making it even
                                    // if (seat.y % 2 !== 0) {
                                    //   seat.y -= 1;
                                    // }
                                    // Getting Y Start row
                                    if (yStart === 0) {
                                      yStart = seat.y / 2;
                                    }
                                    // Getting the aisle
                                    let tempInd = emptyCol.indexOf(
                                      Math.floor(seat.x / 2)
                                    );
                                    if (tempInd !== -1) {
                                      emptyCol[tempInd] = null;
                                    }
                                    // Getting the last row
                                    if (seat.y / 2 > yEnd) yEnd = seat.y / 2;
                                  }
                                }
                                // 3D Array
                                let newArr = [];
                                // Null Values 3D
                                for (let l = yStart; l <= yEnd; l++) {
                                  let tempArr = [];
                                  for (let w = 0; w < width; w++) {
                                    tempArr.push(null);
                                  }
                                  newArr.push(tempArr);
                                }
                                // Adding New Values ((seat.y / 2) - yStart )
                                let prevY = 0, pad = 0;
                                for (let seat of compVal.units) {
                                  if (seat.y > prevY) {
                                    pad = (seat.y - prevY) - 2;                                   
                                    prevY = seat.y;
                                  }
                                  if (seat.type === 1) {
                                    seat.pad = pad;
                                    newArr[Math.floor(seat.y / 2 - yStart)][Math.floor(seat.x / 2)] =
                                      seat;
                                  }
                                }
                                return (
                                  <div key={compIn} className='d-flex'>
                                    {/* Iterating Seats */}
                                    {newArr.map((rowEl, rowInd) => (
                                      <div key={rowInd} className='aa-grid'>
                                        {rowEl.map((element, index) => {
                                          let group = null;
                                          for (let grp of groupFeeArr) {
                                            if (
                                              element?.group === grp.group &&
                                              grp.amount > 0
                                            ) {
                                              group = grp;
                                            }
                                          }
                                          return (
                                            <>
                                              {element ? (
                                                <>
                                                  <a
                                                    data-tooltip-id={
                                                      group && element.assignable
                                                        ? element.designator
                                                        : undefined
                                                    }
                                                    data-tooltip-content={
                                                      group &&
                                                      group.amount > 0 &&
                                                      element.assignable
                                                        ? `Amount - ${group.amount.toLocaleString(
                                                            'en-IN',
                                                            {
                                                              maximumFractionDigits: 0,
                                                              style: 'currency',
                                                              currency: 'INR',
                                                            }
                                                          )}`
                                                        : undefined
                                                    }
                                                    data-tooltip-place='top'
                                                    style={{paddingLeft: element.pad * 20}}
                                                  >
                                                    <Seat
                                                      key={index}
                                                      isPriced={
                                                        group &&
                                                        group.amount > 0 &&
                                                        element.assignable
                                                      }
                                                      label={
                                                        element.assignable ? (
                                                          element?.designator
                                                        ) : (
                                                          <RxCross1 />
                                                        )
                                                      }
                                                      type={
                                                        !element.assignable
                                                          ? 'booked'
                                                          : element?.isSelected
                                                          ? 'selected'
                                                          : group?.amount > 0
                                                          ? 'paid'
                                                          : 'normal'
                                                      }
                                                      clickable={
                                                        !element.assignable ? false : true
                                                      }
                                                      onClick={
                                                        element.assignable
                                                          ? () => {
                                                              if (element.assignable) {
                                                                // Adding / Removing Selected Seats
                                                                setSeatMap((prev) => {
                                                                  for (let dat of prev[
                                                                    type
                                                                  ]?.data[ind]?.seatMap
                                                                    ?.decks[deckKey]
                                                                    ?.compartments[
                                                                    compKey
                                                                  ]?.units) {
                                                                    if (
                                                                      dat?.designator ===
                                                                      element?.designator
                                                                    ) {
                                                                      // Adding Travellers that arent infants
                                                                      let tempTravs = [];
                                                                      for (let traveller of travellerInfo) {
                                                                        const age = (
                                                                          (Date.now() -
                                                                            +new DateObject(
                                                                              {
                                                                                date: traveller?.passport_dob,
                                                                                format:
                                                                                  'YYYY-MM-DD',
                                                                              }
                                                                            )
                                                                              .toDate()
                                                                              .getTime()) /
                                                                          31536000000
                                                                        ).toFixed(2);
                                                                        if (age >= 2)
                                                                          tempTravs.push(
                                                                            traveller
                                                                          );
                                                                      }
                                                                      let travl = prev[
                                                                        type
                                                                      ]?.data[ind]
                                                                        ?.seatMap[
                                                                        'travellers'
                                                                      ]
                                                                        ? prev[type]
                                                                            ?.data[ind]
                                                                            ?.seatMap[
                                                                            'travellers'
                                                                          ]
                                                                        : [];
                                                                      let add = {
                                                                        designator:
                                                                          element.designator,
                                                                        unitKey:
                                                                          element.unitKey,
                                                                        amount:
                                                                          group?.amount ||
                                                                          0,
                                                                      };
                                                                      // If already selected, removing selected + traveller info on that seat
                                                                      if (
                                                                        dat['isSelected']
                                                                      ) {
                                                                        dat[
                                                                          'isSelected'
                                                                        ] = false;
                                                                        travl =
                                                                          travl.filter(
                                                                            (trav) =>
                                                                              trav.designator !==
                                                                              element.designator
                                                                          );
                                                                      }
                                                                      // If not selected, then we add traveller and seat info (if max seats are selected,)
                                                                      // Setting first traveller to new seat selected
                                                                      else {
                                                                        dat[
                                                                          'isSelected'
                                                                        ] = true;
                                                                        if (travl) {
                                                                          if (
                                                                            travl.length ===
                                                                            tempTravs.length
                                                                          ) {
                                                                            travl.push({
                                                                              ...travl[0],
                                                                              ...add,
                                                                            });
                                                                            prev[
                                                                              type
                                                                            ].data[
                                                                              ind
                                                                            ].seatMap.decks[
                                                                              deckKey
                                                                            ].compartments[
                                                                              compKey
                                                                            ].units =
                                                                              prev[
                                                                                type
                                                                              ]?.data[
                                                                                ind
                                                                              ]?.seatMap?.decks[
                                                                                deckKey
                                                                              ]?.compartments[
                                                                                compKey
                                                                              ]?.units.map(
                                                                                (s) =>
                                                                                  s.designator ===
                                                                                  travl[0]
                                                                                    .designator
                                                                                    ? {
                                                                                        ...s,
                                                                                        isSelected: false,
                                                                                      }
                                                                                    : s
                                                                              );
                                                                            travl.splice(
                                                                              0,
                                                                              1
                                                                            );
                                                                          } else {
                                                                            // Adding the first traveller in travellers that isnt added
                                                                            let travlToAdd = false;
                                                                            for (let x of tempTravs) {
                                                                              let match = false;
                                                                              for (let y of travl) {
                                                                                if (
                                                                                  y.id ===
                                                                                  x.id
                                                                                ) {
                                                                                  match = true;
                                                                                }
                                                                              }
                                                                              if (
                                                                                !match &&
                                                                                !travlToAdd
                                                                              ) {
                                                                                travl.push(
                                                                                  {
                                                                                    ...x,
                                                                                    ...add,
                                                                                  }
                                                                                );
                                                                                travlToAdd = true;
                                                                              }
                                                                            }
                                                                          }
                                                                        } else {
                                                                          travl = [
                                                                            {
                                                                              ...tempTravs[0],
                                                                              ...add,
                                                                            },
                                                                          ];
                                                                        }
                                                                      }
                                                                      prev[type].data[
                                                                        ind
                                                                      ].seatMap[
                                                                        'travellers'
                                                                      ] = travl;
                                                                    }
                                                                  }
                                                                  return { ...prev };
                                                                });
                                                              }
                                                            }
                                                          : undefined
                                                      }
                                                    />
                                                  </a>
                                                  {group && group.amount > 0 && (
                                                    <ReactTooltip
                                                      style={{ zIndex: '10' }}
                                                      id={element.designator}
                                                    />
                                                  )}
                                                </>
                                              ) : emptyCol.includes(index) ? (
                                                <span></span>
                                              ) : (
                                                <span/>
                                              )}
                                            </>
                                          );
                                        })}
                                      </div>
                                    ))}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // TJ Seatmap
  const TJSeatMapRender = ({ data, type }) => {
    return (
      <div className='row y-gap-10'>
        {Object.entries(data?.seatMap || {}).map(([key, value], index) => {
          // 3D Array
          let newArr = [];
          let aisleArr = [];
          let startsFrom = 0;
          if (value && value?.sInfo) {
            const columnLimit = value?.sData?.column;
            const rowLimit = value?.sData?.row;
            value?.sInfo?.sort((a, b) => a?.seatPosition?.row - b?.seatPosition?.row);
            startsFrom = value?.sInfo[0]?.seatPosition?.row;
            for (let i = 0; i < columnLimit; i++) {
              aisleArr.push(i);
            }
            // Iterating for prototype 3D Array to mimic the seats
            let temp = [];
            for (let i = 0; i < rowLimit; i++) {
              for (let j = 0; j < columnLimit; j++) {
                temp.push(null);
              }
              newArr.push(temp);
              temp = [];
            }
            // Adding values to 3D array
            for (let dat of value?.sInfo) {
              newArr[dat.seatPosition.row - 1][dat.seatPosition.column - 1] = dat;
              let indexOf = aisleArr.indexOf(dat.seatPosition.column - 1);
              if (indexOf !== -1) {
                aisleArr.splice(indexOf, 1);
              }
            }
          }
          return (
            <div className='tj-seatmap' key={index}>
              {/* Accordian */}
              <div
                className={`${
                  expand[type].includes(index) ? '' : 'bg-primary text-white'
                } d-flex justify-between px-20 py-10 items-center`}
              >
                <div>
                  <h5 className=''>
                    {selectedBookings[type].segments[index].departure.airport.code} &rarr;{' '}
                    {selectedBookings[type].segments[index].arrival.airport.code}
                  </h5>
                  {!expand[type].includes(index) && (
                    <div className='row'>
                      {travellerInfo.map((trav, travInd) => {
                        let seatSelected = '';
                        if (value?.travellers)
                          for (let travl of value?.travellers)
                            if (travl.id === trav.id) seatSelected = travl?.seatNo || '';
                        const age = (
                          (Date.now() -
                            +new DateObject({
                              date: trav.passport_dob,
                              format: 'YYYY-MM-DD',
                            })
                              .toDate()
                              .getTime()) /
                          31536000000
                        ).toFixed(2);
                        if (age >= 2)
                          return (
                            <span
                              style={{ fontWeight: 'bold' }}
                              className='d-block col-auto'
                              key={index}
                            >
                              <span>{trav?.aliases[0]}</span>{' '}
                              <span className='d-inline-block' style={{ width: '50px' }}>
                                - {seatSelected ? seatSelected : 'NA'}
                              </span>
                            </span>
                          );
                      })}
                    </div>
                  )}
                </div>
                <span
                  className='cursor-pointer text-18'
                  onClick={() =>
                    setExpand((prev) => {
                      if (prev[type].includes(index)) {
                        const i = prev[type].indexOf(index);
                        if (i > -1) {
                          prev[type].splice(i, 1);
                        }
                      } else prev[type].push(index);
                      return { ...prev };
                    })
                  }
                >
                  {expand[type].includes(index) ? (
                    <FaMinus className='mt-20' />
                  ) : (
                    <FaPlus />
                  )}
                </span>
              </div>
              {expand[type].includes(index) &&
                (newArr.length > 0 ? (
                  <div className=''>
                    {' '}
                    {/* Legend */}
                    <div
                      className='bg-light-2 pt-10 px-20 mb-20'
                      style={{ height: '100%' }}
                    >
                      <h4 className='text-center mb-5'>Legend</h4>
                      <div className='legend'>
                        <div>
                          <span>
                            <Seat label={<RxCross1 />} type={'booked'} />
                          </span>
                          <span>Booked / Unavailable</span>
                        </div>
                        <div>
                          <span>
                            <Seat type={'selected'} />
                          </span>
                          <span>Selected</span>
                        </div>
                        <div>
                          <span>
                            <Seat isPriced type={'paid'} />
                          </span>
                          <span>Book With Extra Costs</span>
                        </div>
                        <div>
                          <span>
                            <Seat type={'normal'} />
                          </span>
                          <span>Book Without Extra Costs</span>
                        </div>
                        <div>
                          <span>
                            <Seat type={'legroom'} />
                          </span>
                          <span>Legroom</span>
                        </div>
                      </div>
                      <div className='row my-3'>
                        {travellerInfo.map((trav, travInd) => {
                          let seatSelected = '';
                          if (value?.travellers)
                            for (let travl of value?.travellers)
                              if (travl.id === trav.id)
                                seatSelected = travl?.seatNo || '';
                          const age = (
                            (Date.now() -
                              +new DateObject({
                                date: trav.passport_dob,
                                format: 'YYYY-MM-DD',
                              })
                                .toDate()
                                .getTime()) /
                            31536000000
                          ).toFixed(2);
                          if (age >= 2)
                            return (
                              <span
                                style={{ fontWeight: 'bold' }}
                                className='d-block col-auto'
                                key={index}
                              >
                                <span>{trav?.aliases[0]}</span>{' '}
                                <span
                                  className='text-primary d-inline-block'
                                  style={{ width: '50px' }}
                                >
                                  - {seatSelected ? seatSelected : 'NA'}
                                </span>
                              </span>
                            );
                        })}
                      </div>
                    </div>
                    {/* Seatmap */}
                    {newArr && newArr.length > 0 && (
                      <div className='tjseatmap-scroll-container d-flex col-12 scroll-bar-1'>
                        {newArr.map((element, ind) => {
                          if (ind + 1 >= startsFrom)
                            return (
                              <div key={ind} className='tj-grid'>
                                {element.map((el, i) =>
                                  el ? (
                                    <>
                                      <a
                                        data-tooltip-id={
                                          el.amount > 0 && !el.isBooked
                                            ? el.seatNo
                                            : undefined
                                        }
                                        data-tooltip-content={
                                          el.amount > 0 && !el.isBooked
                                            ? `Amount - ${el.amount.toLocaleString(
                                                'en-IN',
                                                {
                                                  maximumFractionDigits: 0,
                                                  style: 'currency',
                                                  currency: 'INR',
                                                }
                                              )}`
                                            : undefined
                                        }
                                        data-tooltip-place='top'
                                      >
                                        <Seat
                                          key={i}
                                          label={el.isBooked ? <RxCross1 /> : el.seatNo}
                                          type={
                                            el.isBooked
                                              ? 'booked'
                                              : el?.isSelected
                                              ? 'selected'
                                              : el?.isLegroom
                                              ? 'legroom'
                                              : el?.amount > 0
                                              ? 'paid'
                                              : 'normal'
                                          }
                                          isPriced={!el.isBooked && el.amount > 0}
                                          clickable={el.isBooked ? false : true}
                                          onClick={
                                            !el.isBooked
                                              ? () => {
                                                  if (!el.isBooked) {
                                                    // Adding / Removing Selected Seats
                                                    setSeatMap((prev) => {
                                                      for (let dat of prev[type].data
                                                        .seatMap[key]?.sInfo) {
                                                        if (dat.seatNo === el.seatNo) {
                                                          // Adding Travellers that arent infants
                                                          let tempTravs = [];
                                                          for (let traveller of travellerInfo) {
                                                            const age = (
                                                              (Date.now() -
                                                                +new DateObject({
                                                                  date: traveller?.passport_dob,
                                                                  format: 'YYYY-MM-DD',
                                                                })
                                                                  .toDate()
                                                                  .getTime()) /
                                                              31536000000
                                                            ).toFixed(2);
                                                            if (age >= 2)
                                                              tempTravs.push(traveller);
                                                          }
                                                          let travl = prev[type].data
                                                            .seatMap[key]['travellers']
                                                            ? prev[type].data.seatMap[
                                                                key
                                                              ]['travellers']
                                                            : [];
                                                          let add = {
                                                            seatNo: el.seatNo,
                                                            amount: el.amount,
                                                            key,
                                                          };
                                                          // If already selected, removing selected + traveller info on that seat
                                                          if (dat['isSelected']) {
                                                            dat['isSelected'] = false;
                                                            travl = travl.filter(
                                                              (trav) =>
                                                                trav.seatNo !== el.seatNo
                                                            );
                                                          }
                                                          // If not selected, then we add traveller and seat info (if max seats are selected,)
                                                          // Setting first traveller to new seat selected
                                                          else {
                                                            dat['isSelected'] = true;
                                                            if (travl) {
                                                              if (
                                                                travl.length ===
                                                                tempTravs.length
                                                              ) {
                                                                travl.push({
                                                                  ...travl[0],
                                                                  ...add,
                                                                });
                                                                prev[type].data.seatMap[
                                                                  key
                                                                ].sInfo = prev[
                                                                  type
                                                                ].data.seatMap[
                                                                  key
                                                                ].sInfo.map((s) =>
                                                                  s.seatNo ===
                                                                  travl[0].seatNo
                                                                    ? {
                                                                        ...s,
                                                                        isSelected: false,
                                                                      }
                                                                    : s
                                                                );
                                                                travl.splice(0, 1);
                                                              } else {
                                                                // Adding the first traveller in travellers that isnt added
                                                                let travlToAdd = false;
                                                                for (let x of tempTravs) {
                                                                  let match = false;
                                                                  for (let y of travl) {
                                                                    if (y.id === x.id) {
                                                                      match = true;
                                                                    }
                                                                  }
                                                                  if (
                                                                    !match &&
                                                                    !travlToAdd
                                                                  ) {
                                                                    travl.push({
                                                                      ...x,
                                                                      ...add,
                                                                    });
                                                                    travlToAdd = true;
                                                                  }
                                                                }
                                                              }
                                                            } else {
                                                              travl = [
                                                                {
                                                                  ...tempTravs[0],
                                                                  ...add,
                                                                },
                                                              ];
                                                            }
                                                          }
                                                          prev[type].data.seatMap[key][
                                                            'travellers'
                                                          ] = travl;
                                                        }
                                                      }
                                                      return { ...prev };
                                                    });
                                                  }
                                                }
                                              : undefined
                                          }
                                        />
                                      </a>
                                      <ReactTooltip
                                        id={el.seatNo}
                                        style={{ zIndex: '10' }}
                                      />
                                    </>
                                  ) : (
                                    <>
                                      {aisleArr.includes(i) ? (
                                        <span className='row-number'></span>
                                      ) : (
                                        <span className='row-number' />
                                      )}
                                    </>
                                  )
                                )}
                              </div>
                            );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h5 className='text-danger'>
                      {value?.nt || 'Unable to fetch the Seatmap for this segment.'}
                    </h5>
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    );
  };

  const ADSeatMapRender = ({ data, type }) => {
    const reserveCodes = ['SO', 'BK', 'LA', 'G', 'GN', 'CL', 'ST', 'TA', '1', '8'];
    return (
      <div className='row y-gap-10'>
        {data.map((d, dIndex) => {
          let seatmap = d;
          let rows = seatmap.row;
          var currRow = 0;
          let html = '';
          function getLocation(loc, spacers) {
            if (loc.length < 2) return loc;
            return loc.charAt(spacers < 2 ? 0 : 1);
          }
          var prices = {};
          var custData = seatmap.customerCentricData || {};
          getArray(custData.seatPrice).forEach((detail) => {
            var price = 0;
            getArray(detail.seatPrice.monetaryDetails).forEach((money) => {
              if (money.typeQualifier == 'T') {
                price = money.amount;
              }
            });

            getArray(detail.rowDetails).forEach((row) => {
              var num = row.seatRowNumber;
              getArray(row.seatOccupationDetails).forEach((sod) => {
                var col = sod.seatColumn;
                prices[num + col] = price;
              });
            });
          });

          return (
            <div className='amadeus-container'>
              {/* Accordian */}
              <div
                className={`${
                  expand[type].includes(dIndex) ? '' : 'bg-primary text-white'
                } d-flex justify-between px-20 py-10 items-center`}
              >
                <div>
                  <h5 className=''>
                    {d.flightDateInformation.boardPointDetails.trueLocationId} &rarr;{' '}
                    {d.flightDateInformation.offpointDetails.trueLocationId}
                  </h5>
                  {!expand[type].includes(dIndex) && (
                    <div className='row '>
                      {travellerInfo.map((trav, travInd) => {
                        let seatSelected = '';
                        if (d?.travellers)
                          for (let travl of d?.travellers)
                            if (travl.id === trav.id) seatSelected = travl?.seatNo || '';
                        const age = (
                          (Date.now() -
                            +new DateObject({
                              date: trav.passport_dob,
                              format: 'YYYY-MM-DD',
                            })
                              .toDate()
                              .getTime()) /
                          31536000000
                        ).toFixed(2);
                        if (age >= 2)
                          return (
                            <span
                              style={{ fontWeight: 'bold' }}
                              className='d-block col-auto'
                              key={travInd}
                            >
                              <span>{trav?.aliases[0]}</span>{' '}
                              <span className='d-inline-block' style={{ width: '50px' }}>
                                - {seatSelected ? seatSelected : 'NA'}
                              </span>
                            </span>
                          );
                      })}
                    </div>
                  )}
                </div>
                <span
                  className='cursor-pointer text-18'
                  onClick={() =>
                    setExpand((prev) => {
                      if (prev[type].includes(dIndex)) {
                        const i = prev[type].indexOf(dIndex);
                        if (i > -1) {
                          prev[type].splice(i, 1);
                        }
                      } else prev[type].push(dIndex);
                      return { ...prev };
                    })
                  }
                >
                  {expand[type].includes(dIndex) ? (
                    <FaMinus className='mt-20' />
                  ) : (
                    <FaPlus />
                  )}
                </span>
              </div>
              {expand[type].includes(dIndex) && (
                <div className=''>
                  {/* Legend */}
                  <div
                    style={{ height: '100%' }}
                    className='bg-light-2 pt-10 px-20 mb-20'
                  >
                    <h4 className='text-center mb-5'>Legend</h4>
                    <div className='legend'>
                      <div>
                        <span>
                          <Seat label={<RxCross1 />} type={'booked'} />
                        </span>
                        <span>Booked / Unavailable</span>
                      </div>
                      <div>
                        <span>
                          <Seat type={'selected'} />
                        </span>
                        <span>Selected</span>
                      </div>
                      <div>
                        <span>
                          <Seat isPriced type={'paid'} />
                        </span>
                        <span>Book With Extra Costs</span>
                      </div>
                      <div>
                        <span>
                          <Seat type={'normal'} />
                        </span>
                        <span>Book Without Extra Costs</span>
                      </div>
                      <div>
                        <span>
                          <Seat type={'legroom'} />
                        </span>
                        <span>Legroom</span>
                      </div>
                      <div>
                        <span>
                          <Seat type={'overwing'} />
                        </span>
                        <span>Overwing</span>
                      </div>
                      <div>
                        <span>
                          <Seat type={'exit-row-seat'} />
                        </span>
                        <span>Exit Row Seat</span>
                      </div>
                      <div>
                        <span>
                          <Seat type={'limited-recliner'} />
                        </span>
                        <span>Limited Recliner</span>
                      </div>
                      <div>
                        <span>
                          <Seat type={'basinette'} />
                        </span>
                        <span>Basinette</span>
                      </div>
                      <div>
                        <span>
                          <Seat label={<TbStairsUp />} type={'other'} />
                        </span>
                        <span>Stairs to Upper Deck</span>
                      </div>
                      <div>
                        <span>
                          <Seat label={<BiSolidCabinet />} type={'other'} />
                        </span>
                        <span>Closet</span>
                      </div>
                      <div>
                        <span>
                          <Seat label={<BsBox2Fill />} type={'other'} />
                        </span>
                        <span>Storage</span>
                      </div>
                      <div>
                        <span>
                          <Seat label={<GiForkKnifeSpoon />} type={'other'} />
                        </span>
                        <span>Galley</span>
                      </div>
                      <div>
                        <span>
                          <Seat label={<ImManWoman />} type={'other'} />
                        </span>
                        <span>Lavatory</span>
                      </div>
                      <div>
                        <span>
                          <Seat label={<FaDoorClosed />} type={'other'} />
                        </span>
                        <span>Bulk Head</span>
                      </div>
                    </div>
                    <div className='row my-3'>
                      {travellerInfo.map((trav, travInd) => {
                        let seatSelected = '';
                        if (d?.travellers)
                          for (let travl of d?.travellers)
                            if (travl.id === trav.id) seatSelected = travl?.seatNo || '';
                        const age = (
                          (Date.now() -
                            +new DateObject({
                              date: trav.passport_dob,
                              format: 'YYYY-MM-DD',
                            })
                              .toDate()
                              .getTime()) /
                          31536000000
                        ).toFixed(2);
                        if (age >= 2)
                          return (
                            <span
                              style={{ fontWeight: 'bold' }}
                              className='d-block col-auto'
                              key={travInd}
                            >
                              <span>{trav?.aliases[0]}</span>{' '}
                              <span
                                className='text-primary d-inline-block'
                                style={{ width: '50px' }}
                              >
                                - {seatSelected ? seatSelected : 'NA'}
                              </span>
                            </span>
                          );
                      })}
                    </div>
                  </div>
                  <div>
                    {/* Deck Toggle */}
                    {d.upperDeckToggle !== null && d.upperDeckToggle !== undefined && (
                      <button
                        className=' mb-30 btn btn-outline-dark d-block'
                        onClick={() =>
                          setSeatMap((prev) => {
                            prev[type].data[dIndex].upperDeckToggle =
                              !prev[type].data[dIndex].upperDeckToggle;
                            return { ...prev };
                          })
                        }
                      >
                        {d.upperDeckToggle ? 'Show Lower Deck' : 'Show Upper Deck'}
                      </button>
                    )}
                    {/* Iterating Cabins */}
                    <div className='adseatmap-scroll-container scroll-bar-1'>
                      {getArray(seatmap.cabin).map((cabin, cabinIndex) => {
                        const facilities = getArray(cabin.cabinFacilities || []);
                        const compartment = cabin.compartmentDetails;
                        const defSeatOcc =
                          compartment.defaultSeatOccupation ||
                          cabin.defaultSeatOccupation ||
                          'F';
                        const seatRows = compartment.seatRowRange.number;
                        const isUpperDeck = compartment.cabinZoneCode == 'U';

                        // TODO JQuery
                        // if (isUpperDeck) $('#upperDeckToggle').show();

                        //Obtain column header and layout
                        var seatFormatArr = [];
                        var prev = '';
                        var spacers = 0;
                        compartment.columnDetails.map((detail) => {
                          var curr = getArray(detail.description);
                          // Checking if previous and current column was an A
                          if (curr.indexOf('A') >= 0 && prev.indexOf('A') >= 0) {
                            if (++spacers > 2) {
                              var unspacer = seatFormatArr.lastIndexOf(' ');
                              seatFormatArr.splice(unspacer, 1);
                            }
                            seatFormatArr.push(' ');
                          }
                          seatFormatArr.push(detail.seatColumn);
                          prev = curr;
                        });

                        let rowRange = [];
                        for (let i = seatRows[0]; i <= seatRows[1]; i++) {
                          rowRange.push(i);
                        }

                        const props = spacers < 2 ? ['L', 'R'] : ['L', 'C', 'R'];
                        var propIdx, currProp, contObj;
                        var facRow = '';
                        let facRear = '';
                        let facFront = '';

                        for (let fac of facilities) {
                          var facObj = { L: [], C: [], R: [] };
                          var facDetails = fac.cabinFacilityDetails;
                          var facLocation = getLocation(facDetails.location, spacers);
                          facObj[facLocation].push(facDetails.type);
                          var otrFacDetails = getArray(
                            fac.otherCabinFacilityDetails || []
                          );
                          otrFacDetails.forEach((facDetails) => {
                            facLocation = getLocation(facDetails.location, spacers);
                            facObj[facLocation].push(facDetails.type);
                          });
                          propIdx = 0;
                          facRow = '';
                          currProp = 'L';
                          contObj = { L: '', C: '', R: '' };
                          for (let col of seatFormatArr) {
                            if (col == ' ') {
                              contObj[currProp] += `<td>${ReactDomServer.renderToString(
                                <Seat />
                              )}</td>`;
                              currProp = props[++propIdx];
                            } else {
                              var facility = facObj[currProp].shift();
                              if (facility) {
                                contObj[currProp] += `<td>${ReactDomServer.renderToString(
                                  <Seat
                                    label={
                                      facility === 'ST' ? (
                                        <TbStairsUp />
                                      ) : facility === 'SO' ? (
                                        <BsBox2Fill />
                                      ) : facility === 'BK' ? (
                                        <FaDoorClosed />
                                      ) : facility === 'GN' ? (
                                        <GiForkKnifeSpoon />
                                      ) : facility === 'LA' ? (
                                        <ImManWoman />
                                      ) : facility === 'CL' ? (
                                        <BiSolidCabinet />
                                      ) : (
                                        <RxCross1 />
                                      )
                                    }
                                    clickable={false}
                                    type={
                                      facility === 'ST' ||
                                      facility === 'SO' ||
                                      facility === 'BK' ||
                                      facility === 'GN' ||
                                      facility === 'LA' ||
                                      facility === 'CL'
                                        ? 'other'
                                        : 'booked'
                                    }
                                  />
                                )}</td>`;
                              } else {
                                if (currProp == 'R') {
                                  contObj[currProp] =
                                    `<td>${ReactDomServer.renderToString(
                                      <Seat />
                                    )}</td>` + contObj[currProp];
                                } else if (
                                  currProp == 'C' &&
                                  contObj[currProp].indexOf('</td><td') > 0
                                ) {
                                  contObj[currProp] = contObj[currProp].replace(
                                    '</td><td',
                                    `</td><td>${ReactDomServer.renderToString(
                                      <Seat />
                                    )}</td><td`
                                  );
                                } else {
                                  contObj[
                                    currProp
                                  ] += `<td>${ReactDomServer.renderToString(
                                    <Seat />
                                  )}</td>`;
                                }
                              }
                            }
                          }
                          facRow = contObj['L'] + contObj['C'] + contObj['R'];
                          if (fac.rowLocation == 'F') {
                            facFront += '<tr>' + facRow + '</tr>';
                          } else {
                            facRear += '<tr>' + facRow + '</tr>';
                          }
                        }

                        let show = false;
                        if (
                          d.upperDeckToggle !== undefined &&
                          d.upperDeckToggle !== null
                        ) {
                          if (d.upperDeckToggle === true && isUpperDeck) {
                            show = true;
                          } else if (d.upperDeckToggle === false && !isUpperDeck) {
                            show = true;
                          }
                        } else {
                          show = true;
                        }

                        return (
                          <table
                            key={cabinIndex}
                            className={`amadeus-table ${
                              isUpperDeck ? 'upper-deck' : 'lower-deck'
                            }`}
                            style={{ display: `${show ? 'block' : 'none'}` }}
                          >
                            <tbody>
                              {/* facFront */}
                              {/* <tr>
                                <td></td>
                                {seatFormatArr.map((col) => (
                                  <th className='col-name'>{col}</th>
                                ))}
                              </tr> */}
                              {parse(facFront)}
                              {/* cont */}
                              {rowRange.map((i, index) => {
                                const cabinRow = rows[currRow++];
                                if (cabinRow !== undefined) {
                                  var rowBefore = '',
                                    rowAfter = '';
                                  const rowFacilities = getArray(
                                    cabinRow.cabinFacility || []
                                  );
                                  rowFacilities.map((fac) => {
                                    var facObj = { L: [], C: [], R: [] };
                                    var facDetails = fac.cabinFacilityDetails;
                                    var facLocation = getLocation(
                                      facDetails.location,
                                      spacers
                                    );
                                    facObj[facLocation].push(facDetails.type);
                                    var otrFacDetails = getArray(
                                      fac.otherCabinFacilityDetails || []
                                    );
                                    otrFacDetails.forEach((facDetails) => {
                                      facLocation = getLocation(
                                        facDetails.location,
                                        spacers
                                      );
                                      facObj[facLocation].push(facDetails.type);
                                    });

                                    facRow = '';
                                    propIdx = 0;
                                    currProp = 'L';
                                    contObj = { L: '', C: '', R: '' };
                                    seatFormatArr.forEach((col) => {
                                      if (col == ' ') {
                                        contObj[
                                          currProp
                                        ] += `<td>${ReactDomServer.renderToString(
                                          <Seat />
                                        )}</td>`;
                                        currProp = props[++propIdx];
                                      } else {
                                        var facility = facObj[currProp].shift();
                                        if (facility) {
                                          contObj[
                                            currProp
                                          ] += `<td>${ReactDomServer.renderToString(
                                            <Seat
                                              label={
                                                facility === 'ST' ? (
                                                  <TbStairsUp />
                                                ) : facility === 'SO' ? (
                                                  <BsBox2Fill />
                                                ) : facility === 'BK' ? (
                                                  <FaDoorClosed />
                                                ) : facility === 'GN' ? (
                                                  <GiForkKnifeSpoon />
                                                ) : facility === 'LA' ? (
                                                  <ImManWoman />
                                                ) : facility === 'CL' ? (
                                                  <BiSolidCabinet />
                                                ) : (
                                                  <RxCross1 />
                                                )
                                              }
                                              clickable={false}
                                              type={
                                                facility === 'ST' ||
                                                facility === 'SO' ||
                                                facility === 'BK' ||
                                                facility === 'GN' ||
                                                facility === 'LA' ||
                                                facility === 'CL'
                                                  ? 'other'
                                                  : 'booked'
                                              }
                                            />
                                          )}</td>`;
                                        } else {
                                          if (currProp == 'R') {
                                            contObj[currProp] =
                                              `<td>${ReactDomServer.renderToString(
                                                <Seat />
                                              )}</td>` + contObj[currProp];
                                          } else if (
                                            currProp == 'C' &&
                                            contObj[currProp].indexOf('</td><td') > 0
                                          ) {
                                            contObj[currProp] = contObj[currProp].replace(
                                              '</td><td',
                                              `</td><td>${ReactDomServer.renderToString(
                                                <Seat />
                                              )}</td><td`
                                            );
                                          } else {
                                            contObj[
                                              currProp
                                            ] += `<td>${ReactDomServer.renderToString(
                                              <Seat />
                                            )}</td>`;
                                          }
                                        }
                                      }
                                    });
                                    facRow = contObj['L'] + contObj['C'] + contObj['R'];

                                    if (fac.rowLocation == 'F') {
                                      rowBefore += '<tr><' + facRow + '</tr>';
                                    } else {
                                      rowAfter += '<tr>' + facRow + '</tr>';
                                    }
                                  });
                                  const row = cabinRow.rowDetails;
                                  const rowNum = row.seatRowNumber || i;
                                  var details = Object.assign(
                                    {},
                                    ...getArray(row.seatOccupationDetails).map(
                                      (detail) => ({
                                        [detail.seatColumn]: getArray(
                                          detail.seatCharacteristic
                                        ).concat(getArray(detail.seatOccupation)),
                                      })
                                    )
                                  );

                                  return (
                                    <>
                                      {parse(rowBefore)}
                                      <tr
                                        className={`seat-row ${
                                          row.rowCharacteristicDetails
                                            ? 'row-type-' +
                                              row.rowCharacteristicDetails
                                                .rowCharacteristic
                                            : ''
                                        }`}
                                      >
                                        {/* <th className='row-number'>{rowNum}</th> */}
                                        {seatFormatArr.map((col, colInd) => {
                                          if (col !== ' ') {
                                            var chars =
                                              details[col] || getArray(defSeatOcc);
                                            var price = prices[rowNum + col] || 0;
                                            // var contents = chars.indexOf('O') >= 0 ? 'X' : (chars.indexOf('E') >= 0 ? 'E' : (chars.indexOf('1') >= 0 ? 'R' : (chars.indexOf('CH') >= 0 ? '$' : '&nbsp;')));
                                            var contents = '\u00A0';
                                            // If these codes then seat is unavailable
                                            if (
                                              chars.indexOf('O') >= 0 ||
                                              chars.indexOf('Z') >= 0
                                            ) {
                                              contents = 'X';
                                            } else {
                                              if (chars.indexOf('CH') >= 0)
                                                contents = '₹';
                                              var reserved = false;
                                              reserveCodes.forEach((code) => {
                                                if (chars.indexOf(code) >= 0) {
                                                  reserved = true;
                                                }
                                              });
                                              if (!reserved) chars.push('AVL');
                                            }
                                            // If Seat Selected
                                            let seatSelected = false;
                                            if (seatMap[type].data[dIndex]?.travellers) {
                                              for (let x of seatMap[type].data[dIndex]
                                                .travellers) {
                                                if (x?.seatNo === rowNum + col) {
                                                  seatSelected = true;
                                                }
                                              }
                                            }
                                            let conditions =
                                              chars.includes('AVL') &&
                                              !chars.includes(1) &&
                                              !chars.includes('O') &&
                                              !chars.includes(8) &&
                                              !chars.includes('GN') &&
                                              !chars.includes('SO') &&
                                              !chars.includes('BK') &&
                                              !chars.includes('ST') &&
                                              !chars.includes('LA');
                                            if (chars.indexOf('8') >= 0) {
                                              return (
                                                <td key={colInd}>
                                                  <Seat />
                                                </td>
                                              );
                                            } else {
                                              return (
                                                <td>
                                                  <a
                                                    data-tooltip-id={
                                                      conditions
                                                        ? rowNum + col
                                                        : undefined
                                                    }
                                                    data-tooltip-content={
                                                      conditions && +price > 0
                                                        ? `Amount - ${(+price).toLocaleString(
                                                            'en-IN',
                                                            {
                                                              maximumFractionDigits: 0,
                                                              style: 'currency',
                                                              currency: 'INR',
                                                            }
                                                          )}`
                                                        : undefined
                                                    }
                                                    data-tooltip-place='top'
                                                  >
                                                    <Seat
                                                      key={index}
                                                      label={
                                                        conditions ? (
                                                          rowNum + col
                                                        ) : chars.includes('ST') ? (
                                                          <TbStairsUp />
                                                        ) : chars.includes('SO') ? (
                                                          <BsBox2Fill />
                                                        ) : chars.includes('BK') ? (
                                                          <FaDoorClosed />
                                                        ) : chars.includes('GN') ? (
                                                          <GiForkKnifeSpoon />
                                                        ) : chars.includes('LA') ? (
                                                          <ImManWoman />
                                                        ) : chars.includes('CL') ? (
                                                          <BiSolidCabinet />
                                                        ) : (
                                                          <RxCross1 />
                                                        )
                                                      }
                                                      isPriced={
                                                        conditions &&
                                                        chars.includes('CH') &&
                                                        +price > 0
                                                      }
                                                      type={
                                                        chars.includes('ST') ||
                                                        chars.includes('SO') ||
                                                        chars.includes('BK') ||
                                                        chars.includes('GN') ||
                                                        chars.includes('LA') ||
                                                        chars.includes('CL')
                                                          ? 'other'
                                                          : !conditions
                                                          ? 'booked'
                                                          : seatSelected
                                                          ? 'selected'
                                                          : chars.includes('B')
                                                          ? 'basinette'
                                                          : chars.includes('1D')
                                                          ? 'limited-recliner'
                                                          : chars.includes('E')
                                                          ? 'exit-row-seat'
                                                          : chars.includes('OW')
                                                          ? 'overwing'
                                                          : chars.includes('L')
                                                          ? 'legroom'
                                                          : chars.includes('CH') &&
                                                            +price > 0
                                                          ? 'paid'
                                                          : 'normal'
                                                      }
                                                      clickable={conditions}
                                                      onClick={() => {
                                                        if (conditions) {
                                                          // Seat Number = rowNum+col
                                                          setSeatMap((prev) => {
                                                            // Adding Travellers that arent infants
                                                            let tempTravs = [];
                                                            for (let traveller of travellerInfo) {
                                                              const age = (
                                                                (Date.now() -
                                                                  +new DateObject({
                                                                    date: traveller?.passport_dob,
                                                                    format: 'YYYY-MM-DD',
                                                                  })
                                                                    .toDate()
                                                                    .getTime()) /
                                                                31536000000
                                                              ).toFixed(2);
                                                              if (age >= 2)
                                                                tempTravs.push(traveller);
                                                            }
                                                            let add = {
                                                              amount: price,
                                                              seatNo: rowNum + col,
                                                            };
                                                            let travl =
                                                              prev[type]?.data[dIndex]
                                                                ?.travellers;
                                                            if (travl) {
                                                              // Check if the seat is already selected
                                                              let seatSelected = false;
                                                              for (
                                                                let x = travl.length - 1;
                                                                x >= 0;
                                                                x--
                                                              ) {
                                                                if (
                                                                  travl[x].seatNo ===
                                                                  rowNum + col
                                                                ) {
                                                                  travl.splice(x, 1);
                                                                  seatSelected = true;
                                                                }
                                                              }
                                                              if (!seatSelected) {
                                                                // If the traveller is going to repeat
                                                                if (
                                                                  travl.length ===
                                                                  tempTravs.length
                                                                ) {
                                                                  travl.push({
                                                                    ...travl[0],
                                                                    ...add,
                                                                  });
                                                                  travl.splice(0, 1);
                                                                } else {
                                                                  let travlToAdd = false;
                                                                  for (let x of tempTravs) {
                                                                    let match = false;
                                                                    for (let y of travl) {
                                                                      if (y.id === x.id) {
                                                                        match = true;
                                                                      }
                                                                    }
                                                                    if (
                                                                      !match &&
                                                                      !travlToAdd
                                                                    ) {
                                                                      travl.push({
                                                                        ...x,
                                                                        ...add,
                                                                      });
                                                                      travlToAdd = true;
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            } else {
                                                              travl = [
                                                                {
                                                                  ...tempTravs[0],
                                                                  ...add,
                                                                },
                                                              ];
                                                            }
                                                            prev[type].data[dIndex][
                                                              'travellers'
                                                            ] = travl;
                                                            return { ...prev };
                                                          });
                                                        }
                                                      }}
                                                    />
                                                  </a>
                                                  <ReactTooltip
                                                    style={{ zIndex: '10' }}
                                                    id={rowNum + col}
                                                  />
                                                </td>
                                              );
                                            }
                                          } else {
                                            return (
                                              <td key={colInd}>
                                                <Seat />
                                              </td>
                                            );
                                          }
                                        })}
                                      </tr>
                                      {parse(rowAfter)}
                                    </>
                                  );
                                }
                              })}
                              {/* facRear */}
                              {parse(facRear)}
                            </tbody>
                          </table>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className='pt-40 pb-40 bg-light-2'>
      <Seo pageTitle={SEO} />
      <div className='container'>
        <LoadingBar
          height={3}
          color='#3554d1'
          progress={progress}
          onLoaderFinished={() => setProgress(0)}
        />
        {/* Stage 0 */}
        {stage === 0 && (
          <>
            {/* Alerts */}
            {alerts &&
              alerts.length > 0 &&
              alerts.map((a, aIndex) => (
                <div
                  className={`${
                    +a.alert.oldFare > +a.alert.newFare ? 'bg-success' : 'bg-danger'
                  } mb-10 px-20 py-10 text-white`}
                >
                  <h4>Fare Change Alert</h4>
                  <ul className='list-disc'>
                    <li key={aIndex}>
                      The fare for your{' '}
                      <span style={{ fontWeight: 'bold' }}>
                        {a.type === 'to'
                          ? 'Onward'
                          : a.type === 'from'
                          ? 'Return'
                          : 'Onward & Return'}{' '}
                        Trip{' '}
                      </span>{' '}
                      has changed from{' '}
                      {a.alert.oldFare.toLocaleString('en-IN', {
                        maximumFractionDigits: 0,
                        style: 'currency',
                        currency: 'INR',
                      })}{' '}
                      to{' '}
                      {a.alert.newFare.toLocaleString('en-IN', {
                        maximumFractionDigits: 0,
                        style: 'currency',
                        currency: 'INR',
                      })}
                      . Please proceed accordingly.
                    </li>
                  </ul>
                </div>
              ))}
            {/* Grid */}
            <div className='row'>
              {/* Seatmaps */}
              <div className='col-xl-9 col-lg-8'>
                <h2 className=''>Additional Options</h2>
                {(seatMap?.to || seatMap?.from || seatMap?.combined) && (
                  <h3>Select seats</h3>
                )}
                {/* To */}
                {seatMap?.to?.data && (
                  <>
                    <div className='bg-white py-10 px-20 mt-5'>
                      <h4 className='mb-5 d-flex justify-between items-center'>
                        <span>Onward</span>
                        <span
                          onClick={() =>
                            setShowItinerary((prev) => ({ ...prev, to: !prev.to }))
                          }
                          className='text-14 text-blue-1 fw-500 underline cursor-pointer'
                        >
                          {showItinerary?.to ? 'Hide Itinerary' : 'Show Itinerary'}
                        </span>
                      </h4>
                      {showItinerary?.to && selectedBookings?.to && (
                        <div className='mb-10 border-light mt-10'>
                          <FlightProperty
                            isSelectedBooking
                            element={selectedBookings?.to}
                            showPrice={false}
                          />
                        </div>
                      )}
                      {
                        // TJ
                        seatMap?.to?.provider === 'tj' ? (
                          <TJSeatMapRender data={seatMap.to.data} type='to' />
                        ) : // AA
                        seatMap?.to?.provider === 'aa' ? (
                          <AASeatMapRender data={seatMap.to.data} type='to' />
                        ) : // AD
                        seatMap?.to?.provider === 'ad' ? (
                          <ADSeatMapRender data={seatMap.to.data} type='to' />
                        ) : (
                          <></>
                        )
                      }
                    </div>
                  </>
                )}
                {/* From */}
                {seatMap?.from && (
                  <>
                    <div className='bg-white py-10 px-20 mt-10'>
                      <h4 className='mb-5 d-flex justify-between items-center'>
                        <span>Return</span>
                        <span
                          onClick={() =>
                            setShowItinerary((prev) => ({ ...prev, from: !prev.from }))
                          }
                          className='text-14 text-blue-1 fw-500 underline cursor-pointer'
                        >
                          {showItinerary?.from ? 'Hide Itinerary' : 'Show Itinerary'}
                        </span>
                      </h4>
                      {showItinerary?.from && selectedBookings?.from && (
                        <div className='mb-10 border-light mt-10'>
                          <FlightProperty
                            isSelectedBooking
                            element={selectedBookings?.from}
                            showPrice={false}
                          />
                        </div>
                      )}
                      {
                        // TJ
                        seatMap?.from?.provider === 'tj' ? (
                          <TJSeatMapRender data={seatMap.from.data} type='from' />
                        ) : // AA
                        seatMap?.from?.provider === 'aa' ? (
                          <AASeatMapRender data={seatMap.from.data} type='from' />
                        ) : // AD
                        seatMap?.from?.provider === 'ad' ? (
                          <ADSeatMapRender data={seatMap.from.data} type='from' />
                        ) : (
                          <></>
                        )
                      }
                    </div>
                  </>
                )}
                {/* Combined */}
                {seatMap?.combined && (
                  <>
                    <div className='bg-white py-10 px-20 mt-10'>
                      <h4 className='mb-5 d-flex justify-between items-center'>
                        <span>Onward and Return</span>
                        <span
                          onClick={() =>
                            setShowItinerary((prev) => ({
                              ...prev,
                              combined: !prev.combined,
                            }))
                          }
                          className='text-14 text-blue-1 fw-500 underline cursor-pointer'
                        >
                          {showItinerary?.combined ? 'Hide Itinerary' : 'Show Itinerary'}
                        </span>
                      </h4>
                      {showItinerary?.combined && selectedBookings?.combined && (
                        <div className='mb-10 border-light mt-10'>
                          <FlightProperty
                            isSelectedBooking
                            element={selectedBookings?.combined}
                            showPrice={false}
                          />
                        </div>
                      )}
                      {
                        // TJ
                        seatMap?.combined?.provider === 'tj' ? (
                          <TJSeatMapRender data={seatMap.combined.data} type='combined' />
                        ) : // AA
                        seatMap?.combined?.provider === 'aa' ? (
                          <AASeatMapRender data={seatMap.combined.data} type='combined' />
                        ) : // AD
                        seatMap?.combined?.provider === 'ad' ? (
                          <ADSeatMapRender data={seatMap.combined.data} type='combined' />
                        ) : (
                          <></>
                        )
                      }
                    </div>
                  </>
                )}
                {/* Traveller Meal Preferences + Review */}
                <h3 className='mt-10'>Select meals</h3>
                <div className='bg-white px-20 py-15 mt-5'>
                  {/* Iterating Over Travellers */}
                  <div className='row y-gap-10 x-gap-10'>
                    {travellerInfo.map((travl, travlInd) => {
                      const age = (
                        (Date.now() -
                          +new DateObject({
                            date: travl?.passport_dob,
                            format: 'YYYY-MM-DD',
                          })
                            .toDate()
                            .getTime()) /
                        31536000000
                      ).toFixed(2);
                      // If above 2 but below 12, child
                      if (age >= 2)
                        return (
                          <div
                            key={travlInd}
                            className={`${
                              travellerInfo.length < 2 ? 'col-12' : 'col-lg-6'
                            }`}
                          >
                            <h4>{travl.aliases[0]}</h4>
                            {/* Iterating Over PNRS to get the segments */}
                            <div className='row y-gap-10'>
                              {Object.entries(PNR).map(([key, value], index) => {
                                let amadeusLabel = <></>;
                                if (value && value.provider === 'ad') {
                                  if (selectedBookings[key].type === 'combined') {
                                    let counter = 0;
                                    for (let seg of selectedBookings[key].segments) {
                                      if (seg.segmentNo === 0) {
                                        counter += 1;
                                        if (counter === 2) {
                                          amadeusLabel = (
                                            <>
                                              {
                                                selectedBookings[key].segments[0]
                                                  .departure.airport.code
                                              }{' '}
                                              &rarr; {seg.departure.airport.code} &rarr;{' '}
                                              {
                                                selectedBookings[key].segments.at(-1)
                                                  .arrival.airport.code
                                              }
                                            </>
                                          );
                                        }
                                      }
                                    }
                                  } else {
                                    amadeusLabel = (
                                      <>
                                        {Object.values(value.data.segments)[0].from}{' '}
                                        &rarr;{' '}
                                        {Object.values(value.data.segments).at(-1).to}
                                      </>
                                    );
                                  }
                                }
                                return (
                                  <>
                                    {value && (
                                      <>
                                        {/* TJ */}
                                        {value.provider === 'tj' &&
                                          value.data?.data?.tripInfos?.map(
                                            (tripInf, tripInd) => (
                                              <>
                                                {tripInf?.sI?.map((element, ind) => (
                                                  <>
                                                    {element?.ssrInfo?.MEAL ? (
                                                      <div
                                                        className='form-input-select'
                                                        key={ind}
                                                      >
                                                        <label>
                                                          {element.da.code} &rarr;{' '}
                                                          {element.aa.code}
                                                        </label>
                                                        <Select
                                                          options={[
                                                            {
                                                              value: {
                                                                id: element.id,
                                                              },
                                                              label: 'No Preference',
                                                            },
                                                            ...element?.ssrInfo?.MEAL?.map(
                                                              (el) => ({
                                                                value: {
                                                                  ...el,
                                                                  id: element.id,
                                                                },
                                                                label:
                                                                  el.desc +
                                                                  (el?.amount
                                                                    ? ' - ' +
                                                                      el.amount.toLocaleString(
                                                                        'en-IN',
                                                                        {
                                                                          maximumFractionDigits: 0,
                                                                          style:
                                                                            'currency',
                                                                          currency: 'INR',
                                                                        }
                                                                      )
                                                                    : ''),
                                                              })
                                                            ),
                                                          ]}
                                                          defaultValue={{
                                                            value: {
                                                              id: element.id,
                                                            },
                                                            label: 'No Preference',
                                                          }}
                                                          // value={element.seat_preference}
                                                          onChange={(id) =>
                                                            setTravellerInfo((prev) => {
                                                              for (let traveller of prev) {
                                                                if (
                                                                  traveller.id ===
                                                                  travl.id
                                                                ) {
                                                                  if (
                                                                    traveller.trip_meals[
                                                                      key
                                                                    ]
                                                                  ) {
                                                                    let exists = false;
                                                                    for (
                                                                      let i = 0;
                                                                      i <
                                                                      traveller
                                                                        .trip_meals[key]
                                                                        .length;
                                                                      i++
                                                                    ) {
                                                                      if (
                                                                        element.id ===
                                                                        traveller
                                                                          .trip_meals[
                                                                          key
                                                                        ][i].value.id
                                                                      ) {
                                                                        traveller.trip_meals[
                                                                          key
                                                                        ][i] = id;
                                                                        exists = true;
                                                                      }
                                                                    }
                                                                    if (!exists) {
                                                                      traveller.trip_meals[
                                                                        key
                                                                      ].push(id);
                                                                    }
                                                                  } else {
                                                                    traveller.trip_meals[
                                                                      key
                                                                    ] = [id];
                                                                  }
                                                                }
                                                              }
                                                              return [...prev];
                                                            })
                                                          }
                                                        />
                                                      </div>
                                                    ) : (
                                                      <></>
                                                    )}
                                                  </>
                                                ))}
                                              </>
                                            )
                                          )}
                                        {/* AA */}
                                        {value.provider === 'aa' &&
                                          value.data?.ssr?.legSsrs?.map(
                                            (element, ind) => (
                                              <>
                                                {element ? (
                                                  <div
                                                    className='form-input-select'
                                                    key={ind}
                                                  >
                                                    <label>
                                                      {element.legDetails.origin} &rarr;{' '}
                                                      {element.legDetails.destination}
                                                    </label>
                                                    <Select
                                                      options={[
                                                        {
                                                          value: {
                                                            legKey: element.legKey,
                                                          },
                                                          label: 'No Preference',
                                                        },
                                                        ...element?.ssrs
                                                          .filter(
                                                            (el) => el.ssrType === 2
                                                          )
                                                          .map((el) => ({
                                                            value: {
                                                              ...el,
                                                              legKey: element.legKey,
                                                            },
                                                            label:
                                                              el.name +
                                                              ' - ' +
                                                              Object.values(
                                                                el.passengersAvailability
                                                              )[0].price.toLocaleString(
                                                                'en-IN',
                                                                {
                                                                  maximumFractionDigits: 0,
                                                                  style: 'currency',
                                                                  currency: 'INR',
                                                                }
                                                              ),
                                                          })),
                                                      ]}
                                                      defaultValue={{
                                                        value: {
                                                          legKey: element.legKey,
                                                        },
                                                        label: 'No Preference',
                                                      }}
                                                      // value={element.seat_preference}
                                                      onChange={(id) =>
                                                        setTravellerInfo((prev) => {
                                                          for (let traveller of prev) {
                                                            if (
                                                              traveller.id === travl.id
                                                            ) {
                                                              if (
                                                                traveller.trip_meals[key]
                                                              ) {
                                                                let exists = false;
                                                                for (
                                                                  let i = 0;
                                                                  i <
                                                                  traveller.trip_meals[
                                                                    key
                                                                  ].length;
                                                                  i++
                                                                ) {
                                                                  if (
                                                                    element.legKey ===
                                                                    traveller.trip_meals[
                                                                      key
                                                                    ][i].value.legKey
                                                                  ) {
                                                                    traveller.trip_meals[
                                                                      key
                                                                    ][i] = id;
                                                                    exists = true;
                                                                  }
                                                                }
                                                                if (!exists) {
                                                                  traveller.trip_meals[
                                                                    key
                                                                  ].push(id);
                                                                }
                                                              } else {
                                                                traveller.trip_meals[
                                                                  key
                                                                ] = [id];
                                                              }
                                                            }
                                                          }
                                                          return [...prev];
                                                        })
                                                      }
                                                    />
                                                  </div>
                                                ) : (
                                                  <></>
                                                )}
                                              </>
                                            )
                                          )}
                                        {/* AD */}
                                        {value.provider === 'ad' && (
                                          <div className='form-input-select'>
                                            <label>{amadeusLabel}</label>
                                            <Select
                                              options={amadeusMealOptions}
                                              defaultValue={
                                                travl.meal_preference
                                                  ? amadeusMealOptions.map((meal) => {
                                                      if (
                                                        meal.value ===
                                                        travl.meal_preference
                                                      ) {
                                                        return meal;
                                                      }
                                                    })
                                                  : {
                                                      value: '_',
                                                      label: 'No Preference',
                                                    }
                                              }
                                              // value={element.seat_preference}
                                              onChange={(id) =>
                                                setTravellerInfo((prev) => {
                                                  for (let traveller of prev) {
                                                    if (traveller.id === travl.id) {
                                                      traveller.trip_meals[key] = [id];
                                                    }
                                                  }
                                                  return [...prev];
                                                })
                                              }
                                            />
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </>
                                );
                              })}
                            </div>
                          </div>
                        );
                    })}
                  </div>
                </div>
                {/* Proceed To Review */}
                <div className='d-flex col-12 justify-end'>
                  <button
                    disabled={isProgress}
                    className='button -dark-1 px-30 h-50 bg-blue-1 text-white col-4 mt-20'
                    onClick={() => onClick()}
                  >
                    Confirm and Book
                  </button>
                </div>
              </div>
              {/* Booking Details */}
              <div className='col-xl-3 col-lg-4 mt-20'>
                <div className='col-12 px-20 py-20 border-light rounded-4 bg-white'>
                  <div className='text-20 fw-500'>Your booking details</div>
                  <div className=''>
                    <h4 className=''>Travellers</h4>
                    <ul className='list-disc'>
                      {travellerInfo.map((traveller, index) => (
                        <li key={index}>{traveller.aliases[0]}</li>
                      ))}
                    </ul>
                    <div className='border-top-light mt-10 mb-10' />
                    <h4 className=''>Segments</h4>
                    <ul className='list-disc'>
                      {Object.entries(selectedBookings).map(([key, value], index) => {
                        if (value)
                          return (
                            <>
                              {value.segments.map((seg, segI) => (
                                <li key={segI}>
                                  {seg.departure.airport.code} &rarr;{' '}
                                  {seg.arrival.airport.code}{' '}
                                  {new Date(seg.departure.time).toString().slice(4, 15)}
                                </li>
                              ))}
                              {selectedBookings?.to &&
                                selectedBookings?.from &&
                                key === 'to' && (
                                  <div
                                    style={{ borderTop: '1px dotted lightgray' }}
                                    className='mt-5 mb-5'
                                  />
                                )}
                            </>
                          );
                      })}
                    </ul>
                    <div className='border-top-light mt-10 mb-10' />
                    <h4 className=''>Fare Breakdown</h4>
                    {breakdown && (
                      <>
                        {Object.entries(breakdown).map(([key, value], index) => (
                          <div className='d-flex justify-between' key={index}>
                            <span className='fw-500'>{key}: </span>
                            {value.toLocaleString('en-IN', {
                              maximumFractionDigits: 0,
                              style: 'currency',
                              currency: 'INR',
                            })}
                          </div>
                        ))}
                        <div
                          className='border-top-light mt-5 mb-5'
                          style={{ borderTop: '1px dotted lightgray' }}
                        />
                        <div className='d-flex justify-between'>
                          <span className='fw-500'>Total: </span>
                          {total(breakdown).toLocaleString('en-IN', {
                            maximumFractionDigits: 0,
                            style: 'currency',
                            currency: 'INR',
                          })}
                        </div>
                      </>
                    )}
                  </div>
                  {client_id === 1 && (
                    <div className=''>
                      <div className='border-top-light mt-15 mb-10' />
                      <h4 className='d-flex items-center justify-between'>
                        <div className='text-20 fw-500'>Invoice Details</div>
                        <span
                          className='text-16 pb-5 cursor-pointer text-blue-1'
                          onClick={() => setInvoiceDetailsExpand((prev) => !prev)}
                        >
                          {invoiceDetailsExpand ? <FaMinus /> : <FaPlus />}
                        </span>
                      </h4>
                      {PNR &&
                        invoiceDetailsExpand &&
                        Object.entries(PNR).map(([key, value], i) => {
                          if (value)
                            return (
                              <>
                                <div className='text-20 fw-500'>
                                  {key === 'to'
                                    ? 'Onward Trip'
                                    : key === 'from'
                                    ? 'Return Trip'
                                    : 'Onward & Return Trip'}
                                </div>
                                <div className='form-checkbox d-flex items-center'>
                                  <input
                                    type='checkbox'
                                    name='name'
                                    checked={value.hide_fare}
                                    onClick={() => {
                                      setPNR((prev) => {
                                        prev[key].hide_fare = !prev[key].hide_fare;
                                        return { ...prev };
                                      });
                                    }}
                                  />
                                  <div className='form-checkbox__mark'>
                                    <div className='form-checkbox__icon icon-check' />
                                  </div>
                                  <div className='ml-10'>Hide Fare</div>
                                </div>
                                <div className='form-checkbox d-flex items-center'>
                                  <input
                                    type='checkbox'
                                    name='name'
                                    checked={value.via_intermediary}
                                    onClick={() => {
                                      setPNR((prev) => {
                                        prev[key].via_intermediary =
                                          !prev[key].via_intermediary;
                                        return { ...prev };
                                      });
                                    }}
                                  />
                                  <div className='form-checkbox__mark'>
                                    <div className='form-checkbox__icon icon-check' />
                                  </div>
                                  <div className='ml-10'>Via Intermediary</div>
                                </div>
                                <div className='form-checkbox d-flex items-center'>
                                  <input
                                    type='checkbox'
                                    name='name'
                                    checked={value.email_travellers}
                                    onClick={() => {
                                      setPNR((prev) => {
                                        prev[key].email_travellers =
                                          !prev[key].email_travellers;
                                        return { ...prev };
                                      });
                                    }}
                                  />
                                  <div className='form-checkbox__mark'>
                                    <div className='form-checkbox__icon icon-check' />
                                  </div>
                                  <div className='ml-10'>Email Travellers</div>
                                </div>
                                {travellerInfo.map((traveller, index) => {
                                  const age = (
                                    (Date.now() -
                                      +new DateObject({
                                        date: traveller?.passport_dob,
                                        format: 'YYYY-MM-DD',
                                      })
                                        .toDate()
                                        .getTime()) /
                                    31536000000
                                  ).toFixed(2);
                                  if (age >= 2)
                                    return (
                                      <div>
                                        <span className='d-block fw-500'>
                                          {traveller.aliases[0]}
                                        </span>
                                        <div className=''>
                                          <div className='form-input'>
                                            <input
                                              onChange={(e) =>
                                                setTravellerInfo((prev) => {
                                                  prev[index].quoted_amount[key] =
                                                    e.target.value;
                                                  return [...prev];
                                                })
                                              }
                                              value={traveller.quoted_amount[key]}
                                              placeholder=' '
                                              type='number'
                                              onWheel={(e) => e.target.blur()}
                                              required
                                            />
                                            <label className='lh-1 text-16 text-light-1'>
                                              Quoted Amount
                                            </label>
                                          </div>
                                        </div>
                                        {value?.via_intermediary && (
                                          <div className='mt-5'>
                                            <div className='form-input'>
                                              <input
                                                onChange={(e) =>
                                                  setTravellerInfo((prev) => {
                                                    prev[index].intermediary_quoted[key] =
                                                      e.target.value;
                                                    return [...prev];
                                                  })
                                                }
                                                value={traveller.intermediary_quoted[key]}
                                                placeholder=' '
                                                type='number'
                                                onWheel={(e) => e.target.blur()}
                                                required
                                              />
                                              <label className='lh-1 text-16 text-light-1'>
                                                Intermediary Quoted Amount
                                              </label>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                })}
                              </>
                            );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        {/* Stage 1 */}
        {stage === 1 && (
          <div className='border-light rounded-4 px-20 py-20 bg-white'>
            <h2 className='text-center mb-20 d-flex items-center justify-center gap-2'>
              <TiTickOutline className='text-50 text-success' />{' '}
              {PNR.to &&
              PNR.from &&
              (bookingConfirmation.to === 'Failed' ||
                bookingConfirmation.from === 'Failed')
                ? '1/2 Bookings Successful'
                : 'Booking Successful'}
            </h2>
            {bookingConfirmation &&
              Object.entries(bookingConfirmation).map(([key, value], index) => {
                if (value) {
                  let tripType =
                    key === 'to'
                      ? 'Onward Trip'
                      : key === 'from'
                      ? 'Return Trip'
                      : 'Onward & Return Trip';
                  let bookingID;
                  let totalAmount;
                  let bookingStatus;
                  let tempObj = { 'Base Fare': 0, 'Taxes & Fee': 0 };
                  if (PNR[key] && value !== 'Failed') {
                    console.log('Booking Confirmation Value for', PNR[key].provider, value);
                    if (PNR[key].provider === 'tj' || PNR[key].provider === 'aa') {
                      bookingID = 'TBD';
                      totalAmount = value?.quoted_amount;
                      bookingStatus = 'RECEIVED';
                      tempObj = {
                        'Flights': value.flightCost,
                        'Meals': value.mealCost,
                        'Seats': value.seatCost,
                      };
                    } else if (PNR[key].provider === 'ad') {
                      bookingID =
                        value.pnrHeader.reservationInfo.reservation.controlNumber;
                      totalAmount = getArray(
                        value.pricingRecordGroup.productPricingQuotationRecord
                      )
                        .map(
                          (e) => +e.documentDetailsGroup.totalFare.monetaryDetails.amount
                        )
                        .reduce((p, v) => p + v, 0);
                      bookingStatus = 'CONFIRMED';
                      for (let tst of getArray(value.tstData))
                        for (let fare of tst.fareData.monetaryInfo) {
                          if (fare.qualifier === 'F')
                            tempObj['Base Fare'] += +fare.amount;
                          if (fare.qualifier === 'T')
                            tempObj['Taxes & Fee'] += +fare.amount;
                        }
                      if (tempObj['Base Fare'] && tempObj['Taxes & Fee'])
                        tempObj['Taxes & Fee'] -= tempObj['Base Fare'];
                    }
                  }
                  return (
                    <div key={index}>
                      <h3>{tripType}</h3>
                      <div className='border-top-light mt-10' />
                      {value === 'Failed' ? (
                        <div className='row y-gap-20 items-center'>
                          <div className='col-md-6 text-center'>
                            <div className='text-15'>Booking Status</div>
                            <div className='fw-500 text-danger'>FAILED</div>
                          </div>
                          <div className='col-md-6 text-center'>
                            <div className='fw-500'>
                              <a
                                className='text-15 underline'
                                href='/flight/flight-list-v1'
                                target='_blank'
                              >
                                Search Other Flights
                              </a>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className='row y-gap-20'>
                          <div className='col-md-4 text-center'>
                            <div className='text-15'>Booking ID</div>
                            <div className='fw-500'>{bookingID}</div>
                          </div>
                          <div className='col-md-4 text-center'>
                            <div className='text-15'>Booking Status</div>
                            <div className='fw-500'>{bookingStatus}</div>
                          </div>
                          <div className='col-md-4 text-center'>
                            <div className='text-15'>Total Amount</div>
                            <div className='fw-500'>
                              {totalAmount &&
                                (+totalAmount).toLocaleString('en-IN', {
                                  maximumFractionDigits: 0,
                                  style: 'currency',
                                  currency: 'INR',
                                })}
                            </div>
                          </div>
                        </div>
                      )}
                      {PNR[key].provider !== 'ad' && (
                        <h6 className='mt-2 text-center'>
                          We've received your booking request. You'll receive booking
                          details shortly.
                        </h6>
                      )}
                      <div className='mb-20 border-light mt-20'>
                        <FlightProperty
                          alreadyExpanded
                          element={selectedBookings[key]}
                          isSelectedBooking
                          showPrice={false}
                        />
                      </div>
                      {value !== 'Failed' && (
                        <div className='row mt-8 y-gap-20 mb-20'>
                          <div>
                            <div className='text-15'>Price Breakdown</div>
                            <div className="row">
                            {Object.entries(tempObj).map(([key, value], i) => (
                              <>
                                {value && value > 0 ? (
                                  <div className='col-md-2' key={i}>
                                    <span className='fw-500'>{key}</span>:{' '}
                                    {value?.toLocaleString('en-IN', {
                                      maximumFractionDigits: 0,
                                      style: 'currency',
                                      currency: 'INR',
                                    })}
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </>
                            ))}
                            </div>
                            <div className='text-15'>Traveller Details</div>
                            <div className='overflow-scroll scroll-bar-1'>
                              <table className='table-3' style={{ minHeight: '100px' }}>
                                <thead>
                                  <th>Name</th>
                                  <th>Segment</th>
                                  <th>Meal Selected</th>
                                  <th>Seats Selected</th>
                                </thead>
                                <tbody key={index}>
                                  {travellerInfo.map((traveller, index) => {
                                    let meal = [];
                                    let seat = [];
                                    let segments = [];
                                    if (selectedBookings[key]) {
                                      for (let seg of selectedBookings[key].segments) {
                                        segments.push(
                                          `${seg.departure.airport.code}-${seg.arrival.airport.code}`
                                        );
                                      }
                                    }
                                    if (seatMap[key]) {
                                      /* if (seatMap[key].provider === 'tj') {
                                        for (let travl of value.data.itemInfos.AIR
                                          .travellerInfos) {
                                          if (
                                            travl.fN === traveller.first_name &&
                                            travl.lN === traveller.last_name
                                          ) {
                                            // Meal
                                            if (travl?.ssrMealInfos)
                                              for (let [
                                                mealKey,
                                                mealValue,
                                              ] of Object.entries(travl.ssrMealInfos)) {
                                                meal.push({ [mealKey]: mealValue.desc });
                                              }
                                            // Seat
                                            if (travl?.ssrSeatInfos)
                                              for (let [
                                                seatKey,
                                                seatValue,
                                              ] of Object.entries(travl?.ssrSeatInfos)) {
                                                seat.push({ [seatKey]: seatValue.code });
                                              }
                                          }
                                        }
                                      } else if (seatMap[key].provider === 'aa') {
                                        // Traveller Key
                                        let p;
                                        for (let pax of PNR[key].data.pax) {
                                          if (
                                            pax.name.first === traveller.first_name &&
                                            pax.name.last === traveller.last_name &&
                                            traveller.passport_dob === pax.dob
                                          )
                                            p = pax.key;
                                        }
                                        for (let journey of value?.journeys) {
                                          for (let segment of journey?.segments) {
                                            if (segment?.passengerSegment) {
                                              let desig =
                                                segment.designator.origin +
                                                '-' +
                                                segment.designator.destination;
                                              for (let [
                                                segKey,
                                                segValue,
                                              ] of Object.entries(
                                                segment?.passengerSegment
                                              )) {
                                                if (segKey === p) {
                                                  // Meals
                                                  if (
                                                    segValue?.seats &&
                                                    segValue?.seats.length > 0
                                                  )
                                                    seat.push({
                                                      [desig]:
                                                        segValue.seats[0].unitDesignator,
                                                    });
                                                  // Seats
                                                  if (
                                                    segValue?.ssrs &&
                                                    segValue?.ssrs.length > 0
                                                  ) {
                                                    let label;
                                                    if (traveller.trip_meals[key]) {
                                                      for (let meal of traveller
                                                        .trip_meals[key]) {
                                                        if (
                                                          meal.value.ssrCode ===
                                                          segValue.ssrs[0].ssrCode
                                                        )
                                                          label = meal.value.name;
                                                      }
                                                    }
                                                    meal.push({
                                                      [desig]:
                                                        label || segValue.ssrs[0].ssrCode,
                                                    });
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      } else */ if (seatMap[key].provider === 'ad') {
                                        // PAX
                                        let p;
                                        for (let trav of PNR[key].data.travellers) {
                                          if (trav.id === traveller.id) p = trav.paxRef;
                                        }
                                        if (p) {
                                          // Meals
                                          for (let data of value.dataElementsMaster
                                            .dataElementsIndiv) {
                                            if (data?.serviceRequest) {
                                              let m;
                                              let s;
                                              let st;
                                              // SSR Type And Who It Belongs To
                                              if (
                                                data?.referenceForDataElement
                                                  ?.reference &&
                                                data?.referenceForDataElement?.reference
                                                  ?.length > 0
                                              ) {
                                                for (let ref of data
                                                  ?.referenceForDataElement?.reference) {
                                                  // PT
                                                  if (ref?.qualifier === 'PT') {
                                                    if (p === +ref?.number) {
                                                      if (
                                                        data.serviceRequest.ssr.type ===
                                                        'RQST'
                                                      ) {
                                                        if (
                                                          data.serviceRequest?.ssrb?.data
                                                        ) {
                                                          st =
                                                            data.serviceRequest?.ssrb
                                                              ?.data;
                                                        }
                                                      } else {
                                                        for (let ml of amadeusMealOptions) {
                                                          if (
                                                            ml.value ===
                                                            data.serviceRequest.ssr.type
                                                          )
                                                            m = ml.label;
                                                        }
                                                      }
                                                    }
                                                  }
                                                  // ST
                                                  if (ref?.qualifier === 'ST') {
                                                    for (let [
                                                      segKey,
                                                      segVal,
                                                    ] of Object.entries(
                                                      PNR[key].data.segments
                                                    )) {
                                                      if (+segKey === +ref.number) {
                                                        s = `${segVal.from}-${segVal.to}`;
                                                      }
                                                    }
                                                  }
                                                  if (m && s) {
                                                    meal.push({ [s]: m });
                                                  }
                                                  if (st && s) {
                                                    seat.push({ [s]: st });
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      } else {
                                        segments.forEach((s, idx) => {
                                          const m = traveller.trip_meals[key][idx]?.label;
                                          if (m) {
                                            meal.push({ [s]: m });
                                          }
                                          const st = value.travellers?.filter(x => x.traveller_id === traveller.id)[0]?.seats[idx]?.code;
                                          if (st) {
                                            seat.push({ [s]: st });
                                          }
                                        });
                                      }
                                    }
                                    return (
                                      <>
                                        {segments.map((seg, segIn) => (
                                          <tr key={segIn}>
                                            <td>
                                              {traveller.prefix?.label}{' '}
                                              {traveller.first_name} {traveller.last_name}
                                            </td>
                                            <td>{seg}</td>
                                            {meal && meal.length > 0 ? (
                                              <td>
                                                {meal
                                                  .filter(
                                                    (m) => Object.keys(m)[0] === seg
                                                  )
                                                  .map((m) => {
                                                    let value =
                                                      Object.values(m)[0];
                                                    return <>{value}</>;
                                                  })}
                                              </td>
                                            ) : (
                                              <td>No Meal Selected</td>
                                            )}
                                            {seat && seat.length > 0 ? (
                                              <td>
                                                {seat
                                                  .filter(
                                                    (s) => Object.keys(s)[0] === seg
                                                  )
                                                  .map((s) => {
                                                    let value =
                                                      Object.values(s)[0];
                                                    return <>{value}</>;
                                                  })}
                                              </td>
                                            ) : (
                                              <td>No Seat Selected</td>
                                            )}
                                          </tr>
                                        ))}
                                      </>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              })}
          </div>
        )}
      </div>
    </section>
  );
}
export default Seatmap;

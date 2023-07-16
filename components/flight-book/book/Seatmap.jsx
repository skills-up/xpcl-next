import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { createItem, customAPICall } from '../../../api/xplorzApi';
import { sendToast } from '../../../utils/toastify';
import Seat from '../common/Seat';
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { DateObject } from 'react-multi-date-picker';
import Select from 'react-select';
import { aaSeatMap, adSeatMap } from '../../../pages/test/temp';
import parse from 'html-react-parser';

function Seatmap({ seatMaps, PNRS, travellerInfos }) {
  const [PNR, setPNR] = PNRS;
  const [seatMap, setSeatMap] = seatMaps;
  const travellers = useSelector((state) => state.flightSearch.value.travellers);
  const selectedBookings = useSelector(
    (state) => state.flightSearch.value.selectedBookings
  );
  const travellerDOBS = useSelector((state) => state.flightSearch.value.travellerDOBS);
  const [travellerInfo, setTravellerInfo] = travellerInfos;
  // Fetch Flight Details for PNRs
  // Save Them To Seatmaps
  // Display Seatmaps

  const router = useRouter();

  let getArray = (x) => {
    return x ? (Array.isArray(x) ? x : [x]) : [];
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    console.log('Seatmap', seatMap);
  }, [seatMap]);

  // Fetching Seatmaps for PNRS
  const getData = async () => {
    if (PNR) {
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
            for (let [segKey, segValue] of Object.entries(value?.data?.segments)) {
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
            }
          }
          if (!response?.success) {
            sendToast('error', 'Could not fetch seatmap', 4000);
            // router.back();
          }
        }
      }
      setSeatMap(tempDat);
      setPNR(tempPNR);
      setTravellerInfo((prev) =>
        prev.map((el) => ({
          ...el,
          trip_meals: { from: null, to: null, combined: null },
        }))
      );
    }
  };

  useEffect(() => console.log('traveller', travellerInfo), [travellerInfo]);

  // On Click
  const onClick = async () => {
    for (let [key, value] of Object.entries(PNR)) {
      if (value) {
        // TJ
        if (value.provider === 'tj') {
          // PAX
          let pax = [];
          let seatCost = 0;
          let mealCost = 0;
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
            if (age < 2) tempObj['code'] = 'INF';
            // If above 2 but below 12, child
            if (age >= 2 && age < 12) tempObj['code'] = 'CHD';
            // If above 12 years, consider adult
            if (age >= 12) tempObj['code'] = 'ADT';
            // Name
            tempObj['name'] = {
              title: traveller?.prefix?.value
                ? traveller.prefix.value !== 'MSTR'
                  ? traveller.prefix.value
                  : 'MASTER'
                : traveller?.prefix,
              first: traveller?.first_name,
              last: traveller?.last_name,
              middle: traveller?.middle_name || undefined,
            };
            // DOB
            tempObj['dob'] = traveller?.passport_dob;
            // // Passport
            // if(traveller.passport_number && traveller.)
            // tempObj['passport'] = {
            //   number: traveller?.passport_number || undefined,
            //   countryCode: ,
            //   issueDate: ,
            //   expiryDate: ,
            // }
            // Seats
            let seats = [];
            for (let [k, v] of Object.entries(seatMap[key]?.data?.seatMap)) {
              if (v.travellers && v.travellers.length > 0) {
                for (let trav of v.travellers) {
                  if (trav.traveller_id === traveller.id && tempObj['code'] !== 'INF') {
                    seats.push({ key: k, code: trav.seatNo });
                    seatCost += trav.amount;
                  }
                }
              }
            }
            if (seats.length > 0) tempObj['seats'] = seats;
            // Meals
            let meals = [];
            if (traveller.trip_meals[key]) {
              for (let meal of traveller.trip_meals[key]) {
                if (meal.value.id && meal.value.code && tempObj['code'] !== 'INF') {
                  meals.push({ key: meal.value.id, code: meal.value.code });
                  mealCost += meal.value?.amount || 0;
                }
              }
            }
            if (meals.length > 0) tempObj['meals'] = meals;
            pax.push(tempObj);
          }
          // Total  Amount (base amt + seats cost + meals cost)
          const totalCost = selectedBookings[key].total + seatCost + mealCost;
          console.log('meal cost', mealCost, 'seat cost', seatCost);
          const response = await customAPICall(
            'tj/v1/book',
            'post',
            {
              pax,
              bookingId: value.data?.bookingId,
              amount: totalCost,
            },
            {},
            true
          );
          if (response?.success) {
            console.log('booking successful');
          }
        }
        // AA
        if (value.provider === 'aa') {
          // SSR Bookings
          let ssrsTotal = 0;
          let ssrs = [];
          for (let traveller of travellerInfo) {
            if (traveller.trip_meals[key]) {
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
                  ssrs.push({
                    count: 1,
                    key: Object.values(meal.value.passengersAvailability)[0].ssrKey,
                  });
                  ssrsTotal += Object.values(meal.value.passengersAvailability)[0].price;
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
          }
          // Seat Bookings (Per Segment Per Traveller)
          let seatTotal = 0;
          for (let pax of value.data.pax) {
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
              amount: total,
            },
            {},
            true
          );
        }
        // AD
        // Reserving Seats
        if (value.provider === 'ad') {
          let seatRequested = false;
          const sessionKey = value.data.session_key;
          if (seatMap[key]?.data) {
            for (let seg of seatMap[key].data) {
              if (seg.travellers) {
                let tempSeg = [];
                for (let traveller of seg.travellers) {
                  for (let trav of value.data.travellers) {
                    if (traveller.id === trav.id) {
                      tempSeg.push({ seatNumber: traveller.seatNo, paxRef: trav.paxRef });
                    }
                  }
                }
                if (tempSeg.length > 0) {
                  seatRequested = true;
                  let seatBook = await createItem('flights/reserve-seats', {
                    session_key: sessionKey,
                    segRef: seg.segKey,
                    seats: tempSeg,
                  });
                }
              }
            }
          }
          // Finalize Booking
          const frequentFliers = [];
          const mealRequests = [];
          for (let traveller of travellerInfo) {
            let paxRef;
            for (let trav of value.data.travellers) {
              if (traveller.id === trav.id) {
                paxRef = trav.paxRef;
              }
            }
            if (
              traveller?.frequentFliers?.value &&
              traveller.membershipID.trim().length > 0
            ) {
              frequentFliers.push({
                paxRef,
                code: traveller.frequentFliers.value,
                number: traveller.membershipID,
              });
            }
            if (traveller.trip_meals[key] && traveller.trip_meals[key].length > 0) {
              if (traveller.trip_meals[key][0]?.value) {
                let found = false;
                for (let meal of mealRequests) {
                  if (meal.type === traveller.trip_meals[key][0]?.value) {
                    found = true;
                    meal.paxRefs.push(paxRef);
                  }
                }
                if (!found) {
                  mealRequests.push({
                    type: traveller.trip_meals[key][0]?.value,
                    paxRefs: [paxRef],
                  });
                }
              }
            }
          }
          const booking = await createItem('flights/issue-tickets', {
            session_key: sessionKey,
            airline: Object.values(value.data.segments)[0].companyCode,
            seatRequested,
            frequentFliers,
            mealRequests,
          });
        }
      }
    }
  };

  // AA Seatmap
  const AASeatMapRender = ({ data, type }) => {
    return (
      <div>
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
            <div key={ind} className='aa-seatmap mb-20'>
              <h2 className='mb-20'>
                {el.seatMap.departureStation} &rarr; {el.seatMap.arrivalStation}
              </h2>
              {/* Legend */}
              <div className='d-inline-block bg-light-2 pt-10 px-20 mb-20'>
                <h4 className='text-center mb-10'>Legend</h4>
                <div className='d-flex gap-3 text-center'>
                  <span className='d-flex flex-column items-center'>
                    <Seat label={''} fill={'#FF0000'} />
                    <span
                      style={{
                        fontWeight: '700',
                        maxWidth: '100px',
                        display: 'inline-block',
                      }}
                    >
                      Booked
                    </span>
                  </span>
                  <span className='d-flex flex-column items-center'>
                    <Seat label={''} fill={'#4CBB17'} clickable />
                    <span
                      style={{
                        fontWeight: '700',
                        maxWidth: '100px',
                        display: 'inline-block',
                      }}
                    >
                      Selected
                    </span>
                  </span>
                  <span className='d-flex flex-column items-center'>
                    <Seat label={''} fill={'#FFA500'} clickable />
                    <span
                      style={{
                        fontWeight: '700',
                        maxWidth: '100px',
                        display: 'inline-block',
                      }}
                    >
                      Book With Extra Costs
                    </span>
                  </span>
                  <span className='d-flex flex-column items-center'>
                    <Seat label={''} fill={'#000'} clickable />
                    <span
                      style={{
                        fontWeight: '700',
                        maxWidth: '100px',
                        display: 'inline-block',
                      }}
                    >
                      Book Without Extra Costs
                    </span>
                  </span>
                </div>
                <div className='row my-3'>
                  {travellerInfo.map((trav, travInd) => {
                    let seatSelected = '';
                    if (el.seatMap?.travellers)
                      for (let travl of el.seatMap?.travellers)
                        if (travl.id === trav.id) seatSelected = travl?.designator || '';
                    return (
                      <span
                        style={{ fontWeight: 'bold' }}
                        className='d-block col-auto'
                        key={travInd}
                      >
                        <span>{trav?.aliases[0]}</span>{' '}
                        <span
                          className='text-primary d-inline-block'
                          style={{ width: '40px' }}
                        >
                          - {seatSelected ? seatSelected : 'NA'}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
              {/* Iterating Decks */}
              {Object.entries(el.seatMap.decks).map(([deckKey, deckVal], deckIn) => {
                return (
                  <div key={deckIn}>
                    {Object.entries(deckVal.compartments).map(
                      ([compKey, compVal], compIn) => {
                        // X - 1-2, 3-4
                        // Y -
                        // Preprocessing
                        let width = compVal.width;
                        let length = compVal.length;
                        let emptyCol = [];
                        let rowIndicator = [];
                        let extraCols = [];
                        for (let i = 1; i < width - 1; i++) {
                          if (!emptyCol.includes(Math.ceil(i / 2)) && i % 2 !== 0) {
                            emptyCol.push(i);
                          }
                        }
                        // 3D Array
                        let newArr = [];
                        // Null Values 3D
                        for (let l = 0; l <= length; l++) {
                          let tempArr = [];
                          for (let w = 0; w <= width; w++) {
                            tempArr.push(null);
                          }
                          newArr.push(tempArr);
                        }
                        // Adding New Values + Extra Logic
                        let currentRow = 1;
                        for (let seat of compVal.units) {
                          if (seat.type === 1 || seat.type === 2 || seat.type === 20) {
                            // Exit
                            if (seat.type === 20) {
                              newArr[seat.y][seat.x] = seat;
                              extraCols.push(seat.y);
                            }
                            // Normal Seats
                            if (seat.type === 1 || seat.type === 2) {
                              newArr[seat.y][seat.x] = seat;
                              // Getting Empty Column
                              let emptyIn = emptyCol.indexOf(seat.x);
                              if (emptyIn !== -1) emptyCol.splice(emptyIn, 1);
                              // Row Indicator
                              let found = false;
                              for (let indic of rowIndicator) {
                                if (seat.y === indic.y) found = true;
                              }
                              if (!found) {
                                rowIndicator.push({ y: seat.y, row: currentRow });
                                currentRow++;
                              }
                            }
                          }
                        }
                        return (
                          <table key={compIn}>
                            {/* Iterating Seats */}
                            {newArr.map((rowEl, rowInd) => (
                              <tr
                                key={rowInd}
                                className={`${extraCols.includes(rowInd) ? 'extra' : ''}`}
                              >
                                {rowEl.map((element, index) => {
                                  let group = null;
                                  for (let grp of groupFeeArr) {
                                    if (element?.group === grp.group && grp.amount > 0) {
                                      group = grp;
                                    }
                                  }
                                  let row = null;
                                  if (!element) {
                                    for (let indic of rowIndicator) {
                                      if (rowInd === indic.y) {
                                        row = indic.row;
                                      }
                                    }
                                  }
                                  return (
                                    <>
                                      {element ? (
                                        element.type === 20 ? (
                                          <td
                                            colSpan={element?.width || 1}
                                            rowSpan={element?.height || 1}
                                          ></td>
                                        ) : (
                                          <td
                                            colSpan={element?.width || 1}
                                            rowSpan={element?.height || 1}
                                          >
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
                                                        maximumFractionDigits: 2,
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
                                                label={element?.designator
                                                  .split('')
                                                  .at(-1)}
                                                fill={
                                                  !element.assignable
                                                    ? '#FF0000'
                                                    : element?.isSelected
                                                    ? '#4CBB17'
                                                    : group?.amount > 0
                                                    ? '#FFA500'
                                                    : undefined
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
                                                            for (let dat of prev[type]
                                                              ?.data[ind]?.seatMap?.decks[
                                                              deckKey
                                                            ]?.compartments[compKey]
                                                              ?.units) {
                                                              if (
                                                                dat?.designator ===
                                                                element?.designator
                                                              ) {
                                                                let travl = prev[type]
                                                                  ?.data[ind]?.seatMap[
                                                                  'travellers'
                                                                ]
                                                                  ? prev[type]?.data[ind]
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
                                                                    group?.amount || 0,
                                                                };
                                                                // If already selected, removing selected + traveller info on that seat
                                                                if (dat['isSelected']) {
                                                                  dat[
                                                                    'isSelected'
                                                                  ] = false;
                                                                  travl = travl.filter(
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
                                                                      travellers.length
                                                                    ) {
                                                                      travl.push({
                                                                        ...travl[0],
                                                                        ...add,
                                                                      });
                                                                      prev[type].data[
                                                                        ind
                                                                      ].seatMap.decks[
                                                                        deckKey
                                                                      ].compartments[
                                                                        compKey
                                                                      ].units = prev[
                                                                        type
                                                                      ]?.data[
                                                                        ind
                                                                      ]?.seatMap?.decks[
                                                                        deckKey
                                                                      ]?.compartments[
                                                                        compKey
                                                                      ]?.units.map((s) =>
                                                                        s.designator ===
                                                                        travl[0]
                                                                          .designator
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
                                                                      for (let x of travellerInfo) {
                                                                        let match = false;
                                                                        for (let y of travl) {
                                                                          if (
                                                                            y.id === x.id
                                                                          ) {
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
                                                                        ...travellers[0],
                                                                        ...add,
                                                                      },
                                                                    ];
                                                                  }
                                                                }
                                                                prev[type].data[
                                                                  ind
                                                                ].seatMap['travellers'] =
                                                                  travl;
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
                                              <ReactTooltip id={element.designator} />
                                            )}
                                          </td>
                                        )
                                      ) : emptyCol.includes(index) && row ? (
                                        <td>
                                          <span>{row}</span>
                                        </td>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  );
                                })}
                              </tr>
                            ))}
                          </table>
                        );
                      }
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  // TJ Seatmap
  const TJSeatMapRender = ({ data, type }) => {
    return (
      <div>
        {Object.entries(data?.seatMap).map(([key, value], index) => {
          // 3D Array
          let newArr = [];
          let aisleArr = [];
          if (value) {
            const columnLimit = value?.sData?.column;
            const rowLimit = value?.sData?.row;
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
            <div className='tj-seatmap mb-20' key={index}>
              <h2 className='mb-20'>
                {selectedBookings[type].segments[index].departure.airport.code} &rarr;{' '}
                {selectedBookings[type].segments[index].arrival.airport.code}
              </h2>
              {/* Legend */}
              <div className='d-inline-block bg-light-2 pt-10 px-20 mb-20'>
                <h4 className='text-center mb-10'>Legend</h4>
                <div className='d-flex gap-3 text-center'>
                  <span className='d-flex flex-column items-center'>
                    <Seat label={''} fill={'#FF0000'} />
                    <span
                      style={{
                        fontWeight: '700',
                        maxWidth: '100px',
                        display: 'inline-block',
                      }}
                    >
                      Booked
                    </span>
                  </span>
                  <span className='d-flex flex-column items-center'>
                    <Seat label={''} fill={'#4CBB17'} clickable />
                    <span
                      style={{
                        fontWeight: '700',
                        maxWidth: '100px',
                        display: 'inline-block',
                      }}
                    >
                      Selected
                    </span>
                  </span>
                  <span className='d-flex flex-column items-center'>
                    <Seat label={''} fill={'#FFA500'} clickable />
                    <span
                      style={{
                        fontWeight: '700',
                        maxWidth: '100px',
                        display: 'inline-block',
                      }}
                    >
                      Book With Extra Costs
                    </span>
                  </span>
                  <span className='d-flex flex-column items-center'>
                    <Seat label={''} fill={'#000'} clickable />
                    <span
                      style={{
                        fontWeight: '700',
                        maxWidth: '100px',
                        display: 'inline-block',
                      }}
                    >
                      Book Without Extra Costs
                    </span>
                  </span>
                </div>
                <div className='row my-3'>
                  {travellers.map((trav, travInd) => {
                    let seatSelected = '';
                    if (value?.travellers)
                      for (let travl of value?.travellers)
                        if (travl.label === trav.label)
                          seatSelected = travl?.seatNo || '';
                    return (
                      <span
                        style={{ fontWeight: 'bold' }}
                        className='d-block col-auto'
                        key={index}
                      >
                        <span>{trav?.label}</span>{' '}
                        <span
                          className='text-primary d-inline-block'
                          style={{ width: '40px' }}
                        >
                          - {seatSelected ? seatSelected : 'NA'}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
              {/* Seatmap */}
              {newArr &&
                newArr.length > 0 &&
                newArr.map((element, ind) => {
                  return (
                    <div key={ind} className='tj-grid'>
                      {element.map((el, i) =>
                        el ? (
                          <>
                            <a
                              data-tooltip-id={
                                el.amount > 0 && !el.isBooked ? el.seatNo : undefined
                              }
                              data-tooltip-content={
                                el.amount > 0 && !el.isBooked
                                  ? `Amount - ${el.amount.toLocaleString('en-IN', {
                                      maximumFractionDigits: 2,
                                      style: 'currency',
                                      currency: 'INR',
                                    })}`
                                  : undefined
                              }
                              data-tooltip-place='top'
                            >
                              <Seat
                                key={i}
                                label={el.seatNo.split('').at(-1)}
                                fill={
                                  el.isBooked
                                    ? '#FF0000'
                                    : el?.isSelected
                                    ? '#4CBB17'
                                    : el?.amount > 0
                                    ? '#FFA500'
                                    : undefined
                                }
                                clickable={el.isBooked ? false : true}
                                onClick={
                                  !el.isBooked
                                    ? () => {
                                        if (!el.isBooked) {
                                          // Adding / Removing Selected Seats
                                          setSeatMap((prev) => {
                                            for (let dat of prev[type].data.seatMap[key]
                                              ?.sInfo) {
                                              if (dat.seatNo === el.seatNo) {
                                                let travl = prev[type].data.seatMap[key][
                                                  'travellers'
                                                ]
                                                  ? prev[type].data.seatMap[key][
                                                      'travellers'
                                                    ]
                                                  : [];
                                                let add = {
                                                  seatNo: el.seatNo,
                                                  amount: el.amount,
                                                  id: key,
                                                };
                                                // If already selected, removing selected + traveller info on that seat
                                                if (dat['isSelected']) {
                                                  dat['isSelected'] = false;
                                                  travl = travl.filter(
                                                    (trav) => trav.seatNo !== el.seatNo
                                                  );
                                                }
                                                // If not selected, then we add traveller and seat info (if max seats are selected,)
                                                // Setting first traveller to new seat selected
                                                else {
                                                  dat['isSelected'] = true;
                                                  if (travl) {
                                                    if (
                                                      travl.length === travellers.length
                                                    ) {
                                                      travl.push({
                                                        ...travl[0],
                                                        ...add,
                                                      });
                                                      prev[type].data.seatMap[key].sInfo =
                                                        prev[type].data.seatMap[
                                                          key
                                                        ].sInfo.map((s) =>
                                                          s.seatNo === travl[0].seatNo
                                                            ? { ...s, isSelected: false }
                                                            : s
                                                        );
                                                      travl.splice(0, 1);
                                                    } else {
                                                      // Adding the first traveller in travellers that isnt added
                                                      let travlToAdd = false;
                                                      for (let x of travellers) {
                                                        let match = false;
                                                        for (let y of travl) {
                                                          if (y.value === x.value) {
                                                            match = true;
                                                          }
                                                        }
                                                        if (!match && !travlToAdd) {
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
                                                        ...travellers[0],
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
                            <ReactTooltip id={el.seatNo} />
                          </>
                        ) : (
                          <>
                            {aisleArr.includes(i) ? (
                              <span className='row-number'>{ind + 1}</span>
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
          );
        })}
      </div>
    );
  };

  const ADSeatMapRender = ({ data, type }) => {
    const reserveCodes = ['SO', 'BK', 'LA', 'G', 'GN', 'CL', 'ST', 'TA', '1', '8'];
    return (
      <>
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
            <div className='amadeus-container mt-30'>
              <h2 className='mb-20'>
                {d.flightDateInformation.boardPointDetails.trueLocationId} &rarr;{' '}
                {d.flightDateInformation.offpointDetails.trueLocationId}
              </h2>
              {d.upperDeckToggle !== null && d.upperDeckToggle !== undefined && (
                <button
                  className=' mb-30 btn btn-outline-dark'
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
              {/* Legend */}
              {/* <div>
          <table className='amadeus-table'>
            <tbody>
              <tr>
                <th colspan='2'>Legend</th>
              </tr>
              <tr>
                <td class='seat seat-sel'> &nbsp; </td>
                <td>Selected Seat</td>
              </tr>
              <tr>
                <td class='seat seat-O'> X </td>
                <td>Occupied Seat</td>
              </tr>
              <tr>
                <td class='seat seat-CH'> ₹ </td>
                <td>Paid Seat</td>
              </tr>
              <tr>
                <td class='seat seat-1'> &nbsp; </td>
                <td>Different Class / Reserved for Airport Check-In</td>
              </tr>
              <tr>
                <td class='seat seat-L'> &nbsp; </td>
                <td>Extra Leg Room Seat</td>
              </tr>
              <tr>
                <td class='seat seat-E'> &nbsp; </td>
                <td>Exit Row Preferred Seat</td>
              </tr>
              <tr>
                <td class='seat seat-OW'> &nbsp; </td>
                <td>Overwing Seat</td>
              </tr>
              <tr>
                <td class='seat seat-LA'> &nbsp; </td>
                <td>Lavatory</td>
              </tr>
              <tr>
                <td class='seat seat-AL'> &nbsp; </td>
                <td>Adjacent to Lavatory</td>
              </tr>
              <tr>
                <td class='seat seat-G'> &nbsp; </td>
                <td>Galley</td>
              </tr>
              <tr>
                <td class='seat seat-AG'> &nbsp; </td>
                <td>Adjacent to Galley</td>
              </tr>
              <tr>
                <td class='seat seat-1D'> &nbsp; </td>
                <td>Limited Recline Seat</td>
              </tr>
              <tr>
                <td class='seat seat-B'> &nbsp; </td>
                <td>Seat with Basinette</td>
              </tr>
              <tr>
                <td class='seat seat-BK'> &nbsp; </td>
                <td>Bulk Head</td>
              </tr>
              <tr>
                <td class='seat seat-SO'> &nbsp; </td>
                <td>Storage</td>
              </tr>
              <tr>
                <td class='seat seat-ST'> &nbsp; </td>
                <td>Stairs to Upper Deck</td>
              </tr>
              <tr>
                <td class='seat seat-GN'> &nbsp; </td>
                <td>Unavailable / Reserved for Other Usage</td>
              </tr>
            </tbody>
          </table>
        </div> */}
              {/* Iterating Cabins */}
              {getArray(seatmap.cabin).map((cabin, cabinIndex) => {
                const facilities = getArray(cabin.cabinFacilities || []);
                const compartment = cabin.compartmentDetails;
                const defSeatOcc =
                  compartment.defaultSeatOccupation || cabin.defaultSeatOccupation || 'F';
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
                  var otrFacDetails = getArray(fac.otherCabinFacilityDetails || []);
                  otrFacDetails.forEach((facDetails) => {
                    facLocation = getLocation(facDetails.location, spacers);
                    facObj[facLocation].push(facDetails.type);
                  });
                  facRow = '';
                  propIdx = 0;
                  currProp = 'L';
                  contObj = { L: '', C: '', R: '' };
                  for (let col of seatFormatArr) {
                    if (col == ' ') {
                      contObj[currProp] += '<td class="no-seat"></td>';
                      currProp = props[++propIdx];
                    } else {
                      var facility = facObj[currProp].shift();
                      if (facility) {
                        contObj[currProp] +=
                          '<td class="seat seat-' + facility + '"> &nbsp; </td>';
                      } else {
                        if (currProp == 'R') {
                          contObj[currProp] =
                            '<td class="no-seat"></td>' + contObj[currProp];
                        } else if (
                          currProp == 'C' &&
                          contObj[currProp].indexOf('</td><td') > 0
                        ) {
                          contObj[currProp] = contObj[currProp].replace(
                            '</td><td',
                            '</td><td class="no-seat"></td><td'
                          );
                        } else {
                          contObj[currProp] += '<td class="no-seat"></td>';
                        }
                      }
                    }
                  }
                  facRow = contObj['L'] + contObj['C'] + contObj['R'];
                  if (fac.rowLocation == 'F') {
                    facFront += '<tr><td></td>' + facRow + '</tr>';
                  } else {
                    facRear += '<tr><td></td>' + facRow + '</tr>';
                  }
                }

                let show = false;
                if (d.upperDeckToggle !== undefined && d.upperDeckToggle !== null) {
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
                      <tr>
                        <td></td>
                        {seatFormatArr.map((col) => (
                          <th className='col-name'>{col}</th>
                        ))}
                      </tr>
                      {parse(facFront)}
                      {/* cont */}
                      {rowRange.map((i, index) => {
                        const cabinRow = rows[currRow++];
                        if (cabinRow !== undefined) {
                          var rowBefore = '',
                            rowAfter = '';
                          const rowFacilities = getArray(cabinRow.cabinFacility || []);
                          rowFacilities.map((fac) => {
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

                            facRow = '';
                            propIdx = 0;
                            currProp = 'L';
                            contObj = { L: '', C: '', R: '' };
                            seatFormatArr.forEach((col) => {
                              if (col == ' ') {
                                contObj[currProp] += '<td class="no-seat"></td>';
                                currProp = props[++propIdx];
                              } else {
                                var facility = facObj[currProp].shift();
                                if (facility) {
                                  contObj[currProp] +=
                                    '<td class="seat seat-' +
                                    facility +
                                    '"> &nbsp; </td>';
                                } else {
                                  if (currProp == 'R') {
                                    contObj[currProp] =
                                      '<td class="no-seat"></td>' + contObj[currProp];
                                  } else if (
                                    currProp == 'C' &&
                                    contObj[currProp].indexOf('</td><td') > 0
                                  ) {
                                    contObj[currProp] = contObj[currProp].replace(
                                      '</td><td',
                                      '</td><td class="no-seat"></td><td'
                                    );
                                  } else {
                                    contObj[currProp] += '<td class="no-seat"></td>';
                                  }
                                }
                              }
                            });
                            facRow = contObj['L'] + contObj['C'] + contObj['R'];

                            if (fac.rowLocation == 'F') {
                              rowBefore += '<tr><td></td>' + facRow + '</tr>';
                            } else {
                              rowAfter += '<tr><td></td>' + facRow + '</tr>';
                            }
                          });
                          const row = cabinRow.rowDetails;
                          const rowNum = row.seatRowNumber || i;
                          var details = Object.assign(
                            {},
                            ...getArray(row.seatOccupationDetails).map((detail) => ({
                              [detail.seatColumn]: getArray(
                                detail.seatCharacteristic
                              ).concat(getArray(detail.seatOccupation)),
                            }))
                          );

                          return (
                            <>
                              {parse(rowBefore)}
                              <tr
                                className={`seat-row ${
                                  row.rowCharacteristicDetails
                                    ? 'row-type-' +
                                      row.rowCharacteristicDetails.rowCharacteristic
                                    : ''
                                }`}
                              >
                                <th className='row-number'>{rowNum}</th>
                                {seatFormatArr.map((col, colInd) => {
                                  if (col !== ' ') {
                                    var chars = details[col] || getArray(defSeatOcc);
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
                                      if (chars.indexOf('CH') >= 0) contents = '₹';
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
                                      !chars.includes('LA') &&
                                      !chars.includes('G');
                                    if (chars.indexOf('8') >= 0) {
                                      return <td key={colInd} className='no-seat' />;
                                    } else {
                                      return (
                                        <td
                                          className={`seat seat-${chars.join(' seat-')} ${
                                            seatSelected ? 'seat-sel' : ''
                                          } ${conditions ? 'cursor-pointer' : ''}`}
                                          onClick={() => {
                                            if (conditions) {
                                              // Seat Number = rowNum+col
                                              setSeatMap((prev) => {
                                                let add = {
                                                  amount: price,
                                                  seatNo: rowNum + col,
                                                };
                                                let travl =
                                                  prev[type]?.data[dIndex]?.travellers;
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
                                                      travellerInfo.length
                                                    ) {
                                                      travl.push({
                                                        ...travl[0],
                                                        ...add,
                                                      });
                                                      travl.splice(0, 1);
                                                    } else {
                                                      let travlToAdd = false;
                                                      for (let x of travellerInfo) {
                                                        let match = false;
                                                        for (let y of travl) {
                                                          if (y.id === x.id) {
                                                            match = true;
                                                          }
                                                        }
                                                        if (!match && !travlToAdd) {
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
                                                    { ...travellerInfo[0], ...add },
                                                  ];
                                                }
                                                prev[type].data[dIndex]['travellers'] =
                                                  travl;
                                                return { ...prev };
                                              });
                                            }
                                          }}
                                        >
                                          <a
                                            data-tooltip-id={
                                              conditions ? rowNum + col : undefined
                                            }
                                            data-tooltip-content={
                                              conditions
                                                ? `Amount - ${price.toLocaleString(
                                                    'en-IN',
                                                    {
                                                      maximumFractionDigits: 2,
                                                      style: 'currency',
                                                      currency: 'INR',
                                                    }
                                                  )}`
                                                : undefined
                                            }
                                            data-tooltip-place='top'
                                          >
                                            {contents}
                                          </a>
                                          <ReactTooltip id={rowNum + col} />
                                        </td>
                                      );
                                    }
                                  } else {
                                    return <td key={colInd} className='no-seat' />;
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
          );
        })}
      </>
    );
  };

  return (
    <section className='pt-40 pb-40 bg-light-2'>
      <div className='container'>
        <h1>Flight Seatmaps (Optional)</h1>
        {/* To */}
        {seatMap?.to?.data && (
          <>
            {seatMap.to && seatMap.from && <h2 className='mt-20'>Onward Seatmap</h2>}
            <div className='bg-white py-30 px-30 mt-20'>
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
            <h2 className='mt-20'>Return Seatmap</h2>
            <div className='bg-white py-30 px-30 mt-20'>
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
            <h2 className='mt-20'>Onward and Return Trip</h2>
            <div className='bg-white py-30 px-30 mt-20'>
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
        <h1 className='mt-30'>Review</h1>
        <div className='mt-10 bg-white px-20 py-20'>
          <h3>Meal Preferences (Optional)</h3>
          {/* Iterating Over Travellers */}
          {travellerInfo.map((travl, travlInd) => (
            <div key={travlInd} className='mt-10'>
              <h4>{travl.aliases[0]}</h4>
              {/* Iterating Over PNRS to get the segments */}
              {Object.entries(PNR).map(([key, value], index) => (
                <>
                  {value && (
                    <div key={index}>
                      {/* TJ */}
                      {value.provider === 'tj' &&
                        value.data?.data?.tripInfos?.[0].sI?.map((element, ind) => (
                          <>
                            {element?.ssrInfo?.MEAL ? (
                              <div className='col-md-6 form-input-select mt-10' key={ind}>
                                <label>
                                  {element.da.code} &rarr; {element.aa.code}
                                </label>
                                <Select
                                  options={[
                                    {
                                      value: {
                                        id: element.id,
                                      },
                                      label: 'No Preference',
                                    },
                                    ...element?.ssrInfo?.MEAL?.map((el) => ({
                                      value: { ...el, id: element.id },
                                      label:
                                        el.desc +
                                        ' - ' +
                                        el.amount.toLocaleString('en-IN', {
                                          maximumFractionDigits: 2,
                                          style: 'currency',
                                          currency: 'INR',
                                        }),
                                    })),
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
                                        if (traveller.id === travl.id) {
                                          if (traveller.trip_meals[key]) {
                                            let exists = false;
                                            for (
                                              let i = 0;
                                              i < traveller.trip_meals[key].length;
                                              i++
                                            ) {
                                              if (
                                                element.id ===
                                                traveller.trip_meals[key][i].value.id
                                              ) {
                                                traveller.trip_meals[key][i] = id;
                                                exists = true;
                                              }
                                            }
                                            if (!exists) {
                                              traveller.trip_meals[key].push(id);
                                            }
                                          } else {
                                            traveller.trip_meals[key] = [id];
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
                      {/* AA */}
                      {value.provider === 'aa' &&
                        value.data?.ssr?.legSsrs?.map((element, ind) => (
                          <>
                            {element ? (
                              <div className='col-md-6 form-input-select mt-10' key={ind}>
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
                                      .filter((el) => el.ssrType === 2)
                                      .map((el) => ({
                                        value: { ...el, legKey: element.legKey },
                                        label:
                                          el.name +
                                          ' - ' +
                                          Object.values(
                                            el.passengersAvailability
                                          )[0].price.toLocaleString('en-IN', {
                                            maximumFractionDigits: 2,
                                            style: 'currency',
                                            currency: 'INR',
                                          }),
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
                                        if (traveller.id === travl.id) {
                                          if (traveller.trip_meals[key]) {
                                            let exists = false;
                                            for (
                                              let i = 0;
                                              i < traveller.trip_meals[key].length;
                                              i++
                                            ) {
                                              if (
                                                element.legKey ===
                                                traveller.trip_meals[key][i].value.legKey
                                              ) {
                                                traveller.trip_meals[key][i] = id;
                                                exists = true;
                                              }
                                            }
                                            if (!exists) {
                                              traveller.trip_meals[key].push(id);
                                            }
                                          } else {
                                            traveller.trip_meals[key] = [id];
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
                      {/* AD */}
                      {value.provider === 'ad' && (
                        <div className='col-md-6 form-input-select mt-10'>
                          <label>
                            {Object.values(value.data.segments)[0].from} &rarr;{' '}
                            {Object.values(value.data.segments).at(-1).to}
                          </label>
                          <Select
                            options={[
                              {
                                value: null,
                                label: 'No Preference',
                              },
                              { value: 'Vegetarian', label: 'Vegetarian' },
                              { value: 'Jain Vegetarian', label: 'Jain Vegetarian' },
                              { value: 'Non Vegetarian', label: 'Non Vegetarian' },
                              { value: 'Lacto Ovo Meal', label: 'Lacto Ovo Meal' },
                              { value: 'Sea Food Meal', label: 'Sea Food Meal' },
                            ]}
                            defaultValue={{
                              value: null,
                              label: 'No Preference',
                            }}
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
                    </div>
                  )}
                </>
              ))}
            </div>
          ))}
        </div>
        {/* Proceed To Review */}
        <div className='d-flex col-12 justify-end'>
          <button
            className='button -dark-1 px-30 h-50 bg-blue-1 text-white col-4 mt-20'
            onClick={() => onClick()}
          >
            Confirm and Book
          </button>
        </div>
      </div>
    </section>
  );
}
export default Seatmap;

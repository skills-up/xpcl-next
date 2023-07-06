import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { customAPICall } from '../../../api/xplorzApi';
import { sendToast } from '../../../utils/toastify';
import Seat from '../common/Seat';
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { DateObject } from 'react-multi-date-picker';
import Select from 'react-select';
import { aaSeatMap, adSeatMap } from '../../../pages/test/temp';

function Seatmap({ seatMaps, PNR, travellerInfos }) {
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
            if (response?.success) {
              tempDat[key] = {
                data: response.data,
                provider: 'aa',
              };
            }
          }
          // AD
          if (value?.provider === 'ad') {
            for (let [segKey, segValue] of Object.entries(value?.data?.segments)) {
              response = await customAPICall(
                'tj/v1/seatmaps',
                'post',
                {
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
                },
                {},
                true
              );
              if (response?.success) {
                tempDat[key] = {
                  data: tempDat[key]?.data
                    ? tempDat[key].data.push(response.data)
                    : [response.data],
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
        // AD
      }
    }
  };

  // AA Seatmap
  const AASeatMapRender = ({ data, type }) => {
    console.log('data', data);
    return (
      <div>
        {/* Iterating Segments */}
        {data.map((el, ind) => {
          return (
            <div key={ind} className='tj-seatmap mb-20'>
              {/* Iterating Decks */}
              {Object.entries(el.seatMap.decks).map(([deckKey, deckVal], deckIn) => {
                // Preprocessing
                let width = Math.floor((deckVal?.compartments?.Y?.width - 1) / 2);
                let length = deckVal?.compartments?.Y?.length / 2;
                let emptyCol = []; // Finding the aisles
                for (let i = 0; i < width; i++) {
                  emptyCol.push(i);
                }
                // If any y is odd number, making it -1
                let yStart = 0;
                let yEnd = 0;
                for (let seat of deckVal?.compartments?.Y?.units) {
                  //  If its seat type 1
                  if (seat.type === 1) {
                    // If seat row number is odd, making it even
                    if (seat.y % 2 !== 0) {
                      seat.y -= 1;
                    }
                    // Getting Y Start row
                    if (yStart === 0) {
                      yStart = seat.y / 2;
                    }
                    // Getting the aisle
                    let tempInd = emptyCol.indexOf(Math.floor(seat.x / 2));
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
                for (let seat of deckVal?.compartments?.Y?.units) {
                  if (seat.type === 1) {
                    newArr[seat.y / 2 - yStart][Math.floor(seat.x / 2)] = seat;
                  }
                }
                return (
                  <div key={deckIn}>
                    {/* Iterating Seats */}
                    {newArr.map((rowEl, rowInd) => (
                      <div key={rowInd} className='tj-grid'>
                        {rowEl.map((element, index) =>
                          element ? (
                            <Seat
                              key={index}
                              label={element?.designator.split('').at(-1)}
                              fill={
                                !element.assignable
                                  ? '#FF0000'
                                  : element?.isSelected
                                  ? '#4CBB17'
                                  : undefined
                              }
                              clickable={!element.assignable ? false : true}
                              onClick={
                                element.assignable
                                  ? () => {
                                      if (element.assignable) {
                                        // Adding / Removing Selected Seats
                                        setSeatMap((prev) => {
                                          for (let dat of prev[type]?.data[ind]?.seatMap
                                            ?.decks[deckKey]?.compartments?.Y?.units) {
                                            if (dat?.designator === element?.designator) {
                                              let travl = prev[type]?.data[ind]?.seatMap
                                                ?.decks[deckKey]['travellers']
                                                ? prev[type]?.data[ind]?.seatMap?.decks[
                                                    deckKey
                                                  ]['travellers']
                                                : [];
                                              // If already selected, removing selected + traveller info on that seat
                                              if (dat['isSelected']) {
                                                dat['isSelected'] = false;
                                                travl = travl.filter(
                                                  (trav) =>
                                                    trav.designator !== element.designator
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
                                                      ...{
                                                        designator: element.designator,
                                                        id: element.unitKey,
                                                      },
                                                    });
                                                    prev[type].data[ind].seatMap.decks[
                                                      deckKey
                                                    ].compartments.Y.units = prev[
                                                      type
                                                    ]?.data[ind]?.seatMap?.decks[
                                                      deckKey
                                                    ]?.compartments?.Y?.units.map((s) =>
                                                      s.designator === travl[0].designator
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
                                                          ...{
                                                            designator:
                                                              element.designator,
                                                            id: element.unitKey,
                                                          },
                                                        });
                                                        travlToAdd = true;
                                                      }
                                                    }
                                                  }
                                                } else {
                                                  travl = [
                                                    {
                                                      ...travellers[0],
                                                      ...{
                                                        designator: element.designator,
                                                        id: element.unitKey,
                                                      },
                                                    },
                                                  ];
                                                }
                                              }
                                              prev[type].data[ind].seatMap.decks[deckKey][
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
                          ) : emptyCol.includes(index) ? (
                            <span className='row-number'>{rowInd + 1}</span>
                          ) : (
                            <span className='row-number' />
                          )
                        )}
                      </div>
                    ))}
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
          if (value) {
            const columnLimit = value?.sData?.column;
            const rowLimit = value?.sData?.row;
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
                                                        ...{
                                                          seatNo: el.seatNo,
                                                          amount: el.amount,
                                                          id: key,
                                                        },
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
                                                            ...{
                                                              seatNo: el.seatNo,
                                                              amount: el.amount,
                                                              id: key,
                                                            },
                                                          });
                                                          travlToAdd = true;
                                                        }
                                                      }
                                                    }
                                                  } else {
                                                    travl = [
                                                      {
                                                        ...travellers[0],
                                                        ...{
                                                          seatNo: el.seatNo,
                                                          amount: el.amount,
                                                          id: key,
                                                        },
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
                            {element[i - 1]?.isAisle && element[i + 1]?.isAisle ? (
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

  // AD Seatmap
  const ADSeatMapRender = ({ data, type }) => {
    let getArray = (x) => {
      return x ? (Array.isArray(x) ? x : [x]) : [];
    };
    const reserveCodes = ['SO', 'BK', 'LA', 'G', 'GN', 'CL', 'ST', 'TA', '1', '8'];
    let seatmap = data;
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

    getArray(seatmap.cabin).forEach((cabin) => {
      var cont = '';
      var facFront = '';
      var facRear = '';
      const facilities = getArray(cabin.cabinFacilities || []);
      const compartment = cabin.compartmentDetails;
      const defSeatOcc =
        compartment.defaultSeatOccupation || cabin.defaultSeatOccupation || 'F';
      const seatRows = compartment.seatRowRange.number;
      const isUpperDeck = compartment.cabinZoneCode == 'U';

      if (isUpperDeck) $('#upperDeckToggle').show();

      //Obtain column header and layout
      var seatFormatArr = [];
      var prev = '';
      var spacers = 0;
      compartment.columnDetails.forEach((detail) => {
        var curr = getArray(detail.description);
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

      const props = spacers < 2 ? ['L', 'R'] : ['L', 'C', 'R'];

      //Add seat headers
      facFront += '<tr><td></td>';
      seatFormatArr.forEach((col) => {
        facFront += '<th class="col-name">' + col + '</th>';
      });
      facFront += '</tr>';

      //Gather facilities in front/rear of cabin
      var facRow = '';
      var propIdx, currProp, contObj;
      facilities.forEach((fac) => {
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
        seatFormatArr.forEach((col) => {
          if (col == ' ') {
            contObj[currProp] += '<td class="no-seat"></td>';
            currProp = props[++propIdx];
          } else {
            var facility = facObj[currProp].shift();
            if (facility) {
              contObj[currProp] += '<td class="seat seat-' + facility + '"> &nbsp; </td>';
            } else {
              if (currProp == 'R') {
                contObj[currProp] = '<td class="no-seat"></td>' + contObj[currProp];
              } else if (currProp == 'C' && contObj[currProp].indexOf('</td><td') > 0) {
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
          facFront += '<tr><td></td>' + facRow + '</tr>';
        } else {
          facRear += '<tr><td></td>' + facRow + '</tr>';
        }
      });

      // Add Seats
      for (let i = seatRows[0]; i <= seatRows[1]; i++) {
        const cabinRow = rows[currRow++];
        if (cabinRow == undefined) continue;

        var rowBefore = '',
          rowAfter = '';
        const rowFacilities = getArray(cabinRow.cabinFacility || []);
        rowFacilities.forEach((fac) => {
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
          seatFormatArr.forEach((col) => {
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
                  contObj[currProp] = '<td class="no-seat"></td>' + contObj[currProp];
                } else if (currProp == 'C' && contObj[currProp].indexOf('</td><td') > 0) {
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
        // console.assert(i == row.seatRowNumber, "Seat number is different", i, row.seatRowNumber);
        var rowCont =
          '<tr class="seat-row' +
          (row.rowCharacteristicDetails
            ? ' row-type-' + row.rowCharacteristicDetails.rowCharacteristic
            : '') +
          '"><th class="row-number">' +
          rowNum +
          '</th>';
        // if (row.seatOccupationDetails) {
        var details = Object.assign(
          {},
          ...getArray(row.seatOccupationDetails).map((detail) => ({
            [detail.seatColumn]: getArray(detail.seatCharacteristic).concat(
              getArray(detail.seatOccupation)
            ),
          }))
        );
        seatFormatArr.forEach((col) => {
          if (col == ' ' /*  || !details[col] */) {
            rowCont += '<td class="no-seat"></td>';
          } else {
            //💺
            var chars = details[col] || getArray(defSeatOcc);
            var price = prices[rowNum + col] || 0;
            // var contents = chars.indexOf('O') >= 0 ? 'X' : (chars.indexOf('E') >= 0 ? 'E' : (chars.indexOf('1') >= 0 ? 'R' : (chars.indexOf('CH') >= 0 ? '$' : '&nbsp;')));
            var contents = '&nbsp;';
            if (chars.indexOf('O') >= 0 || chars.indexOf('Z') >= 0) {
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
            if (chars.indexOf('8') >= 0) {
              rowCont += '<td class="no-seat"></td>';
            } else {
              rowCont +=
                '<td class="seat seat-' +
                chars.join(' seat-') +
                '" data-row="' +
                rowNum +
                '" data-col="' +
                col +
                '" data-price="' +
                price +
                '"><span title="₹ ' +
                price +
                '"> ' +
                contents +
                ' </span></td>';
            }
          }
        });
        // } else {
        //     rowCont += '<td class="no-seat" colspan="' + seatFormatArr.length + '"></td>';
        // }
        rowCont += '</tr>';

        cont += rowBefore + rowCont + rowAfter;
      }
      html +=
        '<table class="amadeus-table ' +
        (isUpperDeck ? 'upper-deck' : 'lower-deck') +
        '"><tbody>' +
        facFront +
        cont +
        facRear +
        '</tbody></table>';
    });
    console.log('html', html);
    return (
      <div className='amadeus-container' dangerouslySetInnerHTML={{ __html: html }} />
    );
    // return <div>{html}</div>;
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
                  <></>
                ) : // AD
                seatMap?.from?.provider === 'ad' ? (
                  <></>
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
                  <></>
                ) : // AD
                seatMap?.combined?.provider === 'ad' ? (
                  <></>
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
                    <div>
                      {/* TJ */}
                      {value.provider === 'tj' &&
                        value.data?.data?.tripInfos?.[0].sI?.map((element, ind) => (
                          <>
                            {element?.ssrInfo?.MEAL ? (
                              <div className='col-md-6 form-input-select mt-10' key={ind}>
                                <label>
                                  {element.da.code} &rarr; {element.aa.code}
                                </label>
                                {console.log('element', element)}
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
                      {/* AD */}
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

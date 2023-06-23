import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { createItem, customAPICall, getList } from '../../../api/xplorzApi';
import { sendToast } from '../../../utils/toastify';
import FlightProperty from '../../flight-list/common/FlightProperty';
import Select from 'react-select';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { aaSeatMap, adSeatMap, tjSeatMap } from '../../../pages/test/temp';
import Seat from '../common/Seat';

function Seatmap({ setCurrentStep, isBooked, PNR, travellerInfos }) {
  const [seatMap, setSeatMap] = useState({
    to: { provider: 'tj', data: tjSeatMap, selected: 0 },
    from: { provider: 'ad', data: adSeatMap, selecteD: 0 },
  });

  const travellers = useSelector((state) => state.flightSearch.value.travellers);

  // Fetch Flight Details for PNRs
  // Save Them To Seatmaps
  // Display Seatmaps

  useEffect(() => {
    getData();
  });

  const getData = async () => {
    if (PNR?.to || PNR?.from) {
      for (let [key, value] of Object.entries(PNR)) {
        if (value) {
          // API Call to Flight Booking + setSeatMap
        }
      }
    }
  };

  // TJ Seatmap
  const TJSeatMapRender = ({ data, type }) => {
    // 3D Array
    let newArr = [];
    if (data?.data?.tripSeatMap?.tripSeat) {
      const columnLimit = Object.values(data?.data?.tripSeatMap.tripSeat)[0]?.sData
        .column;
      const rowLimit = Object.values(data?.data?.tripSeatMap.tripSeat)[0]?.sData.row;
      // Iterating for prototype 3D Array to mimic the seats
      let temp = [];
      for (let i = 0; i < rowLimit; i++) {
        for (let j = 0; j < columnLimit; j++) {
          temp.push(null);
        }
        newArr.push(temp);
        temp = [];
      }
      console.log('first', newArr, columnLimit, rowLimit);
      // Adding values to 3D array
      for (let dat of Object.values(data?.data?.tripSeatMap.tripSeat)[0]?.sInfo) {
        newArr[dat.seatPosition.row - 1][dat.seatPosition.column - 1] = dat;
      }
      console.log('new arr', newArr);
    }
    return (
      <div className='tj-seatmap'>
        {newArr &&
          newArr.length > 0 &&
          newArr.map((element, index) => {
            return (
              <div key={index} className='tj-grid'>
                {element.map((el, i) =>
                  el ? (
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
                      clickable={
                        el.isBooked
                          ? false
                          : data.selected < travellers.length
                          ? true
                          : el.isSelected
                          ? true
                          : false
                      }
                      onClick={
                        !el.isBooked
                          ? () => {
                              if (!el.isBooked) {
                                // Adding / Removing Selected Seats
                                setSeatMap((prev) => {
                                  for (let dat of Object.values(
                                    prev[type].data.tripSeatMap.tripSeat
                                  )[0]?.sInfo) {
                                    if (dat.seatNo === el.seatNo) {
                                      console.log('l', data.selected, travellers.length);
                                      if (dat['isSelected']) {
                                        dat['isSelected'] = false;
                                        prev[type].selected -= 1;
                                      } else {
                                        if (data.selected < travellers.length) {
                                          dat['isSelected'] = true;
                                          prev[type].selected += 1;
                                        }
                                      }
                                    }
                                  }
                                  return { ...prev };
                                });
                                console.log('testt');
                              }
                            }
                          : undefined
                      }
                    />
                  ) : (
                    <>
                      {element[i - 1]?.isAisle && element[i + 1]?.isAisle ? (
                        <span className='row-number'>{index + 1}</span>
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
  };

  // AD Seatmap
  const ADSeatMapRender = ({ data, type }) => {
    let getArray = (x) => {
      return x ? (Array.isArray(x) ? x : [x]) : [];
    };

    let seatmap = data?.data;
    let rows = seatmap.row;
    var currRow = 0;

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
      for (i = seatRows[0]; i <= seatRows[1]; i++) {
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
        '<table class="table ' +
        (isUpperDeck ? 'upper-deck' : 'lower-deck') +
        '"><tbody>' +
        facFront +
        cont +
        facRear +
        '</tboady></table>';
    });
  };

  return (
    <section className='pt-40 pb-40 bg-light-2'>
      <div className='container'>
        <h1>Flight Seatmaps</h1>
        {/* To */}
        <h2 className='mt-20'>To Seatmap</h2>
        <div className='bg-white py-30 px-30 mt-20'>
          {/* TJ */}
          {seatMap?.to?.data && seatMap?.to?.provider === 'tj' && (
            <TJSeatMapRender data={seatMap.to} type='to' />
          )}
        </div>
        {/* From */}
        {seatMap?.from && (
          <>
            <h2 className='mt-20'>From Seatmap</h2>
            <div className='bg-white py-30 px-30 mt-20'>
              {/* TJ */}
              {seatMap?.from?.data && seatMap?.from?.provider === 'tj' && (
                <TJSeatMapRender data={seatMap.from} type='from' />
              )}
              {/* AD */}
              {seatMap?.from?.data && seatMap?.from?.provider === 'ad' && (
                <ADSeatMapRender data={seatMap.from} type='from' />
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
export default Seatmap;

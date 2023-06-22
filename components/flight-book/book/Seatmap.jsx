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
    to: { provider: 'tj', data: tjSeatMap },
    from: null,
  });

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
    if (data?.tripSeatMap?.tripSeat) {
      const columnLimit = Object.values(data.tripSeatMap.tripSeat)[0]?.sData.column;
      const rowLimit = Object.values(data.tripSeatMap.tripSeat)[0]?.sData.row;
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
      for (let dat of Object.values(data.tripSeatMap.tripSeat)[0]?.sInfo) {
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
                        el.isBooked ? '#FF0000' : el?.isSelected ? '#4CBB17' : undefined
                      }
                      clickable={el.isBooked ? false : true}
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
                                      if (dat['isSelected']) {
                                        dat['isSelected'] = false;
                                      } else {
                                        dat['isSelected'] = true;
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

  return (
    <section className='pt-40 pb-40 bg-light-2'>
      <div className='container'>
        <h1>Flight Seatmaps</h1>
        {/* To */}
        <h2 className='mt-20'>To Seatmap</h2>
        <div className='bg-white py-30 px-30 mt-20'>
          {seatMap?.to?.data && seatMap?.to?.provider === 'tj' && (
            <TJSeatMapRender data={seatMap.to.data} type='to' />
          )}
        </div>
      </div>
    </section>
  );
}
export default Seatmap;

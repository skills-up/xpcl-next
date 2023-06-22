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
      let temp = [];
      let prevRow = 1;
      for (let dat of Object.values(data.tripSeatMap.tripSeat)[0]?.sInfo) {
        if (dat.seatPosition.row > prevRow) {
          newArr.push(temp.slice(0));
          temp = [];
          prevRow = dat.seatPosition.row;
        }
        temp.push(dat);
      }
    }
    return (
      <div className='tj-seatmap'>
        {newArr &&
          newArr.length > 0 &&
          newArr.map((element, index) => (
            <div key={index} className='tj-grid'>
              {element.map((el, i) => (
                <span key={i} className='d-flex items-center seat-container'>
                  <Seat
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
                  {element[i]?.isAisle && element[i + 1]?.isAisle && (
                    <span className='row-number'>{el.seatPosition.row}</span>
                  )}
                </span>
              ))}
            </div>
          ))}
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

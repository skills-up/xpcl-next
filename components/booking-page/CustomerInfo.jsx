import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { customAPICall, getList } from '../../api/xplorzApi';
import { sendToast } from '../../utils/toastify';
import BookingDetails from './sidebar/BookingDetails';
import Select from 'react-select';
import { DateObject } from 'react-multi-date-picker';
import { useRouter } from 'next/router';
import LoadingBar from 'react-top-loading-bar';
import { TiTickOutline } from 'react-icons/ti';
import { bookingDetails } from '../../pages/test/temp';

const CustomerInfo = () => {
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const rooms = useSelector((state) => state.hotelSearch.value.rooms);
  const PNR = useSelector((state) => state.hotelSearch.value.PNR);
  const [confirmationData, setConfirmationData] = useState(null);
  const age = useSelector((state) => state.hotelSearch.value.age);
  const totalAdults = age.totalAdult;
  const totalChildren = age.totalChildren;
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (!PNR || rooms.length < 1) {
      router.back();
    }
    getData();
  }, []);

  const [travellers, setTravellers] = useState([]);
  const passportPrefixOptions = [
    { value: 'Mr', label: 'Mr.' },
    { value: 'Mrs', label: 'Mrs.' },
    { value: 'Master', label: 'Mstr.' },
    { value: 'Ms', label: 'Ms.' },
  ];

  const getData = async () => {
    setProgress(30);
    // Get traveller details
    let traveller_ids = [];
    if (rooms.length > 0) {
      for (let room of rooms) {
        for (let trav of room.travellers) {
          traveller_ids.push(trav?.value);
        }
      }
    }
    setProgress(60);
    const travellers = await getList('travellers', { traveller_ids });
    setProgress(100);
    if (travellers.success) {
      setTravellers(
        travellers.data.map((el) => ({
          ...el,
          prefix: el.prefix
            ? el.prefix.toLowerCase() === 'mr'
              ? { value: 'Mr', label: 'Mr.' }
              : el.prefix.toLowerCase() === 'mrs'
              ? { value: 'Mrs', label: 'Mrs.' }
              : el.prefix.toLowerCase() === 'mstr'
              ? { value: 'Master', label: 'Mstr.' }
              : el.prefix.toLowerCase() === 'ms'
              ? { value: 'Ms', label: 'Ms.' }
              : null
            : null,
        }))
      );
    } else {
      sendToast('error', 'Error getting travellers', 4000);
    }
  };

  const confirmBooking = async () => {
    let roomwiseGuests = [];
    let currentTime = Date.now();
    for (let room of rooms) {
      let tempArr = [];
      let hasPassport = true;
      let hasPAN = false;
      for (let travl of room.travellers) {
        for (let traveller of travellers) {
          if (traveller.id === travl.value) {
            let type;
            if (!traveller?.prefix?.value) {
              sendToast('error', 'Each traveller needs to have a Prefix/Title', 4000);
              return;
            } else if (traveller.pan_number) hasPAN = true;
            if (traveller.passport_number) hasPassport = true;
            // Age
            const age = (
              (currentTime -
                +new DateObject({
                  date: traveller.passport_dob,
                  format: 'YYYY-MM-DD',
                })
                  .toDate()
                  .getTime()) /
              31536000000
            ).toFixed(2);
            // If below 12, child
            if (age < 12) type = 'CHILD';
            // If above 12 years, consider adult
            if (age >= 12) type = 'ADULT';
            // Pushing
            tempArr.push({
              type,
              title: traveller.prefix.value,
              first: traveller.first_name,
              last: traveller.last_name,
              pan: PNR.room.ipr ? traveller?.pan_number || undefined : undefined,
              passport: PNR.room.ipm
                ? traveller?.passport_number || undefined
                : undefined,
            });
          }
        }
      }
      if (PNR.room.ipr && !hasPAN) {
        sendToast(
          'error',
          'There should be a PAN number associated to at least 1 traveller in each room',
          10000
        );
        return;
      }
      if (PNR.room.ipm && !hasPassport) {
        sendToast(
          'error',
          'There should be a passport number associated to at least 1 traveller in each room',
          4000
        );
        return;
      }
      roomwiseGuests.push(tempArr);
    }
    setProgress(50);
    // Booking
    const res = await customAPICall(
      'tj/v1/htl/book',
      'post',
      {
        bookingId: PNR.data.bookingId,
        amount: PNR.data.conditions.isBA ? undefined : PNR.room.tp,
        roomwiseGuests,
      },
      {},
      true
    );
    setProgress(100);
    if (res?.success) {
      const bookingDetails = await customAPICall(
        'tj/v1/htl/booking',
        'get',
        {},
        {
          params: { id: res.data.bookingId },
        },
        true
      );
      if (bookingDetails?.success) {
        setConfirmationData(bookingDetails.data);
      }
      setStage(1);
      sendToast('success', 'Booking Successful', 4000);
    } else {
      sendToast(
        'error',
        res.data?.message || res.data?.error || 'Error while creating the booking',
        4000
      );
    }
  };
  return (
    <>
      <LoadingBar
        color='#19f9fc'
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      {/* Stage 0 */}
      {stage === 0 && (
        <>
          <div className='col-xl-7 col-lg-8 mt-30'>
            <h2 className='fw-500 mt-40 md:mt-24'>Review Travellers</h2>
            <div>
              <div className='mt-20'>
                {travellers &&
                  travellers.length > 0 &&
                  travellers.map((element, index) => {
                    // Getting Room Number
                    let roomNumber = 0;
                    let counter = 1;
                    for (let room of rooms) {
                      for (let traveller of room.travellers) {
                        if (traveller.value === element.id) {
                          roomNumber = counter;
                        }
                      }
                      counter += 1;
                    }
                    return (
                      <div key={index}>
                        <h3 className='mt-20'>
                          {element.aliases[0]} (Room {roomNumber})
                        </h3>
                        <div
                          key={index}
                          className='bg-white pt-30 px-30 mt-20 border-light rounded-4'
                        >
                          <h4>Traveller</h4>
                          <div className='row my-3'>
                            <div className='row col-12 mb-20 y-gap-20'>
                              <div className='col-md-6 form-input-select'>
                                <label>Prefix/Title</label>
                                <Select
                                  options={passportPrefixOptions}
                                  value={element.prefix}
                                  onChange={(id) =>
                                    setTravellers((prev) => {
                                      prev[index]['prefix'] = id;
                                      return [...prev];
                                    })
                                  }
                                />
                              </div>
                              <div className='form-input col-md-6 bg-white'>
                                <input
                                  onChange={(e) =>
                                    setTravellers((prev) => {
                                      prev[index]['first_name'] = e.target.value;
                                      return [...prev];
                                    })
                                  }
                                  value={element['first_name']}
                                  placeholder=' '
                                  type='text'
                                />
                                <label className='lh-1 text-16 text-light-1'>
                                  First Name
                                </label>
                              </div>
                              <div className='form-input col-md-6 bg-white'>
                                <input
                                  onChange={(e) =>
                                    setTravellers((prev) => {
                                      prev[index]['last_name'] = e.target.value;
                                      return [...prev];
                                    })
                                  }
                                  value={element['last_name']}
                                  placeholder=' '
                                  type='text'
                                />
                                <label className='lh-1 text-16 text-light-1'>
                                  Last Name
                                </label>
                              </div>
                              {PNR?.room?.ipr && (
                                <div className='form-input col-md-6 bg-white'>
                                  <input
                                    onChange={(e) =>
                                      setTravellers((prev) => {
                                        prev[index]['pan_number'] = e.target.value;
                                        return [...prev];
                                      })
                                    }
                                    value={element['pan_number']}
                                    placeholder=' '
                                    type='text'
                                  />
                                  <label className='lh-1 text-16 text-light-1'>
                                    PAN Number
                                  </label>
                                </div>
                              )}
                              {PNR?.room?.ipm && (
                                <div className='form-input col-md-6 bg-white'>
                                  <input
                                    onChange={(e) =>
                                      setTravellers((prev) => {
                                        prev[index]['passport_number'] = e.target.value;
                                        return [...prev];
                                      })
                                    }
                                    value={element['passport_number']}
                                    placeholder=' '
                                    type='text'
                                  />
                                  <label className='lh-1 text-16 text-light-1'>
                                    Passport Number
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              {/* End col-12 */}
            </div>
            {/* End .row */}
          </div>
          {/* End .col-xl-7 */}
          <div className='col-xl-5 col-lg-4 mt-30'>
            <div className='booking-sidebar'>
              <BookingDetails PNR={PNR} />{' '}
              <div className='d-flex justify-end mt-20'>
                <button
                  className='button col-lg-8 col-12 h-60 px-24 -dark-1 bg-blue-1 text-white'
                  onClick={confirmBooking}
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Stage 1 */}
      {stage === 1 && (
        <div className='border-light rounded-4 px-20 py-20'>
          <h2 className='text-center mb-40 d-flex items-center justify-center gap-2'>
            <TiTickOutline className='text-50 text-success' /> Booking Successful
          </h2>
          {confirmationData && (
            <div className='border-light rounded-4  mx-4 my-4 px-20 py-20'>
              <div className='row x-gap-20 y-gap-20'>
                <div className='col-lg-4 text-center'>
                  <h3 className='text-primary'>Hotel:</h3>
                  <h5 className='text-secondary'>
                    {confirmationData.itemInfos.HOTEL.hInfo.name}
                  </h5>
                </div>
                <div className='col-lg-4 text-center'>
                  <h3 className='text-primary'>Star Rating:</h3>
                  <h5 className='text-secondary'>
                    {confirmationData.itemInfos.HOTEL.hInfo.rt}
                  </h5>
                </div>
                <div className='col-lg-4 text-center'>
                  <h3 className='text-primary'>Traveller Total:</h3>
                  <h5 className='text-secondary'>
                    {totalAdults > 0
                      ? totalAdults > 1
                        ? totalAdults + ' Adults'
                        : totalAdults + ' Adult'
                      : ''}
                    {totalChildren > 0
                      ? totalChildren > 1
                        ? ', ' + totalChildren + ' Children'
                        : ', ' + totalChildren + ' Child'
                      : ''}
                  </h5>
                </div>
                <div className='col-lg-6 text-center'>
                  <h3 className='text-primary'>Check-In / Check-Out:</h3>
                  <h5 className='text-secondary'>
                    {new DateObject({
                      date: PNR.data.query.checkinDate,
                      format: 'YYYY-MM-DD',
                    }).format('D MMMM YYYY')}{' '}
                    ~{' '}
                    {new DateObject({
                      date: PNR.data.query.checkoutDate,
                      format: 'YYYY-MM-DD',
                    }).format('D MMMM YYYY')}
                  </h5>
                </div>
                <div className='col-lg-6 text-center'>
                  <h3 className='text-primary'>Rooms:</h3>
                  <h5 className='text-secondary'>
                    {PNR.room.ris.map((element, index) => (
                      <div className='fw-500' key={element.id}>
                        <span className='text-black' style={{ fontWeight: 'bold' }}>
                          {index + 1}.
                        </span>{' '}
                        {element.rc}
                      </div>
                    ))}
                  </h5>
                </div>
                {confirmationData.itemInfos?.HOTEL?.hInfo?.ops &&
                  confirmationData.itemInfos?.HOTEL?.hInfo?.ops[0]?.inst && (
                    <div className='col-lg-12 text-center'>
                      <h3 className='text-primary'>Instructions:</h3>
                      <ul className='list-disc'>
                        {confirmationData.itemInfos?.HOTEL?.hInfo?.ops[0].inst.map(
                          (inst, instI) => (
                            <li className='text-secondary'>
                              <h5 className='d-inline'>
                                <span
                                  className='text-black'
                                  style={{ fontWeight: 'bold' }}
                                >
                                  {inst?.type &&
                                    inst.type
                                      .split('_')
                                      .map(
                                        (split) =>
                                          `${split.charAt(0).toUpperCase()}${split
                                            .slice(1)
                                            .toLowerCase()} `
                                      )}
                                </span>{' '}
                                : {inst.msg}
                              </h5>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      )}
      {/*  */}
    </>
  );
};

export default CustomerInfo;

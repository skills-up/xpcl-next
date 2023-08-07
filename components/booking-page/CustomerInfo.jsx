import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { TiTickOutline } from 'react-icons/ti';
import { DateObject } from 'react-multi-date-picker';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import LoadingBar from 'react-top-loading-bar';
import { customAPICall, getList, updateItem } from '../../api/xplorzApi';
import { sendToast } from '../../utils/toastify';
import BookingDetails from './sidebar/BookingDetails';
import GoogleMapReact from 'google-map-react';

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
  const [selectedTravellers, setSelectedTravellers] = useState([]);
  const [selectionConfirm, setSelectionConfirm] = useState(false);
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
    // let traveller_ids = [];
    // if (rooms.length > 0) {
    //   for (let room of rooms) {
    //     for (let trav of room.travellers) {
    //       traveller_ids.push(trav?.value);
    //     }
    //   }
    // }
    let tempSelectedTravellers = [];
    for (let room of rooms) tempSelectedTravellers.push({ travellers: [] });
    setSelectedTravellers(tempSelectedTravellers);
    setProgress(60);
    const travellers = await getList('travellers');
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
    for (let room of selectedTravellers) {
      let tempArr = [];
      let hasPassport = false;
      let hasPAN = false;
      for (let traveller of room.travellers) {
        let type;
        if (!traveller?.value?.prefix?.value) {
          sendToast('error', 'Each traveller needs to have a Prefix/Title', 4000);
          return;
        } else if (traveller.value?.pan_number) hasPAN = true;
        if (traveller.value?.passport_number) hasPassport = true;
        // Age
        const age = (
          (currentTime -
            +new DateObject({
              date: traveller.value.passport_dob,
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
          title: traveller.value.prefix.value,
          first: traveller.value.first_name,
          last: traveller.value.last_name,
          pan: PNR.room.ipr ? traveller?.value?.pan_number || undefined : undefined,
          passport: PNR.room.ipm
            ? traveller?.value?.passport_number || undefined
            : undefined,
        });
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

  useEffect(
    () => console.log('sel travellers', selectedTravellers),
    [selectedTravellers]
  );

  return (
    <>
      <LoadingBar
        color='#19f9fc'
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      {/* Stage 0 */}
      {stage === 0 && travellers.length > 0 && (
        <>
          {!selectionConfirm && (
            <div className='col-xl-7 col-lg-8 mt-30'>
              <h2>Select Occupants</h2>
              <div>
                {rooms.map((room, index) => (
                  <div className='mt-20'>
                    <span className='text-17 fw-500'>
                      Room {index + 1} ({room.adult} {room.adult > 1 ? 'Adults' : 'Adult'}{' '}
                      {room.child.length > 0
                        ? room.child.length > 1
                          ? ', ' + room.child.length + ' Children'
                          : ', ' + room.child.length + ' Child'
                        : ''}
                      )
                    </span>
                    <Select
                      isOptionDisabled={() =>
                        selectedTravellers[index].travellers.length >=
                        room.adult + room.child.length
                      }
                      options={travellers
                        .filter((el) => {
                          let found = false;
                          // If traveller in any other room
                          for (let sel of selectedTravellers) {
                            for (let traveller of sel.travellers) {
                              if (traveller?.value?.id === el.id) {
                                found = true;
                              }
                            }
                          }
                          if (!found) {
                            return true;
                          }
                        })
                        .map((el) => ({
                          label: el.aliases[0],
                          value: el,
                        }))}
                      isMulti
                      value={selectedTravellers[index]?.travellers}
                      onChange={(id) =>
                        setSelectedTravellers((prev) => {
                          prev[index].travellers = id;
                          return [...prev];
                        })
                      }
                    />
                  </div>
                ))}
              </div>
              <div className='d-flex justify-end mt-20'>
                <button
                  className='button col-lg-8 col-12 h-50 px-24 -dark-1 bg-blue-1 text-white'
                  onClick={async () => {
                    // Check if all the rooms have correct travellers
                    let counter = 0;
                    let currentTime = Date.now();
                    for (let room of rooms) {
                      let adults = 0;
                      let children = 0;
                      for (let traveller of selectedTravellers[counter].travellers) {
                        if (traveller?.value) {
                          const age = (
                            (currentTime -
                              +new DateObject({
                                date: traveller.value.passport_dob,
                                format: 'YYYY-MM-DD',
                              })
                                .toDate()
                                .getTime()) /
                            31536000000
                          ).toFixed(2);
                          // If below 12, child
                          if (age < 12) children += 1;
                          // If above 12 years, consider adult
                          if (age >= 12) adults += 1;
                        }
                      }
                      if (adults !== room.adult || children !== room.child.length) {
                        sendToast(
                          'error',
                          `In Room ${counter + 1}, there were a total of ${
                            room.adult
                          } adults${
                            room.child.length > 0
                              ? ` and ${room.child.length} children`
                              : ''
                          }, however ${adults} adults${
                            room.child.length > 0 ? ` and ${children} children` : ''
                          } were selected.`,
                          10000
                        );
                        return;
                      }
                      counter++;
                    }
                    setSelectionConfirm(true);
                  }}
                >
                  Confirm Occupants
                </button>
              </div>
            </div>
          )}
          {selectionConfirm && (
            <div className='col-xl-7 col-lg-8 mt-30'>
              <h2 className='fw-500 mt-40 md:mt-24'>Review Travellers</h2>
              <div>
                <div className='mt-20'>
                  {selectedTravellers &&
                    selectedTravellers.length > 0 &&
                    selectedTravellers.map((sel, selI) => (
                      <>
                        {sel.travellers &&
                          sel.travellers.length > 0 &&
                          sel.travellers.map((dat, index) => {
                            // Getting Room Number
                            let element = dat?.value;
                            let roomNumber = selI + 1;
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
                                    <div className='row col-12 y-gap-20'>
                                      <div className='col-md-6 form-input-select'>
                                        <label>Prefix/Title</label>
                                        <Select
                                          options={passportPrefixOptions}
                                          value={element.prefix}
                                          onChange={(id) =>
                                            setSelectedTravellers((prev) => {
                                              prev[selI].travellers[index].value[
                                                'prefix'
                                              ] = id;
                                              return [...prev];
                                            })
                                          }
                                        />
                                      </div>
                                      <div className='form-input col-md-6 bg-white'>
                                        <input
                                          onChange={(e) =>
                                            setSelectedTravellers((prev) => {
                                              prev[selI].travellers[index].value[
                                                'first_name'
                                              ] = e.target.value;
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
                                            setSelectedTravellers((prev) => {
                                              prev[selI].travellers[index].value[
                                                'last_name'
                                              ] = e.target.value;
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
                                              setSelectedTravellers((prev) => {
                                                prev[selI].travellers[index].value[
                                                  'pan_number'
                                                ] = e.target.value;
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
                                              setSelectedTravellers((prev) => {
                                                prev[selI].travellers[index].value[
                                                  'passport_number'
                                                ] = e.target.value;
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
                                  <div className='d-flex justify-end mb-20'>
                                    <button
                                      className='button col-lg-6 col-12 h-50 px-24 -dark-1 bg-blue-1 text-white'
                                      onClick={async () => {
                                        const response = await updateItem(
                                          'travellers',
                                          element.id,
                                          {
                                            ...element,
                                            ...{
                                              prefix: element.prefix.value
                                                ? element.prefix.value === 'Master'
                                                  ? 'MSTR'
                                                  : element.prefix.value.toUpperCase()
                                                : null,
                                              first_name: element.first_name,
                                              middle_name: element.middle_name,
                                              last_name: element.last_name,
                                              passport_number: element.passport_number,
                                              pan_number: element.pan_number,
                                            },
                                          }
                                        );
                                        if (response.success) {
                                          sendToast(
                                            'success',
                                            'Traveller updated successfully',
                                            4000
                                          );
                                        } else {
                                          sendToast(
                                            'error',
                                            response.data?.error ||
                                              response.data?.message ||
                                              'Error updating traveller',
                                            4000
                                          );
                                        }
                                      }}
                                    >
                                      Update Traveller
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </>
                    ))}
                </div>
                {/* End col-12 */}
              </div>
              {/* End .row */}
            </div>
          )}
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
            <div>
              <div className='border-top-light mt-30' />
              <div className='row y-gap-20'>
                <div className='col-md-4 text-center'>
                  <div className='text-15'>Booking ID</div>
                  <div className='fw-500'>{confirmationData.order.bookingId}</div>
                </div>
                <div className='col-md-4 text-center'>
                  <div className='text-15'>Booking Status</div>
                  <div className='fw-500'>{confirmationData.order?.status}</div>
                </div>
                <div className='col-md-4 text-center'>
                  <div className='text-15'>Total Amount</div>
                  <div className='fw-500'>
                    {PNR.room.tp.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </div>
                </div>
              </div>
              <h3 className='mt-20 mb-10'>
                {confirmationData.itemInfos.HOTEL.hInfo.name}
              </h3>
              <div className='row mt-8 y-gap-20 mb-20'>
                {/* Address */}
                <div className=''>
                  <div className='text-15'>Address</div>
                  <div className='fw-500'>
                    {confirmationData.itemInfos.HOTEL.hInfo.ad?.adr}
                    {confirmationData.itemInfos.HOTEL.hInfo.ad?.adr2 &&
                      ', ' + confirmationData.itemInfos.HOTEL.hInfo.ad?.adr2}
                    {confirmationData.itemInfos.HOTEL.hInfo.ad?.city?.name &&
                      ', ' + confirmationData.itemInfos.HOTEL.hInfo.ad?.city?.name}
                    {confirmationData.itemInfos.HOTEL.hInfo.ad?.state?.name &&
                      ', ' + confirmationData.itemInfos.HOTEL.hInfo.ad?.state?.name}
                    {confirmationData.itemInfos.HOTEL.hInfo.ad?.country?.name &&
                      ', ' + confirmationData.itemInfos.HOTEL.hInfo.ad?.country?.name}
                    {confirmationData.itemInfos.HOTEL.hInfo.ad?.postalCode &&
                      ' - ' + confirmationData.itemInfos.HOTEL.hInfo.ad?.postalCode}
                  </div>
                </div>
                {/* Star */}
                <div>
                  <div className='text-15'>Star Rating</div>
                  <div className='fw-500'>
                    {confirmationData.itemInfos.HOTEL.hInfo.rt}
                  </div>
                </div>
                {/* Contact */}
                {confirmationData.itemInfos.HOTEL.hInfo?.cnt?.ph && (
                  <div>
                    <div className='text-15'>Contact</div>
                    <div className='fw-500'>
                      {confirmationData.itemInfos.HOTEL.hInfo?.cnt?.ph}
                    </div>
                  </div>
                )}
                {/* Dates */}
                <div>
                  <div className='text-15'>Check-In / Check-Out</div>
                  <div className='fw-500'>
                    {new DateObject({
                      date: PNR.data.query.checkinDate,
                      format: 'YYYY-MM-DD',
                    }).format('D MMMM YYYY')}{' '}
                    ~{' '}
                    {new DateObject({
                      date: PNR.data.query.checkoutDate,
                      format: 'YYYY-MM-DD',
                    }).format('D MMMM YYYY')}
                  </div>
                </div>
                {/* Rooms */}
                <div>
                  <div className='text-20'>Rooms</div>
                  <div className='fw-500'>
                    {PNR.room.ris.map((element, index) => {
                      let travDetails = [];
                      for (let traveller of selectedTravellers[index]?.travellers) {
                        travDetails.push(traveller?.value);
                      }
                      return (
                        <div className='fw-500' key={element.id}>
                          Room {index + 1} - {element.rc}
                          <div className='ml-20 lg:ml-10 mb-10'>
                            {travDetails.map((traveller, travellerI) => (
                              <>
                                Traveller {travellerI + 1} -{' '}
                                <span className='fw-300'>{traveller.aliases[0]}</span>
                                <div className='ml-20'>
                                  <div>
                                    Title:{' '}
                                    <span className='fw-300'>
                                      {traveller.prefix?.value}
                                    </span>
                                  </div>
                                  <div>
                                    First Name:{' '}
                                    <span className='fw-300'>{traveller.first_name}</span>
                                  </div>
                                  <div>
                                    Last Name:{' '}
                                    <span className='fw-300'>{traveller.last_name}</span>
                                  </div>
                                  {PNR.room.ipr && traveller?.pan_number && (
                                    <div>
                                      PAN Number:{' '}
                                      <span className='fw-300'>
                                        {traveller.pan_number}
                                      </span>
                                    </div>
                                  )}
                                  {PNR.room.ipm && traveller?.passport_number && (
                                    <div className='ml-20'>
                                      Passport Number:{' '}
                                      <span className='fw-300'>
                                        {traveller.passport_number}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Instructions */}
                {confirmationData.itemInfos?.HOTEL?.hInfo?.ops &&
                  confirmationData.itemInfos?.HOTEL?.hInfo?.ops[0]?.inst &&
                  confirmationData.itemInfos?.HOTEL?.hInfo?.ops?.inst?.length > 0 && (
                    <div>
                      <div className='text-15'>Instructions</div>
                      <div>
                        <ul className='list-disc'>
                          {confirmationData.itemInfos?.HOTEL?.hInfo?.ops[0].inst.map(
                            (inst, instI) => (
                              <li className='text-secondary'>
                                <h5 className='d-inline'>
                                  <span className='text-black fw-500'>
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
                    </div>
                  )}
                <div>
                  <div className='text-15'>Map</div>
                  <div style={{ width: '100%', height: '60vh' }}>
                    <GoogleMapReact
                      bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY }}
                      defaultCenter={{
                        lat: +confirmationData.itemInfos?.HOTEL?.hInfo?.gl?.lt,
                        lng: +confirmationData.itemInfos?.HOTEL?.hInfo?.gl?.ln,
                      }}
                      defaultZoom={20}
                    ></GoogleMapReact>{' '}
                  </div>
                </div>
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

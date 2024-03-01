import { useEffect, useRef, useState } from 'react';
import { BsFillArrowDownCircleFill, BsSend } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import {
  setEmailClientMode,
  setSort,
} from '../../../features/flightSearch/flightSearchSlice';
import { hasPermission } from '../../../utils/permission-checker';

const TopHeaderFilter = () => {
  const dispatch = useDispatch();
  const sort = useSelector((state) => state.flightSearch.value.sort);
  const [openSort, setOpenSort] = useState(false);
  const paginateTotalDataSize = useSelector(
    (state) => state.flightSearch.value.paginateTotalDataSize
  );
  const organization = useSelector((state) => state.auth.value.organization);
  const emailClientMode = useSelector(
    (state) => state.flightSearch.value.emailClientMode
  );
  const wrapperRef = useRef(null);
  const stopButtonRef = useRef(null);

  useEffect(() => {
    if (wrapperRef && stopButtonRef) {
      function handleClickOutside (event) {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(event.target) &&
          !stopButtonRef.current.contains(event.target)
        ) {
          if (openSort) setOpenSort(false);
        }
      }
      // Bind the event listener
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [wrapperRef, stopButtonRef]);

  return (
    <>
      <div className='row y-gap-10 items-center justify-between'>
        <div className='col-auto'>
          <div className='text-18'>
            <span className='fw-500'>{paginateTotalDataSize}</span> Options
          </div>
        </div>
        {/* End .col */}

        <div className='col-auto'>
          <div className='row x-gap-20 y-gap-20'>
            <div className='col-auto flight-search-sort-container'>
              <button
                ref={stopButtonRef}
                className='button -blue-1 h-40 px-20 rounded-100 bg-blue-1-05 text-15 text-blue-1'
                onClick={() => setOpenSort((prev) => !prev)}
              >
                <i className='icon-up-down text-14 mr-10' />
                Sort
              </button>
              {openSort && (
                <div ref={wrapperRef} className='flight-search-sort bg-white px-15 py-20'>
                  <h5 className='d-flex items-center justify-between text-18 fw-500 mb-10'>
                    <span>Sort</span>
                    <span className='text-primary text-25 pr-10 pb-2'>
                      <BsFillArrowDownCircleFill
                        onClick={() => {
                          dispatch(setSort({ key: '_', value: !sort._ }));
                        }}
                        className='cursor-pointer'
                        style={sort._ ? {} : { rotate: '180deg' }}
                      />
                    </span>
                  </h5>
                  {sort &&
                    Object.entries(sort).map(([key, value], index) => (
                      <>
                        {key !== '_' && (
                          <div className='form-radio'>
                            <div className='radio d-flex items-center'>
                              <input
                                type='radio'
                                name='rating'
                                checked={value}
                                onChange={() => dispatch(setSort({ key, value: !value }))}
                              />
                              <div className='radio__mark'>
                                <div className='radio__icon' />
                              </div>
                              <div className='ml-10'>
                                {' '}
                                {key
                                  .split('_')
                                  .map(
                                    (el, i) =>
                                      `${el.charAt(0).toUpperCase()}${el.slice(1)} `
                                  )}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ))}
                </div>
              )}
            </div>
            {/* End .col */}

            <div className='col-auto d-none xl:d-block'>
              <button
                data-bs-toggle='offcanvas'
                data-bs-target='#listingSidebar'
                className='button -blue-1 h-40 px-20 rounded-100 bg-blue-1-05 text-15 text-blue-1'
              >
                <i className='icon-up-down text-14 mr-10' />
                Filter
              </button>
            </div>
            {/* End .col */}

            {/* {organization === 1 && ( */}
            {(hasPermission('send.email') || hasPermission('send.whatsapp')) && (
              <div className='col-auto flight-search-sort-container'>
                <button
                  className='button -blue-1 h-40 px-20 rounded-100 bg-blue-1-05 text-15 text-blue-1'
                  style={{
                    backgroundColor: emailClientMode ? '#3554d1' : '',
                    color: emailClientMode ? 'white' : '',
                  }}
                  onClick={() => {
                    dispatch(setEmailClientMode(!emailClientMode));
                  }}
                >
                  <BsSend className='icon-up-down text-17 mr-10' />
                  Send Options
                </button>
              </div>
            )}
            {/* )} */}
            {/* End .col */}
          </div>
          {/* End .row */}
        </div>
        {/* End .col */}
      </div>
      {/* End .row */}
    </>
  );
};

export default TopHeaderFilter;

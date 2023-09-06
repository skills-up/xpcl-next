import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setPaginateDataNumber,
  setPaginateDataPerPage,
} from '../../../features/flightSearch/flightSearchSlice';
import Select from 'react-select';

const Pagination = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5; // Change this to the actual total number of pages
  const dispatch = useDispatch();
  const [dataPerPageID, setDataPerPageID] = useState({ label: 50, value: 50 });

  // const [currentMaxPage, setCurrentMaxPage] = useState(0);
  let currentMaxPage = 0;

  const paginateDataNumber = useSelector(
    (state) => state.flightSearch.value.paginateDataNumber
  );
  const paginateDataPerPage = useSelector(
    (state) => state.flightSearch.value.paginateDataPerPage
  );
  const paginateTotalDataSize = useSelector(
    (state) => state.flightSearch.value.paginateTotalDataSize
  );
  const sort = useSelector((state) => state.flightSearch.value.sort);

  /*
      Total Size Change Trigger -> Change in Data Number -> Change in Page Number (1st Page) -> renderPage changes the page options below 
      On Click -> hnadlePageClick -> Change in Data Number -> Change in Page Number ---------------^
  */

  const handlePageClick = (pageNumber) => {
    const upperNumber = pageNumber * paginateDataPerPage;
    if (upperNumber > paginateTotalDataSize)
      dispatch(setPaginateDataNumber({ paginateDataNumber: paginateTotalDataSize }));
    else dispatch(setPaginateDataNumber({ paginateDataNumber: upperNumber }));
  };

  const renderPage = (pageNumber, isActive = false) => {
    const className = `size-40 flex-center rounded-full cursor-pointer ${
      isActive ? 'bg-dark-1 text-white' : ''
    }`;
    return (
      <>
        {+pageNumber >= 0 && (
          <div key={pageNumber} className='col-auto'>
            <div className={className} onClick={() => handlePageClick(pageNumber)}>
              {pageNumber}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderPages = () => {
    const pageNumbers = [];
    let firstIterationPage;
    if (currentPage % totalPages === 0) {
      firstIterationPage = currentPage - (totalPages - 1);
    } else {
      firstIterationPage = Math.floor(currentPage / totalPages) * totalPages + 1;
    }
    for (let i = totalPages; i > 0; i--) {
      if (Math.ceil(paginateTotalDataSize / paginateDataPerPage) >= firstIterationPage) {
        pageNumbers.push(firstIterationPage);
        firstIterationPage += 1;
      }
    }
    currentMaxPage = firstIterationPage - 1;
    const pages = pageNumbers.map((pageNumber) =>
      renderPage(pageNumber, pageNumber === currentPage)
    );
    return pages;
  };

  // When the total size is changed, change it to the lowest possible val for data number
  useEffect(() => {
    if (paginateTotalDataSize < paginateDataPerPage) {
      dispatch(setPaginateDataNumber({ paginateDataNumber: paginateTotalDataSize }));
    } else {
      dispatch(setPaginateDataNumber({ paginateDataNumber: paginateDataPerPage }));
    }
  }, [paginateTotalDataSize]);

  useEffect(() => {
    setCurrentPage(Math.ceil(paginateDataNumber / paginateDataPerPage));
  }, [paginateDataNumber]);

  useEffect(() => {
    handlePageClick(1);
  }, [paginateDataPerPage, sort]);

  return (
    <div className='border-top-light mt-30 pt-30'>
      <div className='form-input-select mb-30'>
        <label>Options Per Page </label>
        <Select
          options={[10, 25, 50, 100].map((el) => ({ label: el, value: el }))}
          value={dataPerPageID}
          placeholder=''
          onChange={(id) => {
            setDataPerPageID(id);
            dispatch(setPaginateDataPerPage({ paginateDataPerPage: +id.value }));
          }}
        />
      </div>
      <div className='row x-gap-10 y-gap-20 justify-between md:justify-center'>
        {/* Left Chevron */}
        <div className='col-auto md:order-1' style={{ minWidth: '100px' }}>
          {paginateDataNumber > paginateDataPerPage && (
            <button
              className='button -blue-1 size-40 rounded-full border-light'
              onClick={() => handlePageClick(currentPage - 1)}
            >
              <i className='icon-chevron-left text-12' />
            </button>
          )}
        </div>

        {/* Mapping Pages */}
        <div className='col-md-auto md:order-3'>
          <div className='row x-gap-20 y-gap-20 items-center md:d-none'>
            {renderPages()}
            {/* If greater than Total Pages */}
            {Math.ceil(+paginateTotalDataSize / +paginateDataPerPage) > totalPages + 1 &&
              currentMaxPage !==
                Math.ceil(+paginateTotalDataSize / +paginateDataPerPage) && (
                <div className='col-auto'>
                  <div className='size-40 flex-center rounded-full'>...</div>
                </div>
              )}
            {Math.ceil(+paginateTotalDataSize / +paginateDataPerPage) > totalPages &&
              currentMaxPage !==
                Math.ceil(+paginateTotalDataSize / +paginateDataPerPage) && (
                <div className='col-auto'>
                  <div
                    className='size-40 flex-center rounded-full cursor-pointer'
                    onClick={() =>
                      dispatch(
                        setPaginateDataNumber({
                          paginateDataNumber: paginateTotalDataSize,
                        })
                      )
                    }
                  >
                    {Math.ceil(+paginateTotalDataSize / +paginateDataPerPage)}
                  </div>
                </div>
              )}
          </div>

          <div className='row x-gap-10 y-gap-20 justify-center items-center d-none md:d-flex'>
            {renderPages()}
          </div>

          {/* <div className='text-center mt-30 md:mt-10'>
            <div className='text-14 text-light-1'>1 – 20 of 300+ properties found</div>
          </div> */}
        </div>

        {/* Right Chevron */}
        <div className='col-auto md:order-2' style={{ minWidth: '100px' }}>
          {paginateDataNumber < paginateTotalDataSize && (
            <button
              className='button -blue-1 size-40 rounded-full border-light'
              onClick={() => handlePageClick(currentPage + 1)}
            >
              <i className='icon-chevron-right text-12' />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pagination;

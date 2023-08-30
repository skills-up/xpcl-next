import React, { useState, forwardRef } from 'react';
import { useEffect } from 'react';
import { useTable, useSortBy, usePagination, useRowSelect } from 'react-table';
import { PageWithText, Page } from './pagination';
import {
  BsChevronLeft,
  BsChevronRight,
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
} from 'react-icons/bs';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FiDownload } from 'react-icons/fi';
import { jsonToCSV } from 'react-papaparse';
import { sendToast } from '../../utils/toastify';
import { downloadCSV as CSVDownloader } from '../../utils/fileDownloader';

const IndeterminateCheckbox = forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = React.useRef();
  const resolvedRef = ref || defaultRef;
  React.useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);
  return (
    <input
      type='checkbox'
      ref={resolvedRef}
      {...rest}
      className='form-checkbox h-4 w-4'
    />
  );
});

const Datatable = ({
  columns,
  data,
  style,
  downloadCSV = false,
  CSVName = 'Reports.csv',
  selection = false,
  onCheckboxClick = undefined,
  rowClick = undefined,
  _rowCount = undefined,
  getData = undefined,
  _pageSize = 10,
  _pageIndex = 0,
  dataFiltering = false,
  onPageSizeChange,
  fullData,
  onPaginate,
}) => {
  const [totalItems, SetTotalItems] = useState(0);
  let {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    selectedFlatRows,
    state: { pageIndex, pageSize, selectedRowIds },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: _pageSize },
    },
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      selection &&
        onCheckboxClick &&
        hooks.visibleColumns.push((columns) => [
          // Let's make a column for selection
          {
            id: 'selection',
            // The header can use the table's getToggleAllRowsSelectedProps method
            // to render a checkbox
            Header: ({ getToggleAllRowsSelectedProps }) => <div></div>,
            // The cell can use the individual row's getToggleRowSelectedProps method
            // to the render a checkbox
            Cell: ({ row }) => (
              <div
                onClick={() => {
                  onCheckboxClick(row);
                }}
              >
                <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} on />
              </div>
            ),
          },
          ...columns,
        ]);
      !selection &&
        hooks.visibleColumns.push((columns) => [
          // Let's make a column for selection
          ...columns,
        ]);
    }
  );
  if (_rowCount) {
    let value = _rowCount / pageSize;
    pageCount = Math.ceil(value);
    pageOptions = [];
    for (let i = 0; i < pageCount; i++) {
      pageOptions.push(i);
    }
    pageSize = _pageSize;
    pageIndex = _pageIndex;
    canNextPage = pageIndex < pageOptions.length - 1;
    canPreviousPage = pageIndex > 0;
  }

  useEffect(() => {
    if (_rowCount !== undefined) SetTotalItems(_rowCount);
    else {
      SetTotalItems(data.length);
    }
  }, [_rowCount, data]);

  useEffect(() => {
    if (dataFiltering) setPageSize(1000);
  }, []);

  // Render the UI for your table
  return data?.length > 0 ? (
    <div style={style}>
      {!dataFiltering && (
        <div className='d-flex mb-2 mr-4 justify-end'>
          <div className='col-lg-2 col-12'>
            <select
              className='d-block form-select text-sm'
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                onPageSizeChange(Number(e.target.value));
                if (getData) {
                  getData(pageIndex, pageIndex, Number(e.target.value), true);
                }
              }}
            >
              {[10, 25, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize} Rows
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      <div className='overflow-scroll scroll-bar-1'>
        <table {...getTableProps()} className='table-3'>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    <div
                      className={`d-flex items-center gap-2 ${
                        column.alignRight ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>{column.render('Header')}</span>
                      {/* Add a sort direction indicator */}
                      <span className=''>
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <FaChevronDown className='text-xxs' />
                          ) : (
                            <FaChevronUp className='text-xxs' />
                          )
                        ) : (
                          ''
                        )}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell, index) => {
                    return (
                      <td
                        onClick={() => {
                          if (index == 0) {
                            rowClick && rowClick(row);
                          }
                        }}
                        {...cell.getCellProps()}
                        style={
                          cell.column.removeMaxWidth
                            ? { verticalAlign: 'top', maxWidth: 'unset' }
                            : {
                                maxWidth: '12rem',
                                verticalAlign: 'top',
                              }
                        }
                        className={'max-w-xs break-all text-xs'}
                      >
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!dataFiltering && (
        <div className='row x-gap-10 y-gap-20 items-center justify-between md:justify-center mt-4 mb-2 mb-lg-3 m border-top-light mt-30 pt-30'>
          <div className='col-auto md:order-1 w-120'>
            {fullData?.current_page !== 1 && (
              <PageWithText
                onClick={async () => {
                  {
                    await onPaginate(true, 1);
                  }
                }}
                color='text-default'
              >
                <div className='mx-1'>
                  <button className='button -blue-1 size-40 rounded-full border-light'>
                    <BsChevronDoubleLeft className='text-lg' />
                  </button>
                </div>
              </PageWithText>
            )}
            {fullData?.prev_page_url && (
              <PageWithText
                onClick={async () => {
                  {
                    await onPaginate(true, fullData?.current_page - 1);
                  }
                }}
                color='text-default'
              >
                <div className='col-auto md:order-1 mx-1'>
                  <button className='button -blue-1 size-40 rounded-full border-light'>
                    <BsChevronLeft className='text-lg' />
                  </button>
                </div>
              </PageWithText>
            )}
          </div>
          <div className='col-md-auto md:order-3 text-center'>
            <span>
              Page{' '}
              <b>
                <input
                  type='number'
                  onWheel={(e) => e.target.blur()}
                  value={fullData?.current_page}
                  onChange={async (e) => {
                    const value = +e.target.value;
                    if (value >= 1 && value <= fullData?.last_page) {
                      await onPaginate(true, value);
                    }
                  }}
                  onFocus={(e) => {
                    e.target.select();
                  }}
                  className='form-control mx-1'
                  style={{
                    width: '30px',
                    textAlign: 'center',
                    fontWeight: '700',
                    display: 'inline',
                    padding: '0.2rem 0.3rem',
                    outline: '1px solid black',
                  }}
                />{' '}
                of {fullData?.last_page}
              </b>
              {' | '}
              Total Entries {' : '}
              <b>{fullData?.total}</b>
            </span>
          </div>
          <div className='col-auto md:order-2 w-120'>
            {fullData?.next_page_url && (
              <PageWithText
                onClick={async () => {
                  {
                    await onPaginate(true, fullData?.current_page + 1);
                  }
                }}
                color='text-default'
              >
                <div className='col-auto md:order-1 mx-1'>
                  <button className='button -blue-1 size-40 rounded-full border-light'>
                    <BsChevronRight className='text-lg' />
                  </button>
                </div>
              </PageWithText>
            )}
            {fullData?.current_page !== fullData?.last_page && (
              <PageWithText
                onClick={async () => {
                  {
                    await onPaginate(true, fullData?.last_page);
                  }
                }}
                color='text-default'
              >
                <div className='col-auto md:order-1 mx-1'>
                  <button className='button -blue-1 size-40 rounded-full border-light'>
                    <BsChevronDoubleRight className='text-lg' />
                  </button>
                </div>
              </PageWithText>
            )}
          </div>
        </div>
      )}
      {downloadCSV && (
        <div className='d-flex justify-center'>
          <button
            className='btn btn-primary d-flex items-center justify-between gap-1'
            onClick={() => {
              try {
                CSVDownloader(jsonToCSV(data), CSVName);
              } catch (err) {
                sendToast(
                  'error',
                  err?.message || err?.error || 'Error occurred while converting',
                  4000
                );
              }
            }}
          >
            <FiDownload className='text-20' />
            Download CSV
          </button>
        </div>
      )}
    </div>
  ) : (
    <div className='text-center'>No Records Found</div>
  );
};

export default Datatable;

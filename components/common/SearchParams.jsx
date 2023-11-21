import React, { useEffect, useState } from 'react';
import { BsDashSquare, BsPlusSquare } from 'react-icons/bs';
import { getList } from '../../api/xplorzApi';

const SearchParams = ({ paramsState, entity }) => {
  const [params, setParams] = paramsState;
  const [formOpen, setFormOpen] = useState(false);
  const [queries, setQueries] = useState([]);
  const [searchableColumns, setSearchableColumns] = useState({});

  useEffect(() => {
    getSearchableColumns();
  }, []);

  useEffect(() => {
    const searchableColumnNames = Object.keys(searchableColumns);
    const queries = Array(searchableColumnNames.length).fill('');
    params.forEach(({ col, value }) => {
      const idx = searchableColumnNames.indexOf(col);
      queries[idx] = value;
    });
    setQueries(queries);
  }, [searchableColumns]);

  const getSearchableColumns = async () => {
    const response = await getList('searchable-columns/' + entity);
    if (response?.success) {
      setSearchableColumns(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message ||
          response?.data?.error ||
          'Error getting searchable columns list',
        4000
      );
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const params = [];
    Object.keys(searchableColumns).forEach((key, idx) => {
      params.push({ col: key, value: queries[idx] });
    });
    setParams(params);
  };

  const clearForm = () => {
    setQueries((queries) => Array(queries.length).fill(''));
    setParams([]);
  }

  return (
    <div className='my-3 col-12 pr-0'>
      <h6 className='mb-3 d-flex justify-start items-center x-gap-5'>
        {formOpen ? (
          <BsDashSquare
            className='cursor-pointer text-blue-1 text-25'
            onClick={() => {
              setFormOpen((prev) => !prev);
            }}
          />
        ) : (
          <BsPlusSquare
            className='cursor-pointer text-blue-1 text-25'
            onClick={() => {
              setFormOpen((prev) => !prev);
            }}
          />
        )}
        <span>Search Columns</span>
      </h6>
      {formOpen && (
        <form onSubmit={onSubmit} className='row border-light rounded-4 px-10 py-10'>
          {Object.values(searchableColumns).map((label, idx) => (
            <div key={idx} className='col-12 col-md-4 col-lg-3 px-1 py-1 form-input'>
              <input
                onChange={(e) => {
                  const value = e.target.value;
                  setQueries((queries) => {
                    queries[idx] = value;
                    return [...queries];
                  });
                }}
                value={queries[idx]}
                placeholder=' '
              />
              <label className='lh-1 text-16 text-light-1'>{label}</label>
            </div>
          ))}
          <div className='d-flex justify-between x-gap-5 pl-0'>
            <button
              type='submit'
              className='col-6 button h-50 mx-1 my-1 -dark-1 bg-blue-1 text-white'
            >
              Search
            </button>
            <button
              type='reset'
              className='col-6 button h-50 mx-1 my-1 -dark-1 bg-red-1 text-white'
              onClick={clearForm}
            >
              Clear
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SearchParams;

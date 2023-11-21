import React from 'react';

const SearchParams = ({ queriesState, columns, setParams }) => {
  const [queries, setQueries] = queriesState;

  const onSubmit = (e) => {
    e.preventDefault();
    const params = [];
    Object.keys(columns).forEach((key, idx) => {
      params.push({ col: key, value: queries[idx] });
    });
    setParams(params);
  };

  return (
    <form onSubmit={onSubmit} className='row border-light rounded-4 px-30 py-30'>
      {Object.values(columns).map((label, idx) => (
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
          onClick={() => {
            setQueries(queries => Array(queries.length).fill(''));
            setParams([]);
          }}
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default SearchParams;

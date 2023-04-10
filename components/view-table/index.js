import { isValidElement, useEffect } from 'react';

const ViewTable = ({ data, onEdit, onDelete }) => {
  return (
    <div className='view-table'>
      <table>
        <tbody>
          {Object.keys(data).map((element, index) => {
            return (
              <tr key={index}>
                <td>
                  {element.split('_').map((str, index) => (
                    <span style={{ fontWeight: '700' }} key={index}>
                      {str.charAt(0).toUpperCase() + str.slice(1)}{' '}
                    </span>
                  ))}
                </td>
                <td>
                  {data[element] ? (
                    typeof data[element] === 'object' ? (
                      isValidElement(data[element]) ? (
                        data[element]
                      ) : (
                        <span>{JSON.stringify(data[element])}</span>
                      )
                    ) : (
                      <span>{data[element]}</span>
                    )
                  ) : (
                    <span>N/A</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className='mt-15 d-flex gap-2'>
        <button className='btn btn-primary' type='button' onClick={onEdit}>
          Edit
        </button>
        <button className='btn btn-danger' type='button' onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default ViewTable;

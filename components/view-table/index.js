import { useEffect } from 'react';

const ViewTable = ({ data }) => {
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
                      <span>{JSON.stringify(data[element])}</span>
                    ) : (
                      <span>{data[element] ? data[element] : 'qwe'}</span>
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
    </div>
  );
};

export default ViewTable;

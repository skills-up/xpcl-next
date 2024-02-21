import { isValidElement } from 'react';
import { BsTrash3 } from 'react-icons/bs';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { hasPermission } from '../../utils/permission-checker';

const ViewTable = ({
  data,
  onEdit,
  onDelete,
  extraButtons = undefined,
  showButtons = true,
  entitySlug = undefined,
}) => {
  const wordsToUpperCase = [
    'GST',
    'YQ',
    'IATA',
    'PLB',
    'TDS',
    'ITC',
    'PAN',
    'ID',
    'CGST',
    'SGST',
    'IGST',
    'GSTN',
    'PDF',
    'HSN',
    'PNR',
  ];

  return (
    <div className='view-table'>
      {showButtons && (
        <div className='mb-15 d-flex gap-2'>
          {(!entitySlug || hasPermission(entitySlug + '.update')) && (
            <button
              className='btn btn-primary d-flex items-center gap-1'
              type='button'
              onClick={onEdit}
            >
              <HiOutlinePencilAlt /> Edit
            </button>
          )}
          {(!entitySlug || hasPermission(entitySlug + '.destroy')) && (
            <button
              className='btn btn-danger d-flex items-center gap-1'
              type='button'
              onClick={onDelete}
            >
              <BsTrash3 /> Delete
            </button>
          )}
          {extraButtons &&
            extraButtons.map((element, index) => {
              return (
                <button
                  key={index}
                  onClick={element?.onClick}
                  className={`${element?.classNames} btn d-flex items-center gap-1`}
                  style={element?.style}
                >
                  {element?.icon} {element?.text}
                </button>
              );
            })}
        </div>
      )}
      <table>
        <tbody>
          {Object.keys(data).map((element, index) => {
            return (
              <tr key={index}>
                <td>
                  {element.split('_').map((str, index) => (
                    <span style={{ fontWeight: '700' }} key={index}>
                      {wordsToUpperCase.includes(str.toUpperCase())
                        ? str.toUpperCase()
                        : str.charAt(0).toUpperCase() + str.slice(1)}{' '}
                    </span>
                  ))}
                </td>
                <td>
                  {data[element] !== null && data[element] !== undefined ? (
                    typeof data[element] === 'object' ? (
                      isValidElement(data[element]) ? (
                        data[element]
                      ) : (
                        <span>{JSON.stringify(data[element])}</span>
                      )
                    ) : typeof data[element] === 'boolean' ? (
                      <span>{data[element] ? 'Yes' : 'No'}</span>
                    ) : (
                      <span>{data[element]}</span>
                    )
                  ) : (
                    <span style={{ color: 'rgb(70,70,70)', fontVariant: 'small-caps' }}>
                      null
                    </span>
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
